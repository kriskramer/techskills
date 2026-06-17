import { randomUUID } from 'node:crypto'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { QUESTION_BANK, TIME_LIMIT_BY_DIFFICULTY } from './data/questionBank'
import type { QuestionBankEntry } from './data/questionBank'
import type { QuestionCategory } from './types'

const QUESTIONS_PER_TEST = 50
const CATEGORIES: QuestionCategory[] = ['CSharp', 'DotNet', 'SQL']

interface GenerateTestProfileRequest {
  candidateId: string
}

interface SkillsProfileSkill {
  category: QuestionCategory
}

export const generateTestProfile = onCall<GenerateTestProfileRequest>(
  { invoker: 'public' },
  async (request) => {
    const { candidateId } = request.data

  if (!candidateId || typeof candidateId !== 'string') {
    throw new HttpsError('invalid-argument', 'candidateId is required.')
  }

  const db = getFirestore()
  const candidateRef = db.collection('candidates').doc(candidateId)
  const snapshot = await candidateRef.get()

  if (!snapshot.exists) {
    throw new HttpsError('not-found', `Candidate ${candidateId} not found.`)
  }

  const candidate = snapshot.data() ?? {}
  const skills = (candidate.skillsProfile?.skills ?? []) as SkillsProfileSkill[]

  if (skills.length === 0) {
    throw new HttpsError('failed-precondition', 'Candidate has not been analyzed yet.')
  }

  const categoryCounts: Record<QuestionCategory, number> = { CSharp: 0, DotNet: 0, SQL: 0 }
  for (const skill of skills) {
    if (skill.category in categoryCounts) {
      categoryCounts[skill.category] += 1
    }
  }

  const questions = pickQuestions(categoryCounts)
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
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { token }
})

// Picks a fixed-size subset of the seed bank, weighted toward the categories
// the candidate has the most skills in (falling back to an even split if the
// skills profile has no recognized categories).
function pickQuestions(categoryCounts: Record<QuestionCategory, number>): QuestionBankEntry[] {
  const totalSkills = CATEGORIES.reduce((sum, category) => sum + categoryCounts[category], 0)

  const allocations: Record<QuestionCategory, number> = { CSharp: 0, DotNet: 0, SQL: 0 }
  for (const category of CATEGORIES) {
    allocations[category] =
      totalSkills === 0
        ? Math.floor(QUESTIONS_PER_TEST / CATEGORIES.length)
        : Math.round((categoryCounts[category] / totalSkills) * QUESTIONS_PER_TEST)
  }

  const selected: QuestionBankEntry[] = []
  for (const category of CATEGORIES) {
    const pool = QUESTION_BANK.filter((question) => question.category === category)
    const count = Math.min(allocations[category], pool.length)
    selected.push(...shuffle(pool).slice(0, count))
  }

  if (selected.length < QUESTIONS_PER_TEST) {
    const usedIds = new Set(selected.map((question) => question.id))
    const remaining = shuffle(QUESTION_BANK.filter((question) => !usedIds.has(question.id)))
    selected.push(...remaining.slice(0, QUESTIONS_PER_TEST - selected.length))
  }

  return selected
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
