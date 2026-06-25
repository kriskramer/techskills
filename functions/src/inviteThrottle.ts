import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { HttpsError } from 'firebase-functions/v2/https'

export const INVITE_COOLDOWN_MS = 5 * 60 * 1000
export const MAX_INVITES_PER_TEST = 5

export function extractTestIdFromInviteUrl(inviteUrl: string): string | null {
  try {
    const url = new URL(inviteUrl)
    const match = url.pathname.match(/\/test\/([^/]+)\/?$/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

export function buildInviteIdempotencyKey(testId: string, sentAtMs: number): string {
  const window = Math.floor(sentAtMs / INVITE_COOLDOWN_MS)
  return `invite-${testId}-${window}`
}

interface InviteThrottleFields {
  lastInvitationSentAt?: Timestamp
  invitationSendCount?: number
}

export function assertInviteSendAllowed(testData: InviteThrottleFields): { sentAtMs: number; nextCount: number } {
  const sendCount = testData.invitationSendCount ?? 0
  if (sendCount >= MAX_INVITES_PER_TEST) {
    throw new HttpsError(
      'resource-exhausted',
      `This test has reached the maximum of ${MAX_INVITES_PER_TEST} invitation emails.`,
    )
  }

  const lastSent = testData.lastInvitationSentAt
  if (lastSent) {
    const elapsedMs = Date.now() - lastSent.toMillis()
    if (elapsedMs < INVITE_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil((INVITE_COOLDOWN_MS - elapsedMs) / 1000)
      throw new HttpsError(
        'resource-exhausted',
        `Please wait ${retryAfterSeconds} seconds before resending this invite.`,
      )
    }
  }

  return { sentAtMs: Date.now(), nextCount: sendCount + 1 }
}

export function inviteSendUpdateFields(sentAtMs: number): Record<string, unknown> {
  return {
    lastInvitationSentAt: Timestamp.fromMillis(sentAtMs),
    invitationSendCount: FieldValue.increment(1),
  }
}
