import { randomUUID } from 'node:crypto'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { TIME_LIMIT_BY_DIFFICULTY } from './data/questionBank'
import type { SkillsProfile } from './schemas/skillsProfile'
import { pickQuestionsForProfile } from './testQuestionAllocation'
import { assertCandidateAccess, requireAuth } from './authHelpers'
import { parseTestDifficultyPreset, type TestDifficultyPreset } from './testDifficulty'

interface GenerateTestProfileRequest {
  candidateId: string
  categoryCounts?: Record<string, number>
  difficulty?: TestDifficultyPreset
  forceRegenerate?: boolean
}

function isActiveTest(data: FirebaseFirestore.DocumentData): boolean {
  if (data.status !== 'pending' && data.status !== 'in-progress') {
    return false
  }
  const expiresAt = data.expiresAt as Timestamp | undefined
  if (expiresAt && expiresAt.toDate() < new Date()) {
    return false
  }
  return true
}

export const generateTestProfile = onCall<GenerateTestProfileRequest>(
  { invoker: 'public' },
  async (request) => {
    requireAuth(request)

    const { candidateId, categoryCounts, difficulty: difficultyInput, forceRegenerate = false } = request.data

  if (!candidateId || typeof candidateId !== 'string') {
    throw new HttpsError('invalid-argument', 'candidateId is required.')
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

  if (skills.length === 0) {
    throw new HttpsError('failed-precondition', 'Candidate has not been analyzed yet.')
  }

  const existingTestId = candidate.testId as string | null | undefined
  if (!forceRegenerate && existingTestId) {
    const existingTestSnap = await db.collection('tests').doc(existingTestId).get()
    if (existingTestSnap.exists && isActiveTest(existingTestSnap.data()!)) {
      throw new HttpsError(
        'failed-precondition',
        'An active test already exists for this candidate. Cancel it or confirm regeneration.',
      )
    }
  }

  const difficulty = parseTestDifficultyPreset(difficultyInput)
  const questions = pickQuestionsForProfile(skills, categoryCounts, difficulty)
  const answerKey: Record<string, string> = {}
  const testQuestions = questions.map((question) => {
    answerKey[question.id] = question.correctAnswer
    return {
      id: question.id,
      category: question.category,
      prompt: question.prompt,
      type: question.type,
      options: question.options ? shuffle(question.options) : null,
      difficulty: question.difficulty,
      timeLimitSeconds: TIME_LIMIT_BY_DIFFICULTY[question.difficulty],
      skills: question.skills,
    }
  })

  const durationMinutes = Math.ceil(
    testQuestions.reduce((total, question) => total + question.timeLimitSeconds, 0) / 60,
  )

  const token = randomUUID()
  const testRef = db.collection('tests').doc(token)
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

  await testRef.set({
    candidateId,
    candidateName: (candidate.name as string | undefined) ?? '',
    questions: testQuestions,
    durationMinutes,
    status: 'pending',
    startedAt: null,
    completedAt: null,
    expiresAt,
    answers: {},
    score: null,
    createdAt: FieldValue.serverTimestamp(),
  })

  await testRef.collection('private').doc('answerKey').set({ key: answerKey })

  await candidateRef.update({
    testId: token,
    status: 'invited',
    reviewedAt: null,
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { token }
})

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
