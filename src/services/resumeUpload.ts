import { ref, uploadBytes } from 'firebase/storage'
import { httpsCallable } from 'firebase/functions'
import { functions, storage } from '../lib/firebase'

function requireStorage() {
  if (!storage) {
    throw new Error('Firebase Storage is not configured. Set VITE_FIREBASE_* env vars in .env.local.')
  }
  return storage
}

function requireFunctions() {
  if (!functions) {
    throw new Error('Firebase Functions is not configured. Set VITE_FIREBASE_* env vars in .env.local.')
  }
  return functions
}

export async function readTextResumeFile(file: File): Promise<string> {
  const text = await file.text()
  if (!text.trim()) {
    throw new Error('The file is empty.')
  }
  return text
}

export async function extractResumeFromUpload(file: File): Promise<string> {
  const bucket = requireStorage()
  const path = `resumes/uploads/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
  await uploadBytes(ref(bucket, path), file)

  const callable = httpsCallable<{ storagePath: string }, { text: string }>(
    requireFunctions(),
    'extractResumeText',
  )
  const result = await callable({ storagePath: path })
  if (!result.data.text.trim()) {
    throw new Error('No text could be extracted from this file.')
  }
  return result.data.text
}
