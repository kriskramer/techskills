import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'

const MAX_FILE_BYTES = 10 * 1024 * 1024

function requireFunctions() {
  if (!functions) {
    throw new Error('Firebase Functions is not configured. Set VITE_FIREBASE_* env vars in .env.local.')
  }
  return functions
}

async function fileToBase64(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('File is too large (max 10 MB).')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Could not read this file.'))
        return
      }
      const base64 = result.split(',')[1]
      if (!base64) {
        reject(new Error('Could not read this file.'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Could not read this file.'))
    reader.readAsDataURL(file)
  })
}

export async function readTextResumeFile(file: File): Promise<string> {
  const text = await file.text()
  if (!text.trim()) {
    throw new Error('The file is empty.')
  }
  return text
}

export async function extractResumeFromUpload(file: File): Promise<string> {
  const callable = httpsCallable<{ fileBase64: string; fileName: string }, { text: string }>(
    requireFunctions(),
    'extractResumeText',
  )
  const result = await callable({
    fileBase64: await fileToBase64(file),
    fileName: file.name,
  })
  if (!result.data.text.trim()) {
    throw new Error('No text could be extracted from this file.')
  }
  return result.data.text
}
