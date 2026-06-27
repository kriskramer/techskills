import {
  PERSONALITY_ESTIMATED_MINUTES,
  PERSONALITY_QUESTION_BANK,
  type PersonalityQuestionBankEntry,
} from './data/personalityQuestionBank'

export function pickPersonalityQuestions(): PersonalityQuestionBankEntry[] {
  return [...PERSONALITY_QUESTION_BANK]
}

export function estimatePersonalityDurationMinutes(): number {
  return PERSONALITY_ESTIMATED_MINUTES
}

export function personalityQuestionCount(): number {
  return PERSONALITY_QUESTION_BANK.length
}
