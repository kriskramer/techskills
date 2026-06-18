import { randomUUID } from 'node:crypto'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { QUESTION_BANK, TIME_LIMIT_BY_DIFFICULTY } from './data/questionBank'
import type { QuestionBankEntry } from './data/questionBank'
import type { QuestionCategory } from './types'

const QUESTIONS_PER_TEST = 50
const CATEGORIES: QuestionCategory[] = ['CSharp', 'DotNet', 'SQL', 'JavaScript', 'TypeScript', 'Angular', 'Vue', 'React', 'NodeJS']

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

  const categoryCounts = Object.fromEntries(CATEGORIES.map(c => [c, 0])) as Record<QuestionCategory, number>
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

  const allocations = Object.fromEntries(CATEGORIES.map(c => [c, 0])) as Record<QuestionCategory, number>

  if (totalSkills === 0) {
    // Even split across all categories using largest remainder method
    const baseCount = Math.floor(QUESTIONS_PER_TEST / CATEGORIES.length)
    const remainder = QUESTIONS_PER_TEST % CATEGORIES.length
    for (const cat of CATEGORIES) {
      allocations[cat] = baseCount
    }
    for (let i = 0; i < remainder; i++) {
      allocations[CATEGORIES[i]] += 1
    }
  } else {
    // Proportional split with largest remainder method to ensure we get exactly 50 questions
    let allocatedSum = 0
    const remainders: { category: QuestionCategory; remainder: number }[] = []

    for (const category of CATEGORIES) {
      const exact = (categoryCounts[category] / totalSkills) * QUESTIONS_PER_TEST
      const floorVal = Math.floor(exact)
      allocations[category] = floorVal
      allocatedSum += floorVal
      remainders.push({ category, remainder: exact - floorVal })
    }

    // Sort by remainder descending
    remainders.sort((a, b) => b.remainder - a.remainder)

    // Distribute remainders
    let index = 0
    while (allocatedSum < QUESTIONS_PER_TEST) {
      const cat = remainders[index % remainders.length].category
      allocations[cat] += 1
      allocatedSum += 1
      index++
    }
  }

  const selected: QuestionBankEntry[] = []
  for (const category of CATEGORIES) {
    const pool = QUESTION_BANK.filter((question) => question.category === category)
    const count = Math.min(allocations[category], pool.length)
    selected.push(...shuffle(pool).slice(0, count))
  }

  // Fallback in case a category pool is smaller than allocated
  if (selected.length < QUESTIONS_PER_TEST) {
    const usedIds = new Set(selected.map((question) => question.id))
    const remaining = shuffle(QUESTION_BANK.filter((question) => !usedIds.has(question.id)))
    selected.push(...remaining.slice(0, QUESTIONS_PER_TEST - selected.length))
  }

  // Shuffle the final list of questions so they are interleaved, not grouped by category
  return shuffle(selected)
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
