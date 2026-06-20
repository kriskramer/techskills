import type { Timestamp } from 'firebase/firestore'

export type NotificationType = 'test_completed'

export interface RecruiterNotification {
  id: string
  type: NotificationType
  candidateId: string
  candidateName: string
  testId: string
  message: string
  read: boolean
  createdAt: Timestamp | null
}
