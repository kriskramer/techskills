import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'

const rawFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(rawFirebaseConfig).every(Boolean)
export const functionsRegion = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION ?? 'us-central1'

const firebaseApp = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(rawFirebaseConfig as Record<string, string>)
  : undefined

export const auth = firebaseApp ? getAuth(firebaseApp) : undefined
export const db = firebaseApp ? getFirestore(firebaseApp) : undefined
export const functions = firebaseApp ? getFunctions(firebaseApp, functionsRegion) : undefined
export const storage = firebaseApp ? getStorage(firebaseApp) : undefined
