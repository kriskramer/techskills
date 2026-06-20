import type { LegacyQuestionDifficulty, QuestionDifficulty } from '../types/question'
import type { TestQuestion } from '../types/test'

export type QuestionDifficultyTier = 'Easy' | 'Medium' | 'Hard'

const LEGACY_DIFFICULTY_LABELS: Record<LegacyQuestionDifficulty, QuestionDifficultyTier> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

/** Legacy per-question timers before the 1–5 scale. */
const LEGACY_TIME_LIMIT_LABELS: Record<number, QuestionDifficultyTier> = {
  15: 'Easy',
  20: 'Medium',
  30: 'Hard',
}

const TIME_LIMIT_TO_LEVEL: Record<number, QuestionDifficulty> = {
  20: 1,
  24: 2,
  28: 3,
  33: 4,
  38: 5,
}

function labelForLevel(level: QuestionDifficulty): QuestionDifficultyTier {
  if (level <= 2) return 'Easy'
  if (level === 3) return 'Medium'
  return 'Hard'
}

function normalizeLevel(value: unknown): QuestionDifficulty | null {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 5) {
    return numeric as QuestionDifficulty
  }
  return null
}

export function resolveQuestionDifficultyTier(
  question: Pick<TestQuestion, 'difficulty' | 'timeLimitSeconds'>,
): QuestionDifficultyTier {
  const { difficulty, timeLimitSeconds } = question

  if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
    return LEGACY_DIFFICULTY_LABELS[difficulty]
  }

  const level = normalizeLevel(difficulty)
  if (level != null) {
    return labelForLevel(level)
  }

  const legacyTimeLabel = LEGACY_TIME_LIMIT_LABELS[timeLimitSeconds]
  if (legacyTimeLabel) {
    return legacyTimeLabel
  }

  const inferredLevel = TIME_LIMIT_TO_LEVEL[timeLimitSeconds]
  if (inferredLevel != null) {
    return labelForLevel(inferredLevel)
  }

  return 'Medium'
}

const DIFFICULTY_BADGE_CLASS: Record<QuestionDifficultyTier, string> = {
  Easy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  Medium: 'border-blue-400/30 bg-blue-400/10 text-blue-200',
  Hard: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
}

export function questionDifficultyBadgeClass(
  question: Pick<TestQuestion, 'difficulty' | 'timeLimitSeconds'>,
): string {
  return DIFFICULTY_BADGE_CLASS[resolveQuestionDifficultyTier(question)]
}

export function formatQuestionDifficultyLabel(
  question: Pick<TestQuestion, 'difficulty' | 'timeLimitSeconds'>,
): string {
  return resolveQuestionDifficultyTier(question)
}
