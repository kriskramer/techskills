import type { Timestamp } from 'firebase/firestore'
import type { TestType } from './assessmentBundle'
import type { PersonalityQuestion, PersonalityScore } from './personality'
import type { QuestionCategory, QuestionDifficulty, LegacyQuestionDifficulty, QuestionType } from './question'

export type TestStatus = 'pending' | 'in-progress' | 'completed' | 'expired'

export interface TestQuestion {
  id: string
  category: QuestionCategory
  prompt: string
  type: QuestionType
  options: string[] | null
  difficulty: QuestionDifficulty | LegacyQuestionDifficulty
  timeLimitSeconds: number
  skills: string[]
}

export interface ScoreBreakdown {
  correct: number
  total: number
}

export interface TestScore extends ScoreBreakdown {
  byCategory: Record<string, ScoreBreakdown>
  bySkill: Record<string, ScoreBreakdown>
}

export interface QuestionResult {
  questionId: string
  prompt: string
  candidateAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export interface TestDoc {
  id: string
  candidateId: string
  candidateName: string
  testType: TestType
  bundleId?: string | null
  questions: TestQuestion[]
  personalityQuestions?: PersonalityQuestion[]
  durationMinutes: number
  status: TestStatus
  startedAt: Timestamp | null
  completedAt: Timestamp | null
  expiresAt: Timestamp | null
  answers: Record<string, string>
  score: TestScore | null
  personalityScore?: PersonalityScore | null
  questionBreakdown: QuestionResult[] | null
  createdAt: Timestamp | null
  lastInvitationSentAt?: Timestamp | null
  invitationSendCount?: number
}
