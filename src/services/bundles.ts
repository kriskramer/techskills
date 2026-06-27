import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { AssessmentBundle } from '../types/assessmentBundle'

const COLLECTION = 'assessmentBundles'

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured. Set VITE_FIREBASE_* env vars in .env.local.')
  }
  return db
}

function mapBundle(id: string, data: Omit<AssessmentBundle, 'id'>): AssessmentBundle {
  return { id, ...data }
}

export async function getBundle(bundleId: string): Promise<AssessmentBundle | null> {
  const firestore = requireDb()
  const snapshot = await getDoc(doc(firestore, COLLECTION, bundleId))
  if (!snapshot.exists()) return null
  return mapBundle(snapshot.id, snapshot.data() as Omit<AssessmentBundle, 'id'>)
}

export function subscribeToBundle(
  bundleId: string,
  onChange: (bundle: AssessmentBundle | null) => void,
): Unsubscribe {
  const firestore = requireDb()
  return onSnapshot(
    doc(firestore, COLLECTION, bundleId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null)
        return
      }
      onChange(mapBundle(snapshot.id, snapshot.data() as Omit<AssessmentBundle, 'id'>))
    },
    (error) => {
      console.error('Bundle subscription failed:', error)
      onChange(null)
    },
  )
}

export function subscribeToBundlesForCandidate(
  candidateId: string,
  onChange: (bundles: AssessmentBundle[]) => void,
): Unsubscribe {
  const firestore = requireDb()
  const bundlesQuery = query(collection(firestore, COLLECTION), where('candidateId', '==', candidateId))
  return onSnapshot(
    bundlesQuery,
    (snapshot) => {
      const bundles = snapshot.docs
        .map((document) => mapBundle(document.id, document.data() as Omit<AssessmentBundle, 'id'>))
        .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
      onChange(bundles)
    },
    (error) => {
      console.error('Bundles for candidate subscription failed:', error)
      onChange([])
    },
  )
}
