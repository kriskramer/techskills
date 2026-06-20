import type { QuestionDifficulty } from '../types/question'

export type TestDifficultyPreset = 'easy' | 'medium' | 'hard'

export const TEST_DIFFICULTY_OPTIONS: TestDifficultyPreset[] = ['easy', 'medium', 'hard']

/** Target share of each difficulty level (1–5) for a test preset. */
export const DIFFICULTY_DISTRIBUTION: Record<
  TestDifficultyPreset,
  Partial<Record<QuestionDifficulty, number>>
> = {
  easy: { 1: 0.4, 2: 0.4, 3: 0.2 },
  medium: { 1: 0.05, 2: 0.3, 3: 0.3, 4: 0.2, 5: 0.05 },
  hard: { 3: 0.2, 4: 0.4, 5: 0.4 },
}

const SECONDS_BY_DIFFICULTY: Record<QuestionDifficulty, number> = {
  1: 20,
  2: 24,
  3: 28,
  4: 33,
  5: 38,
}

export function averageSecondsPerQuestion(preset: TestDifficultyPreset): number {
  const distribution = DIFFICULTY_DISTRIBUTION[preset]
  let total = 0
  for (const level of [1, 2, 3, 4, 5] as const) {
    const share = distribution[level]
    if (share != null) {
      total += share * SECONDS_BY_DIFFICULTY[level]
    }
  }
  return total
}

export function formatDifficultyLabel(preset: TestDifficultyPreset): string {
  return preset.charAt(0).toUpperCase() + preset.slice(1)
}
