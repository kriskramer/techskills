import type { Timestamp } from 'firebase/firestore'

export interface RecruiterProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  defaultCompany: string
  createdAt: Timestamp | null
}

export type UpdateRecruiterProfileInput = Pick<RecruiterProfile, 'displayName' | 'defaultCompany'>
