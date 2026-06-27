import { randomUUID } from 'node:crypto'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import type { SkillsProfile } from './schemas/skillsProfile'
import { assertCandidateAccess, requireAuth } from './authHelpers'
import { type TestType } from './data/personalityQuestionBank'
import {
  buildExpiresAt,
  createPersonalityTest,
  createTechnicalTest,
  isActiveBundle,
} from './testGenerationHelpers'
import { parseTestDifficultyPreset, type TestDifficultyPreset } from './testDifficulty'

interface GenerateAssessmentsRequest {
  candidateId: string
  testTypes: TestType[]
  categoryCounts?: Record<string, number>
  difficulty?: TestDifficultyPreset
  forceRegenerate?: boolean
}

const VALID_TEST_TYPES: TestType[] = ['technical', 'personality', 'cognitive']

export const generateAssessments = onCall<GenerateAssessmentsRequest>(
  { invoker: 'public' },
  async (request) => {
    requireAuth(request)

    const {
      candidateId,
      testTypes,
      categoryCounts,
      difficulty: difficultyInput,
      forceRegenerate = false,
    } = request.data

    if (!candidateId || typeof candidateId !== 'string') {
      throw new HttpsError('invalid-argument', 'candidateId is required.')
    }

    if (!Array.isArray(testTypes) || testTypes.length === 0) {
      throw new HttpsError('invalid-argument', 'At least one test type is required.')
    }

    const uniqueTypes = [...new Set(testTypes)]
    for (const type of uniqueTypes) {
      if (!VALID_TEST_TYPES.includes(type)) {
        throw new HttpsError('invalid-argument', `Invalid test type: ${type}`)
      }
    }

    if (uniqueTypes.includes('cognitive')) {
      throw new HttpsError('unimplemented', 'Cognitive assessments are not available yet.')
    }

    const db = getFirestore()
    const candidateRef = db.collection('candidates').doc(candidateId)
    const snapshot = await candidateRef.get()

    if (!snapshot.exists) {
      throw new HttpsError('not-found', `Candidate ${candidateId} not found.`)
    }

    assertCandidateAccess(request, snapshot.data())

    const candidate = snapshot.data() ?? {}
    const skills = (candidate.skillsProfile?.skills ?? []) as SkillsProfile['skills']
    const candidateName = (candidate.name as string | undefined) ?? ''

    if (uniqueTypes.includes('technical') && skills.length === 0) {
      throw new HttpsError('failed-precondition', 'Candidate has not been analyzed yet.')
    }

    const existingBundleId = candidate.activeBundleId as string | null | undefined
    if (!forceRegenerate && existingBundleId) {
      const existingBundleSnap = await db.collection('assessmentBundles').doc(existingBundleId).get()
      if (existingBundleSnap.exists && isActiveBundle(existingBundleSnap.data()!)) {
        throw new HttpsError(
          'failed-precondition',
          'An active assessment bundle already exists for this candidate. Cancel it or confirm regeneration.',
        )
      }
    }

    const difficulty = parseTestDifficultyPreset(difficultyInput)
    const bundleId = randomUUID()
    const expiresAt = buildExpiresAt()
    const testIds: Partial<Record<TestType, string>> = {}
    let primaryTestId: string | null = null

    if (uniqueTypes.includes('technical')) {
      const result = await createTechnicalTest({
        candidateId,
        candidateName,
        skills,
        bundleId,
        categoryCounts,
        difficulty,
      })
      testIds.technical = result.token
      primaryTestId = result.token
    }

    if (uniqueTypes.includes('personality')) {
      const result = await createPersonalityTest({ candidateId, candidateName, bundleId })
      testIds.personality = result.token
      if (!primaryTestId) primaryTestId = result.token
    }

    await db.collection('assessmentBundles').doc(bundleId).set({
      candidateId,
      testTypes: uniqueTypes,
      testIds,
      status: 'pending',
      expiresAt,
      createdAt: FieldValue.serverTimestamp(),
      lastInvitationSentAt: null,
      invitationSendCount: 0,
    })

    await candidateRef.update({
      activeBundleId: bundleId,
      testId: primaryTestId,
      status: 'invited',
      reviewedAt: null,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { bundleId, testIds, primaryTestId }
  },
)
