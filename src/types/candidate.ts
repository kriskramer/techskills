import type { Timestamp } from 'firebase/firestore'
import type { QuestionCategory } from './question'

export type CandidateStatus = 'new' | 'analyzed' | 'invited' | 'completed'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Skill {
  name: string
  category: QuestionCategory
  level: SkillLevel
  evidence: string
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
  status: CandidateStatus
  skillsProfile: SkillsProfile | null
  testId: string | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type NewCandidateInput = Pick<Candidate, 'name' | 'email' | 'resumeText'>
