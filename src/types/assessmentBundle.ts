import type { Timestamp } from 'firebase/firestore'

export type TestType = 'technical' | 'personality' | 'cognitive'

export type BundleStatus = 'pending' | 'in-progress' | 'completed' | 'expired'

export interface AssessmentBundle {
  id: string
  candidateId: string
  testTypes: TestType[]
  testIds: Partial<Record<TestType, string>>
  status: BundleStatus
  expiresAt: Timestamp | null
  createdAt: Timestamp | null
  lastInvitationSentAt?: Timestamp | null
  invitationSendCount?: number
}

export const TEST_TYPE_LABELS: Record<TestType, string> = {
  technical: 'Technical Skills',
  personality: 'Work Style & Personality',
  cognitive: 'Cognitive Ability',
}

export const TEST_TYPE_DESCRIPTIONS: Record<TestType, string> = {
  technical: 'Timed multiple-choice and short-answer questions based on your resume skills.',
  personality: 'Untimed Likert-scale questions about work style, motivation, and interpersonal tendencies.',
  cognitive: 'Timed reasoning and problem-solving tasks (coming soon).',
}
