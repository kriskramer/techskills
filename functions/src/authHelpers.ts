import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https'

export function requireAuth(request: CallableRequest): string {
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    return request.auth?.uid ?? 'emulator'
  }

  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in required.')
  }

  return request.auth.uid
}

export function assertCandidateAccess(
  request: CallableRequest,
  candidate: FirebaseFirestore.DocumentData | undefined,
): void {
  if (process.env.FUNCTIONS_EMULATOR === 'true') return

  const createdBy = candidate?.createdBy as string | undefined
  if (createdBy && createdBy !== request.auth?.uid) {
    throw new HttpsError('permission-denied', 'Not authorized for this candidate.')
  }
}
