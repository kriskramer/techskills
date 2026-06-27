import type { Timestamp } from 'firebase/firestore'
import type { RoleArchetypeId } from './personality'
import type { QuestionCategory } from './question'

export type CandidateStatus = 'new' | 'analyzed' | 'invited' | 'completed'

export type PipelineStatus = 'active' | 'advance' | 'hold' | 'archived'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Skill {
  name: string
  category: QuestionCategory
  level: SkillLevel
  evidence: string
  frequencyScore: number
  recencyScore: number
}

export interface SkillsProfile {
  summary: string
  skills: Skill[]
}

export interface Candidate {
  id: string
  name: string
  email: string
  resumeText: string
  recruiterName: string
  recruiterEmail: string
  recruiterCompany: string
  hiringCompany: string
  createdBy: string
  status: CandidateStatus
  skillsProfile: SkillsProfile | null
  resumeTextHash?: string | null
  testId: string | null
  activeBundleId: string | null
  analysisError: string | null
  reviewedAt: Timestamp | null
  personalityReviewedAt?: Timestamp | null
  personalityReportExportedAt?: Timestamp | null
  roleArchetype?: RoleArchetypeId | null
  pipelineStatus?: PipelineStatus
  pipelineNote?: string | null
  resumeFileUrl?: string | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type NewCandidateInput = Pick<
  Candidate,
  'name' | 'email' | 'resumeText' | 'recruiterName' | 'recruiterEmail' | 'recruiterCompany' | 'hiringCompany' | 'createdBy'
>
