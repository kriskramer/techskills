import { getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { Resend } from 'resend'
import { assertCandidateAccess, requireAuth } from './authHelpers'
import type { TestType } from './data/personalityQuestionBank'
import {
  buildAssessmentInviteEmailBody,
  TEST_TYPE_EMAIL_LABELS,
  type AssessmentInviteEntry,
} from './inviteEmailBody'
import {
  assertInviteSendAllowed,
  buildInviteIdempotencyKey,
  inviteSendUpdateFields,
} from './inviteThrottle'
import { logResendUsage } from './usageLogging'

const resendApiKey = defineSecret('RESEND_API_KEY')

interface SendAssessmentInvitationRequest {
  candidateId: string
  bundleId: string
  appOrigin: string
}

function questionCountForTest(testData: FirebaseFirestore.DocumentData): number {
  if (testData.testType === 'personality') {
    return (testData.personalityQuestions as unknown[] | undefined)?.length ?? 0
  }
  return (testData.questions as unknown[] | undefined)?.length ?? 0
}

export const sendAssessmentInvitation = onCall<SendAssessmentInvitationRequest>(
  { secrets: [resendApiKey] },
  async (request) => {
    requireAuth(request)

    const { candidateId, bundleId, appOrigin } = request.data

    if (!candidateId || typeof candidateId !== 'string') {
      throw new HttpsError('invalid-argument', 'candidateId is required.')
    }
    if (!bundleId || typeof bundleId !== 'string') {
      throw new HttpsError('invalid-argument', 'bundleId is required.')
    }
    if (!appOrigin || typeof appOrigin !== 'string') {
      throw new HttpsError('invalid-argument', 'appOrigin is required.')
    }

    const db = getFirestore()
    const candidateRef = db.collection('candidates').doc(candidateId)
    const bundleRef = db.collection('assessmentBundles').doc(bundleId)

    const [candidateSnap, bundleSnap] = await Promise.all([candidateRef.get(), bundleRef.get()])

    if (!candidateSnap.exists) {
      throw new HttpsError('not-found', `Candidate ${candidateId} not found.`)
    }
    if (!bundleSnap.exists) {
      throw new HttpsError('not-found', `Assessment bundle ${bundleId} not found.`)
    }

    assertCandidateAccess(request, candidateSnap.data())

    const bundleData = bundleSnap.data()!
    if (bundleData.candidateId !== candidateId) {
      throw new HttpsError('permission-denied', 'This bundle does not belong to this candidate.')
    }

    const { name, email, recruiterName, recruiterCompany, hiringCompany } = candidateSnap.data() as {
      name: string
      email: string
      recruiterName?: string
      recruiterCompany?: string
      hiringCompany?: string
    }

    const claimResult = await db.runTransaction(async (transaction) => {
      const freshBundleSnap = await transaction.get(bundleRef)
      if (!freshBundleSnap.exists) {
        throw new HttpsError('not-found', `Assessment bundle ${bundleId} not found.`)
      }

      const throttle = assertInviteSendAllowed(freshBundleSnap.data()!)
      transaction.update(bundleRef, inviteSendUpdateFields(throttle.sentAtMs))
      return throttle
    })

    const testIds = bundleData.testIds as Partial<Record<TestType, string>>
    const testTypes = (bundleData.testTypes ?? []) as TestType[]
    const origin = appOrigin.replace(/\/$/, '')
    const homeUrl = `${origin}/recruit/tests`

    const assessments: AssessmentInviteEntry[] = []
    for (const testType of testTypes) {
      const testId = testIds[testType]
      if (!testId) continue

      const testSnap = await db.collection('tests').doc(testId).get()
      if (!testSnap.exists) continue

      const testData = testSnap.data()!
      assessments.push({
        testType,
        label: TEST_TYPE_EMAIL_LABELS[testType],
        durationMinutes: (testData.durationMinutes as number | undefined) ?? 15,
        timed: testType === 'technical',
        questionCount: questionCountForTest(testData),
        url: `${origin}/test/${testId}`,
      })
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const idempotencyKey = buildInviteIdempotencyKey(bundleId, claimResult.sentAtMs)

    const resend = new Resend(resendApiKey.value())
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your Praxis assessments are ready',
      text: buildAssessmentInviteEmailBody({
        candidateName: name,
        homeUrl,
        assessments,
        recruiterName,
        recruiterCompany,
        hiringCompany,
      }),
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    })

    if (error) {
      throw new HttpsError('internal', `Failed to send email: ${error.message}`)
    }

    await logResendUsage({
      type: 'resend_invitation',
      candidateId,
      testId: bundleId,
      createdBy: request.auth?.uid,
      invitationSendCount: claimResult.nextCount,
    })

    return { success: true, invitationSendCount: claimResult.nextCount }
  },
)
