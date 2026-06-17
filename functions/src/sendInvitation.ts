import { getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { Resend } from 'resend'

const resendApiKey = defineSecret('RESEND_API_KEY')

interface SendInvitationRequest {
  candidateId: string
  inviteUrl: string
}

export const sendInvitation = onCall<SendInvitationRequest>(
  { secrets: [resendApiKey] },
  async (request) => {
    const { candidateId, inviteUrl } = request.data

    if (!candidateId || typeof candidateId !== 'string') {
      throw new HttpsError('invalid-argument', 'candidateId is required.')
    }
    if (!inviteUrl || typeof inviteUrl !== 'string') {
      throw new HttpsError('invalid-argument', 'inviteUrl is required.')
    }

    const db = getFirestore()
    const snap = await db.collection('candidates').doc(candidateId).get()
    if (!snap.exists) {
      throw new HttpsError('not-found', `Candidate ${candidateId} not found.`)
    }

    const { name, email } = snap.data() as { name: string; email: string }

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

    const resend = new Resend(resendApiKey.value())
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your skills assessment is ready',
      text: [
        `Hi ${name},`,
        '',
        "Thanks for your time — please complete this short skills assessment when you're ready:",
        '',
        inviteUrl,
        '',
        'Each question is timed, so set aside about 30 minutes in a quiet spot. Good luck!',
      ].join('\n'),
    })

    if (error) {
      throw new HttpsError('internal', `Failed to send email: ${error.message}`)
    }

    return { success: true }
  },
)
