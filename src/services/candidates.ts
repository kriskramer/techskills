import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Candidate, NewCandidateInput } from '../types/candidate'

const COLLECTION = 'candidates'

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured. Set VITE_FIREBASE_* env vars in .env.local.')
  }
  return db
}

export async function createCandidate(input: NewCandidateInput): Promise<string> {
  const firestore = requireDb()
  const ref = await addDoc(collection(firestore, COLLECTION), {
    ...input,
    status: 'new',
    skillsProfile: null,
    testId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  const firestore = requireDb()
  const snapshot = await getDoc(doc(firestore, COLLECTION, id))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...(snapshot.data() as Omit<Candidate, 'id'>) }
}

export function subscribeToCandidate(id: string, onChange: (candidate: Candidate | null) => void): Unsubscribe {
  const firestore = requireDb()
  return onSnapshot(doc(firestore, COLLECTION, id), (snapshot) => {
    if (!snapshot.exists()) {
      onChange(null)
      return
    }
    onChange({ id: snapshot.id, ...(snapshot.data() as Omit<Candidate, 'id'>) })
  })
}

export function subscribeToCandidates(onChange: (candidates: Candidate[]) => void): Unsubscribe {
  const firestore = requireDb()
  const candidatesQuery = query(collection(firestore, COLLECTION), orderBy('createdAt', 'desc'))
  return onSnapshot(candidatesQuery, (snapshot) => {
    onChange(snapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<Candidate, 'id'>) })))
  })
}
