import { doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { TestDoc, TestScore } from '../types/test'

const COLLECTION = 'tests'

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured. Set VITE_FIREBASE_* env vars in .env.local.')
  }
  return db
}

export async function getTest(token: string): Promise<TestDoc | null> {
  const firestore = requireDb()
  const snapshot = await getDoc(doc(firestore, COLLECTION, token))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...(snapshot.data() as Omit<TestDoc, 'id'>) }
}

export function subscribeToTest(token: string, onChange: (test: TestDoc | null) => void): Unsubscribe {
  const firestore = requireDb()
  return onSnapshot(doc(firestore, COLLECTION, token), (snapshot) => {
    if (!snapshot.exists()) {
      onChange(null)
      return
    }
    onChange({ id: snapshot.id, ...(snapshot.data() as Omit<TestDoc, 'id'>) })
  })
}

export async function startTest(token: string): Promise<void> {
  const firestore = requireDb()
  await updateDoc(doc(firestore, COLLECTION, token), {
    status: 'in-progress',
    startedAt: serverTimestamp(),
  })
}

export async function submitTest(token: string, answers: Record<string, string>): Promise<TestScore> {
  const firestore = requireDb()
  const test = await getTest(token)
  if (!test) {
    throw new Error(`Test ${token} not found`)
  }

  const byCategory: Record<string, { correct: number; total: number }> = {}
  let correct = 0

  for (const question of test.questions) {
    const categoryTotals = byCategory[question.category] ?? { correct: 0, total: 0 }
    categoryTotals.total += 1
    const submitted = (answers[question.id] ?? '').trim().toLowerCase()
    const expected = (test.answerKey[question.id] ?? '').trim().toLowerCase()
    if (submitted === expected) {
      categoryTotals.correct += 1
      correct += 1
    }
    byCategory[question.category] = categoryTotals
  }

  const score: TestScore = { correct, total: test.questions.length, byCategory }

  await updateDoc(doc(firestore, COLLECTION, token), {
    status: 'completed',
    completedAt: serverTimestamp(),
    answers,
    score,
  })

  return score
}
