import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Candidate, NewCandidateInput, PipelineStatus, SkillsProfile } from '../types/candidate'

export type UpdateCandidateInput = Pick<Candidate, 'name' | 'email' | 'resumeText'>

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
    analysisError: null,
    reviewedAt: null,
    pipelineStatus: 'active',
    pipelineNote: null,
    resumeFileUrl: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateCandidateProfile(id: string, input: UpdateCandidateInput): Promise<void> {
  const firestore = requireDb()
  await updateDoc(doc(firestore, COLLECTION, id), {
    ...input,
    skillsProfile: null,
    status: 'new',
    analysisError: null,
    reviewedAt: null,
    updatedAt: serverTimestamp(),
  })
}

export async function updateCandidateSkillsProfile(id: string, skillsProfile: SkillsProfile): Promise<void> {
  const firestore = requireDb()
  await updateDoc(doc(firestore, COLLECTION, id), {
    skillsProfile,
    status: 'analyzed',
    analysisError: null,
    updatedAt: serverTimestamp(),
  })
}

export async function markCandidateReviewed(id: string): Promise<void> {
  const firestore = requireDb()
  await updateDoc(doc(firestore, COLLECTION, id), {
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateCandidatePipeline(
  id: string,
  pipelineStatus: PipelineStatus,
  pipelineNote: string | null,
): Promise<void> {
  const firestore = requireDb()
  await updateDoc(doc(firestore, COLLECTION, id), {
    pipelineStatus,
    pipelineNote: pipelineNote?.trim() || null,
    updatedAt: serverTimestamp(),
  })
}

export async function updateCandidateResumeFileUrl(id: string, resumeFileUrl: string | null): Promise<void> {
  const firestore = requireDb()
  await updateDoc(doc(firestore, COLLECTION, id), {
    resumeFileUrl,
    updatedAt: serverTimestamp(),
  })
}

export async function clearCandidateAnalysisError(id: string): Promise<void> {
  const firestore = requireDb()
  await updateDoc(doc(firestore, COLLECTION, id), {
    analysisError: null,
    updatedAt: serverTimestamp(),
  })
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

export function subscribeToCandidates(
  createdBy: string,
  onChange: (candidates: Candidate[]) => void,
): Unsubscribe {
  const firestore = requireDb()
  const candidatesQuery = query(
    collection(firestore, COLLECTION),
    where('createdBy', '==', createdBy),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(candidatesQuery, (snapshot) => {
    onChange(snapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<Candidate, 'id'>) })))
  })
}

export function subscribeToCandidatesByEmail(
  email: string,
  onChange: (candidates: Candidate[]) => void,
): Unsubscribe {
  const firestore = requireDb()
  const normalizedEmail = email.trim()
  const candidatesQuery = query(
    collection(firestore, COLLECTION),
    where('email', '==', normalizedEmail),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(candidatesQuery, (snapshot) => {
    onChange(snapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<Candidate, 'id'>) })))
  })
}
