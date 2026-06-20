import { randomUUID } from 'node:crypto'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { TIME_LIMIT_BY_DIFFICULTY } from './data/questionBank'
import type { SkillsProfile } from './schemas/skillsProfile'
import { pickQuestionsForProfile } from './testQuestionAllocation'
import { assertCandidateAccess, requireAuth } from './authHelpers'

interface ExtendTestInviteRequest {
  testId: string
  action: 'extend' | 'regenerate'
}

export const extendTestInvite = onCall<ExtendTestInviteRequest>({ invoker: 'public' }, async (request) => {
  requireAuth(request)

  const { testId, action } = request.data

  if (!testId || typeof testId !== 'string') {
    throw new HttpsError('invalid-argument', 'testId is required.')
  }
  if (action !== 'extend' && action !== 'regenerate') {
    throw new HttpsError('invalid-argument', 'action must be "extend" or "regenerate".')
  }

  const db = getFirestore()
  const testRef = db.collection('tests').doc(testId)
  const testSnap = await testRef.get()

  if (!testSnap.exists) {
    throw new HttpsError('not-found', `Test ${testId} not found.`)
  }

  const testData = testSnap.data()!
  if (testData.status === 'completed') {
    throw new HttpsError('failed-precondition', 'Cannot modify a completed test invite.')
  }

  const candidateId = testData.candidateId as string
  const candidateSnap = await db.collection('candidates').doc(candidateId).get()
  if (!candidateSnap.exists) {
    throw new HttpsError('not-found', `Candidate ${candidateId} not found.`)
  }

  assertCandidateAccess(request, candidateSnap.data())

  if (action === 'extend') {
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    await testRef.update({
      expiresAt,
      status: 'pending',
    })

    await db.collection('candidates').doc(candidateId).update({
      status: 'invited',
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { token: testId, action }
  }

  const candidate = candidateSnap.data() ?? {}
  const skills = (candidate.skillsProfile?.skills ?? []) as SkillsProfile['skills']
  if (skills.length === 0) {
    throw new HttpsError('failed-precondition', 'Candidate has not been analyzed yet.')
  }

  const token = await createReplacementTest(db, candidateId, candidate, skills)
  return { token, action }
})

async function createReplacementTest(
  db: FirebaseFirestore.Firestore,
  candidateId: string,
  candidate: FirebaseFirestore.DocumentData,
  skills: SkillsProfile['skills'],
): Promise<string> {
  const questions = pickQuestionsForProfile(skills)
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
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

  await db.collection('tests').doc(token).set({
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

  await db.collection('tests').doc(token).collection('private').doc('answerKey').set({ key: answerKey })

  await db.collection('candidates').doc(candidateId).update({
    testId: token,
    status: 'invited',
    reviewedAt: null,
    updatedAt: FieldValue.serverTimestamp(),
  })

  return token
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
