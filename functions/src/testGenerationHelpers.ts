import { randomUUID } from 'node:crypto'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { TIME_LIMIT_BY_DIFFICULTY } from './data/questionBank'
import {
  buildPersonalityScoringKey,
  type PersonalityQuestionBankEntry,
  type TestType,
} from './data/personalityQuestionBank'
import type { SkillsProfile } from './schemas/skillsProfile'
import { estimatePersonalityDurationMinutes, pickPersonalityQuestions } from './personalityQuestionAllocation'
import { pickQuestionsForProfile } from './testQuestionAllocation'
import type { TestDifficultyPreset } from './testDifficulty'

const BUNDLE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildExpiresAt(): Timestamp {
  return Timestamp.fromDate(new Date(Date.now() + BUNDLE_EXPIRY_MS))
}

export interface CreateTechnicalTestParams {
  candidateId: string
  candidateName: string
  skills: SkillsProfile['skills']
  bundleId: string
  categoryCounts?: Record<string, number>
  difficulty: TestDifficultyPreset
}

export interface CreateTechnicalTestResult {
  token: string
  durationMinutes: number
}

export async function createTechnicalTest(params: CreateTechnicalTestParams): Promise<CreateTechnicalTestResult> {
  const db = getFirestore()
  const questions = pickQuestionsForProfile(params.skills, params.categoryCounts, params.difficulty)
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
  const expiresAt = buildExpiresAt()

  await testRef.set({
    candidateId: params.candidateId,
    candidateName: params.candidateName,
    testType: 'technical' satisfies TestType,
    bundleId: params.bundleId,
    questions: testQuestions,
    durationMinutes,
    status: 'pending',
    startedAt: null,
    completedAt: null,
    expiresAt,
    answers: {},
    score: null,
    questionBreakdown: null,
    createdAt: FieldValue.serverTimestamp(),
  })

  await testRef.collection('private').doc('answerKey').set({ key: answerKey })

  return { token, durationMinutes }
}

export interface CreatePersonalityTestParams {
  candidateId: string
  candidateName: string
  bundleId: string
}

export interface CreatePersonalityTestResult {
  token: string
  durationMinutes: number
  questionCount: number
}

function toClientPersonalityQuestions(questions: PersonalityQuestionBankEntry[]) {
  return questions.map(({ id, prompt, dimension, facet, keyed, isValidityItem, consistencyPairId }) => ({
    id,
    prompt,
    dimension,
    keyed,
    ...(facet != null ? { facet } : {}),
    ...(isValidityItem != null ? { isValidityItem } : {}),
    ...(consistencyPairId != null ? { consistencyPairId } : {}),
  }))
}

export async function createPersonalityTest(params: CreatePersonalityTestParams): Promise<CreatePersonalityTestResult> {
  const db = getFirestore()
  const bankQuestions = pickPersonalityQuestions()
  const personalityQuestions = toClientPersonalityQuestions(bankQuestions)
  const scoringKey = buildPersonalityScoringKey(bankQuestions)
  const durationMinutes = estimatePersonalityDurationMinutes()

  const token = randomUUID()
  const testRef = db.collection('tests').doc(token)
  const expiresAt = buildExpiresAt()

  await testRef.set({
    candidateId: params.candidateId,
    candidateName: params.candidateName,
    testType: 'personality' satisfies TestType,
    bundleId: params.bundleId,
    questions: [],
    personalityQuestions,
    durationMinutes,
    status: 'pending',
    startedAt: null,
    completedAt: null,
    expiresAt,
    answers: {},
    score: null,
    personalityScore: null,
    questionBreakdown: null,
    createdAt: FieldValue.serverTimestamp(),
  })

  await testRef.collection('private').doc('scoringKey').set({ key: scoringKey })

  return { token, durationMinutes, questionCount: personalityQuestions.length }
}

export function isActiveBundle(data: FirebaseFirestore.DocumentData): boolean {
  if (data.status !== 'pending' && data.status !== 'in-progress') {
    return false
  }
  const expiresAt = data.expiresAt as Timestamp | undefined
  if (expiresAt && expiresAt.toDate() < new Date()) {
    return false
  }
  return true
}

export function isActiveTest(data: FirebaseFirestore.DocumentData): boolean {
  if (data.status !== 'pending' && data.status !== 'in-progress') {
    return false
  }
  const expiresAt = data.expiresAt as Timestamp | undefined
  if (expiresAt && expiresAt.toDate() < new Date()) {
    return false
  }
  return true
}

export async function syncBundleStatus(bundleId: string): Promise<void> {
  const db = getFirestore()
  const bundleRef = db.collection('assessmentBundles').doc(bundleId)
  const bundleSnap = await bundleRef.get()
  if (!bundleSnap.exists) return

  const bundleData = bundleSnap.data()!
  const testIds = Object.values(bundleData.testIds ?? {}) as string[]
  if (testIds.length === 0) return

  const testSnaps = await Promise.all(testIds.map((id) => db.collection('tests').doc(id).get()))
  const statuses = testSnaps.filter((snap) => snap.exists).map((snap) => snap.data()!.status as string)

  let status: string
  if (statuses.every((s) => s === 'completed')) {
    status = 'completed'
  } else if (statuses.some((s) => s === 'in-progress' || s === 'completed')) {
    status = 'in-progress'
  } else {
    status = 'pending'
  }

  await bundleRef.update({ status, updatedAt: FieldValue.serverTimestamp() })
}

export async function syncCandidateCompletion(candidateId: string, bundleId: string | null | undefined): Promise<void> {
  const db = getFirestore()
  const candidateRef = db.collection('candidates').doc(candidateId)

  if (!bundleId) {
    await candidateRef.update({ status: 'completed', updatedAt: FieldValue.serverTimestamp() })
    return
  }

  const bundleSnap = await db.collection('assessmentBundles').doc(bundleId).get()
  if (!bundleSnap.exists) {
    await candidateRef.update({ status: 'completed', updatedAt: FieldValue.serverTimestamp() })
    return
  }

  const bundleData = bundleSnap.data()!
  const testIds = Object.values(bundleData.testIds ?? {}) as string[]
  const testSnaps = await Promise.all(testIds.map((id) => db.collection('tests').doc(id).get()))
  const allCompleted = testSnaps.every((snap) => snap.exists && snap.data()!.status === 'completed')

  if (allCompleted) {
    await candidateRef.update({ status: 'completed', updatedAt: FieldValue.serverTimestamp() })
  } else {
    await candidateRef.update({ status: 'invited', updatedAt: FieldValue.serverTimestamp() })
  }
}
