import { FieldValue, getFirestore } from 'firebase-admin/firestore'

interface ClaudeUsageEvent {
  type: 'claude_analyze_resume'
  candidateId: string
  createdBy?: string
  model: string
  inputTokens: number
  outputTokens: number
  cacheCreationInputTokens?: number
  cacheReadInputTokens?: number
  cached: boolean
}

interface ResendUsageEvent {
  type: 'resend_invitation' | 'resend_test_completed'
  candidateId: string
  testId?: string
  createdBy?: string
  invitationSendCount?: number
}

export async function logClaudeUsage(event: ClaudeUsageEvent): Promise<void> {
  const db = getFirestore()
  await db.collection('usageEvents').add({
    ...event,
    createdAt: FieldValue.serverTimestamp(),
  })
  console.info('claude_usage', event)
}

export async function logResendUsage(event: ResendUsageEvent): Promise<void> {
  const db = getFirestore()
  await db.collection('usageEvents').add({
    ...event,
    createdAt: FieldValue.serverTimestamp(),
  })
  console.info('resend_usage', event)
}
