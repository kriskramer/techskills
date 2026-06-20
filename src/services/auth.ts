import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { RecruiterProfile, UpdateRecruiterProfileInput } from '../types/user'

const googleProvider = new GoogleAuthProvider()
const USERS_COLLECTION = 'users'

function requireAuth() {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Set VITE_FIREBASE_* env vars in .env.local.')
  }
  return auth
}

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured. Set VITE_FIREBASE_* env vars in .env.local.')
  }
  return db
}

export async function signInWithGoogle(): Promise<User> {
  const firebaseAuth = requireAuth()
  const result = await signInWithPopup(firebaseAuth, googleProvider)
  await ensureUserProfile(result.user)
  return result.user
}

export async function signOutRecruiter(): Promise<void> {
  const firebaseAuth = requireAuth()
  await signOut(firebaseAuth)
}

export function subscribeToAuthState(callback: (user: User | null) => void): Unsubscribe {
  const firebaseAuth = requireAuth()
  return onAuthStateChanged(firebaseAuth, callback)
}

export async function ensureUserProfile(user: User): Promise<RecruiterProfile> {
  const firestore = requireDb()
  const ref = doc(firestore, USERS_COLLECTION, user.uid)
  const snapshot = await getDoc(ref)

  if (snapshot.exists()) {
    return { uid: user.uid, ...(snapshot.data() as Omit<RecruiterProfile, 'uid'>) }
  }

  const profile: Omit<RecruiterProfile, 'uid'> = {
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL,
    defaultCompany: '',
    createdAt: null,
  }

  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
  })

  return { uid: user.uid, ...profile }
}

export async function updateUserProfile(uid: string, input: UpdateRecruiterProfileInput): Promise<void> {
  const firestore = requireDb()
  await updateDoc(doc(firestore, USERS_COLLECTION, uid), {
    displayName: input.displayName,
    defaultCompany: input.defaultCompany,
  })
}

export async function getUserProfile(uid: string): Promise<RecruiterProfile | null> {
  const firestore = requireDb()
  const snapshot = await getDoc(doc(firestore, USERS_COLLECTION, uid))
  if (!snapshot.exists()) return null
  return { uid, ...(snapshot.data() as Omit<RecruiterProfile, 'uid'>) }
}
