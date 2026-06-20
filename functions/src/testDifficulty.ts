import type { QuestionDifficulty } from './types'

export type TestDifficultyPreset = 'easy' | 'medium' | 'hard'

export const TEST_DIFFICULTY_PRESETS: TestDifficultyPreset[] = ['easy', 'medium', 'hard']

/** Target share of each difficulty level (1–5) for a test preset. */
export const DIFFICULTY_DISTRIBUTION: Record<
  TestDifficultyPreset,
  Partial<Record<QuestionDifficulty, number>>
> = {
  easy: { 1: 0.4, 2: 0.4, 3: 0.2 },
  medium: { 1: 0.05, 2: 0.3, 3: 0.3, 4: 0.2, 5: 0.05 },
  hard: { 3: 0.2, 4: 0.4, 5: 0.4 },
}

export function parseTestDifficultyPreset(value: unknown): TestDifficultyPreset {
  if (value === 'easy' || value === 'medium' || value === 'hard') {
    return value
  }
  return 'medium'
}
