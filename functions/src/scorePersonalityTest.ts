import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { Resend } from 'resend'
import type {
  HexacoDimension,
  MotivationFacet,
  PersonalityScoringKeyEntry,
} from './data/personalityQuestionBank'
import { syncBundleStatus, syncCandidateCompletion } from './testGenerationHelpers'
import { formatPersonalityCompletionEmail } from './personalityReportCopy'
import { logResendUsage } from './usageLogging'

const resendApiKey = defineSecret('RESEND_API_KEY')

interface ScorePersonalityTestRequest {
  testId: string
}

type TraitBand = 'low' | 'average' | 'high'

interface TraitResult {
  mean: number
  band: TraitBand
}

interface CandidateNotificationData {
  createdBy?: string
  recruiterEmail?: string
}

const HEXACO_DIMENSIONS: HexacoDimension[] = [
  'honestyHumility',
  'emotionality',
  'extraversion',
  'agreeableness',
  'conscientiousness',
  'openness',
]

const MOTIVATION_FACETS: MotivationFacet[] = ['achievement', 'autonomy', 'collaboration']

function toBand(mean: number): TraitBand {
  if (mean < 2.8) return 'low'
  if (mean >= 4.0) return 'high'
  return 'average'
}

function scoreValue(raw: number, keyed: 'positive' | 'negative'): number {
  return keyed === 'negative' ? 6 - raw : raw
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export const scorePersonalityTest = onCall<ScorePersonalityTestRequest>(
  { secrets: [resendApiKey] },
  async (request) => {
    const { testId } = request.data

    if (!testId || typeof testId !== 'string') {
      throw new HttpsError('invalid-argument', 'testId is required.')
    }

    const db = getFirestore()
    const testRef = db.collection('tests').doc(testId)
    const privateRef = testRef.collection('private').doc('scoringKey')

    const [testSnap, privateSnap] = await Promise.all([testRef.get(), privateRef.get()])

    if (!testSnap.exists) {
      throw new HttpsError('not-found', `Test ${testId} not found.`)
    }

    const testData = testSnap.data()!
    if (testData.testType !== 'personality') {
      throw new HttpsError('failed-precondition', 'This test is not a personality assessment.')
    }

    if (testData.status === 'completed') {
      return { personalityScore: testData.personalityScore }
    }

    if (!privateSnap.exists) {
      throw new HttpsError('failed-precondition', 'Scoring key not found for this test.')
    }

    const candidateId = testData.candidateId as string
    const bundleId = testData.bundleId as string | null | undefined
    const scoringKey = privateSnap.data()!.key as Record<string, PersonalityScoringKeyEntry>
    const answers = (testData.answers ?? {}) as Record<string, string>

    const dimensionScores = {} as Record<HexacoDimension, number[]>
    for (const dimension of HEXACO_DIMENSIONS) {
      dimensionScores[dimension] = []
    }

    const motivationScores = {} as Record<MotivationFacet, number[]>
    for (const facet of MOTIVATION_FACETS) {
      motivationScores[facet] = []
    }

    const validityRaw: number[] = []
    const pairAnswers: Record<string, number[]> = {}

    for (const [questionId, meta] of Object.entries(scoringKey)) {
      const rawAnswer = Number.parseInt(answers[questionId] ?? '', 10)
      if (!Number.isFinite(rawAnswer) || rawAnswer < 1 || rawAnswer > 5) continue

      const scored = scoreValue(rawAnswer, meta.keyed)

      if (meta.isValidityItem) {
        validityRaw.push(scored)
      }

      if (meta.consistencyPairId) {
        const pair = pairAnswers[meta.consistencyPairId] ?? []
        pair.push(scored)
        pairAnswers[meta.consistencyPairId] = pair
      }

      if (meta.dimension === 'motivation' && meta.facet) {
        motivationScores[meta.facet].push(scored)
      } else if (meta.dimension !== 'motivation') {
        dimensionScores[meta.dimension as HexacoDimension].push(scored)
      }
    }

    const dimensions = Object.fromEntries(
      HEXACO_DIMENSIONS.map((dimension) => {
        const mean = average(dimensionScores[dimension])
        return [dimension, { mean, band: toBand(mean) satisfies TraitBand }]
      }),
    ) as Record<HexacoDimension, TraitResult>

    const motivation = Object.fromEntries(
      MOTIVATION_FACETS.map((facet) => {
        const mean = average(motivationScores[facet])
        return [facet, { mean, band: toBand(mean) satisfies TraitBand }]
      }),
    ) as Record<MotivationFacet, TraitResult>

    const socialDesirability = average(validityRaw)

    let maxInconsistency = 0
    for (const pair of Object.values(pairAnswers)) {
      if (pair.length >= 2) {
        const diff = Math.abs(pair[0] - pair[1])
        if (diff > maxInconsistency) maxInconsistency = diff
      }
    }

    const flags: string[] = []
    if (validityRaw.length > 0 && socialDesirability > 4.2) {
      flags.push('social_desirability')
    }
    if (maxInconsistency >= 3) {
      flags.push('inconsistent_responses')
    }

    const personalityScore = {
      dimensions,
      motivation,
      validity: {
        socialDesirability,
        inconsistency: maxInconsistency,
        flags,
      },
    }

    await testRef.update({
      status: 'completed',
      completedAt: FieldValue.serverTimestamp(),
      personalityScore,
    })

    if (bundleId) {
      await syncBundleStatus(bundleId)
    }

    const candidateSnap = await db.collection('candidates').doc(candidateId).get()
    const candidateData = (candidateSnap.data() ?? {}) as CandidateNotificationData
    await syncCandidateCompletion(candidateId, bundleId)

    await createInAppNotification(db, candidateId, testId, testData.candidateName as string, candidateData)
    await sendRecruiterNotification(
      resendApiKey.value(),
      candidateId,
      testId,
      testData.candidateName as string,
      personalityScore,
      candidateData,
    )

    return { personalityScore }
  },
)

async function createInAppNotification(
  db: FirebaseFirestore.Firestore,
  candidateId: string,
  testId: string,
  candidateName: string,
  candidateData: CandidateNotificationData,
): Promise<void> {
  const createdBy = candidateData.createdBy
  if (!createdBy) return

  await db.collection('users').doc(createdBy).collection('notifications').add({
    type: 'test_completed',
    candidateId,
    candidateName,
    testId,
    message: `${candidateName} completed their personality assessment`,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  })
}

async function sendRecruiterNotification(
  apiKey: string,
  candidateId: string,
  testId: string,
  candidateName: string,
  personalityScore: {
    dimensions: Record<HexacoDimension, TraitResult>
    motivation: Record<MotivationFacet, TraitResult>
    validity: {
      socialDesirability: number
      inconsistency: number
      flags: string[]
    }
  },
  candidateData: CandidateNotificationData,
): Promise<void> {
  const recruiterEmail = candidateData.recruiterEmail?.trim() || process.env.RECRUITER_EMAIL

  if (!recruiterEmail) {
    console.warn(
      'No recruiter email on candidate and RECRUITER_EMAIL is not set — skipping recruiter notification.',
    )
    return
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const appUrl = process.env.APP_URL
  const candidateLink = appUrl ? `${appUrl}/recruiter/candidates/${candidateId}` : null

  const text = formatPersonalityCompletionEmail(candidateName, personalityScore, candidateLink)

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: fromEmail,
    to: recruiterEmail,
    subject: `Personality assessment complete: ${candidateName}`,
    text,
  })

  await logResendUsage({
    type: 'resend_test_completed',
    candidateId,
    testId,
    createdBy: candidateData.createdBy,
  })
}
