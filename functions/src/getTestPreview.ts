import { getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { assertCandidateAccess, requireAuth } from './authHelpers'

interface GetTestPreviewRequest {
  testId: string
}

interface GetTestPreviewResponse {
  answerKey: Record<string, string>
}

export const getTestPreview = onCall<GetTestPreviewRequest, Promise<GetTestPreviewResponse>>(
  { invoker: 'public' },
  async (request) => {
    requireAuth(request)

    const { testId } = request.data

    if (!testId || typeof testId !== 'string') {
      throw new HttpsError('invalid-argument', 'testId is required.')
    }

    const db = getFirestore()
    const testRef = db.collection('tests').doc(testId)
    const [testSnap, privateSnap] = await Promise.all([
      testRef.get(),
      testRef.collection('private').doc('answerKey').get(),
    ])

    if (!testSnap.exists) {
      throw new HttpsError('not-found', `Test ${testId} not found.`)
    }

    const testData = testSnap.data()!
    const candidateId = testData.candidateId as string
    const candidateSnap = await db.collection('candidates').doc(candidateId).get()

    if (!candidateSnap.exists) {
      throw new HttpsError('not-found', `Candidate ${candidateId} not found.`)
    }

    assertCandidateAccess(request, candidateSnap.data())

    if (!privateSnap.exists) {
      throw new HttpsError('failed-precondition', 'Answer key not found for this test.')
    }

    const answerKey = privateSnap.data()!.key as Record<string, string>

    return { answerKey }
  },
)
