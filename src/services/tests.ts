import { collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { scoreTest } from './functions'
import type { TestDoc } from '../types/test'

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

export async function saveAnswer(token: string, questionId: string, answer: string): Promise<void> {
  const firestore = requireDb()
  await updateDoc(doc(firestore, COLLECTION, token), {
    [`answers.${questionId}`]: answer,
  })
}

export async function submitTest(token: string): Promise<void> {
  await scoreTest(token)
}

export function subscribeToTestsForCandidate(
  candidateId: string,
  onChange: (tests: TestDoc[]) => void,
): Unsubscribe {
  const firestore = requireDb()
  const testsQuery = query(
    collection(firestore, COLLECTION),
    where('candidateId', '==', candidateId),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(testsQuery, (snapshot) => {
    onChange(snapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<TestDoc, 'id'>) })))
  })
}
