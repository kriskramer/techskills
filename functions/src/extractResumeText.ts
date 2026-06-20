import { getStorage } from 'firebase-admin/storage'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { requireAuth } from './authHelpers'

const MAX_FILE_BYTES = 10 * 1024 * 1024

interface ExtractResumeTextRequest {
  /** @deprecated Prefer fileBase64 + fileName — avoids client Storage upload. */
  storagePath?: string
  fileBase64?: string
  fileName?: string
}

export const extractResumeText = onCall<ExtractResumeTextRequest>({ invoker: 'public' }, async (request) => {
  requireAuth(request)

  const { storagePath, fileBase64, fileName } = request.data
  let buffer: Buffer
  let lowerPath: string

  if (fileBase64 != null || fileName != null) {
    if (typeof fileBase64 !== 'string' || typeof fileName !== 'string' || !fileBase64 || !fileName) {
      throw new HttpsError('invalid-argument', 'fileBase64 and fileName are required.')
    }
    if (fileBase64.length > MAX_FILE_BYTES * 2) {
      throw new HttpsError('invalid-argument', 'File is too large (max 10 MB).')
    }
    buffer = Buffer.from(fileBase64, 'base64')
    if (buffer.byteLength > MAX_FILE_BYTES) {
      throw new HttpsError('invalid-argument', 'File is too large (max 10 MB).')
    }
    lowerPath = fileName.toLowerCase()
  } else if (storagePath && typeof storagePath === 'string') {
    if (!storagePath.startsWith('resumes/uploads/')) {
      throw new HttpsError('permission-denied', 'Invalid storage path.')
    }

    const bucket = getStorage().bucket()
    const file = bucket.file(storagePath)
    const [exists] = await file.exists()
    if (!exists) {
      throw new HttpsError('not-found', 'Uploaded file not found.')
    }

    const [downloaded] = await file.download()
    buffer = downloaded
    lowerPath = storagePath.toLowerCase()
  } else {
    throw new HttpsError('invalid-argument', 'Provide fileBase64 and fileName, or storagePath.')
  }

  const text = await extractTextFromBuffer(buffer, lowerPath)
  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) {
    throw new HttpsError('failed-precondition', 'No text could be extracted from this file.')
  }

  return { text: normalized }
})

async function extractTextFromBuffer(buffer: Buffer, lowerPath: string): Promise<string> {
  if (lowerPath.endsWith('.pdf')) {
    return extractPdfText(buffer)
  }
  if (lowerPath.endsWith('.docx')) {
    return extractDocxText(buffer)
  }
  if (lowerPath.endsWith('.txt')) {
    return buffer.toString('utf8')
  }
  throw new HttpsError('invalid-argument', 'Unsupported file type. Use .txt, .pdf, or .docx.')
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParseModule = await import('pdf-parse')
  const pdfParse = ('default' in pdfParseModule ? pdfParseModule.default : pdfParseModule) as unknown as (
    data: Buffer,
  ) => Promise<{ text: string }>
  const result = await pdfParse(buffer)
  return result.text ?? ''
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value ?? ''
}
