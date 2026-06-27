import type { Timestamp } from 'firebase/firestore'
import type { RoleArchetypeId } from './personality'

export interface RecruiterProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  defaultCompany: string
  defaultRoleArchetype?: RoleArchetypeId | null
  createdAt: Timestamp | null
}

export type UpdateRecruiterProfileInput = Pick<
  RecruiterProfile,
  'displayName' | 'defaultCompany' | 'defaultRoleArchetype'
>
