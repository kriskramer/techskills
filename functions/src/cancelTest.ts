import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { assertCandidateAccess, requireAuth } from './authHelpers'

interface CancelTestRequest {
  testId: string
}

export const cancelTest = onCall<CancelTestRequest>({ invoker: 'public' }, async (request) => {
  requireAuth(request)

  const { testId } = request.data

  if (!testId || typeof testId !== 'string') {
    throw new HttpsError('invalid-argument', 'testId is required.')
  }

  const db = getFirestore()
  const testRef = db.collection('tests').doc(testId)
  const testSnap = await testRef.get()

  if (!testSnap.exists) {
    throw new HttpsError('not-found', `Test ${testId} not found.`)
  }

  const testData = testSnap.data()!
  if (testData.status === 'completed') {
    throw new HttpsError('failed-precondition', 'Cannot cancel a completed test.')
  }
  if (testData.status === 'expired') {
    throw new HttpsError('failed-precondition', 'This test is already cancelled or expired.')
  }

  const candidateId = testData.candidateId as string
  const candidateRef = db.collection('candidates').doc(candidateId)
  const candidateSnap = await candidateRef.get()

  if (!candidateSnap.exists) {
    throw new HttpsError('not-found', `Candidate ${candidateId} not found.`)
  }

  assertCandidateAccess(request, candidateSnap.data())

  await testRef.update({
    status: 'expired',
  })

  const candidate = candidateSnap.data() ?? {}
  if ((candidate.testId as string | undefined) === testId) {
    await candidateRef.update({
      testId: null,
      status: 'analyzed',
      updatedAt: FieldValue.serverTimestamp(),
    })
  }

  return { success: true }
})
