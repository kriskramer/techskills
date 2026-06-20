import { getStorage } from 'firebase-admin/storage'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { requireAuth } from './authHelpers'

interface ExtractResumeTextRequest {
  storagePath: string
}

export const extractResumeText = onCall<ExtractResumeTextRequest>({ invoker: 'public' }, async (request) => {
  requireAuth(request)

  const { storagePath } = request.data
  if (!storagePath || typeof storagePath !== 'string') {
    throw new HttpsError('invalid-argument', 'storagePath is required.')
  }

  if (!storagePath.startsWith('resumes/uploads/')) {
    throw new HttpsError('permission-denied', 'Invalid storage path.')
  }

  const bucket = getStorage().bucket()
  const file = bucket.file(storagePath)
  const [exists] = await file.exists()
  if (!exists) {
    throw new HttpsError('not-found', 'Uploaded file not found.')
  }

  const [buffer] = await file.download()
  const lowerPath = storagePath.toLowerCase()

  let text: string
  if (lowerPath.endsWith('.pdf')) {
    text = await extractPdfText(buffer)
  } else if (lowerPath.endsWith('.docx')) {
    text = await extractDocxText(buffer)
  } else if (lowerPath.endsWith('.txt')) {
    text = buffer.toString('utf8')
  } else {
    throw new HttpsError('invalid-argument', 'Unsupported file type. Use .txt, .pdf, or .docx.')
  }

  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) {
    throw new HttpsError('failed-precondition', 'No text could be extracted from this file.')
  }

  return { text: normalized }
})

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
