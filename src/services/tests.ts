import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import type { QueryDocumentSnapshot, Unsubscribe } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { scorePersonalityTest, scoreTest } from './functions'
import type { TestDoc } from '../types/test'

const COLLECTION = 'tests'

function normalizeTestDoc(id: string, data: Omit<TestDoc, 'id'>): TestDoc {
  return {
    ...data,
    id,
    testType: data.testType ?? 'technical',
  }
}

function mapTests(docs: QueryDocumentSnapshot[]): TestDoc[] {
  return docs
    .map((document) => normalizeTestDoc(document.id, document.data() as Omit<TestDoc, 'id'>))
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
}

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
  return normalizeTestDoc(snapshot.id, snapshot.data() as Omit<TestDoc, 'id'>)
}

export function subscribeToTest(token: string, onChange: (test: TestDoc | null) => void): Unsubscribe {
  const firestore = requireDb()
  return onSnapshot(
    doc(firestore, COLLECTION, token),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null)
        return
      }
      onChange(normalizeTestDoc(snapshot.id, snapshot.data() as Omit<TestDoc, 'id'>))
    },
    (error) => {
      console.error('Test subscription failed:', error)
      onChange(null)
    },
  )
}

export async function startTest(token: string): Promise<void> {
  const firestore = requireDb()
  const test = await getTest(token)
  await updateDoc(doc(firestore, COLLECTION, token), {
    status: 'in-progress',
    startedAt: serverTimestamp(),
  })
  if (test?.bundleId) {
    await updateDoc(doc(firestore, 'assessmentBundles', test.bundleId), {
      status: 'in-progress',
    })
  }
}

export async function saveAnswer(token: string, questionId: string, answer: string): Promise<void> {
  await saveAnswers(token, { [questionId]: answer })
}

export async function saveAnswers(token: string, answers: Record<string, string>): Promise<void> {
  if (Object.keys(answers).length === 0) return
  const firestore = requireDb()
  const fields = Object.fromEntries(Object.entries(answers).map(([questionId, value]) => [`answers.${questionId}`, value]))
  await updateDoc(doc(firestore, COLLECTION, token), fields)
}

export async function submitTest(token: string, testType: TestDoc['testType'] = 'technical'): Promise<void> {
  if (testType === 'personality') {
    await scorePersonalityTest(token)
    return
  }
  await scoreTest(token)
}

export function subscribeToTestsForCandidate(
  candidateId: string,
  onChange: (tests: TestDoc[]) => void,
): Unsubscribe {
  const firestore = requireDb()
  const testsQuery = query(collection(firestore, COLLECTION), where('candidateId', '==', candidateId))
  return onSnapshot(
    testsQuery,
    (snapshot) => onChange(mapTests(snapshot.docs)),
    (error) => {
      console.error('Tests for candidate subscription failed:', error)
      onChange([])
    },
  )
}
