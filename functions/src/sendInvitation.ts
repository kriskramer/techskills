import { getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { Resend } from 'resend'
import { assertCandidateAccess, requireAuth } from './authHelpers'
import { buildInviteEmailBody } from './inviteEmailBody'
import {
  assertInviteSendAllowed,
  buildInviteIdempotencyKey,
  extractTestIdFromInviteUrl,
  inviteSendUpdateFields,
} from './inviteThrottle'
import { logResendUsage } from './usageLogging'

const resendApiKey = defineSecret('RESEND_API_KEY')

interface SendInvitationRequest {
  candidateId: string
  inviteUrl: string
}

export const sendInvitation = onCall<SendInvitationRequest>(
  { secrets: [resendApiKey] },
  async (request) => {
    requireAuth(request)

    const { candidateId, inviteUrl } = request.data

    if (!candidateId || typeof candidateId !== 'string') {
      throw new HttpsError('invalid-argument', 'candidateId is required.')
    }
    if (!inviteUrl || typeof inviteUrl !== 'string') {
      throw new HttpsError('invalid-argument', 'inviteUrl is required.')
    }

    const testId = extractTestIdFromInviteUrl(inviteUrl)
    if (!testId) {
      throw new HttpsError('invalid-argument', 'inviteUrl must include a test token (e.g. /test/{token}).')
    }

    const db = getFirestore()
    const candidateRef = db.collection('candidates').doc(candidateId)
    const testRef = db.collection('tests').doc(testId)

    const snap = await candidateRef.get()
    if (!snap.exists) {
      throw new HttpsError('not-found', `Candidate ${candidateId} not found.`)
    }

    assertCandidateAccess(request, snap.data())

    const { name, email, recruiterName, recruiterCompany, hiringCompany } = snap.data() as {
      name: string
      email: string
      recruiterName?: string
      recruiterCompany?: string
      hiringCompany?: string
    }

    const claimResult = await db.runTransaction(async (transaction) => {
      const testSnap = await transaction.get(testRef)
      if (!testSnap.exists) {
        throw new HttpsError('not-found', `Test ${testId} not found.`)
      }

      const testData = testSnap.data()!
      if (testData.candidateId !== candidateId) {
        throw new HttpsError('permission-denied', 'This invite link does not belong to this candidate.')
      }

      const throttle = assertInviteSendAllowed(testData)
      transaction.update(testRef, inviteSendUpdateFields(throttle.sentAtMs))
      return throttle
    })

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const idempotencyKey = buildInviteIdempotencyKey(testId, claimResult.sentAtMs)

    const resend = new Resend(resendApiKey.value())
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your Praxis skills assessment is ready',
      text: buildInviteEmailBody({
        candidateName: name,
        inviteUrl,
        recruiterName,
        recruiterCompany,
        hiringCompany,
      }),
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    })

    if (error) {
      throw new HttpsError('internal', `Failed to send email: ${error.message}`)
    }

    await logResendUsage({
      type: 'resend_invitation',
      candidateId,
      testId,
      createdBy: request.auth?.uid,
      invitationSendCount: claimResult.nextCount,
    })

    return { success: true, invitationSendCount: claimResult.nextCount }
  },
)
