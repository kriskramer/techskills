import type { QuestionCategory } from '../types/question'
import type { Skill, SkillsProfile } from '../types/candidate'
import { averageSecondsPerQuestion, type TestDifficultyPreset } from './testDifficulty'

const LEVEL_WEIGHT: Record<Skill['level'], number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
}

export const MIN_QUESTIONS = 30
export const MAX_QUESTIONS = 80


function computeSkillWeight(skill: Skill): number {
  const levelWeight = LEVEL_WEIGHT[skill.level] ?? 2
  const scoreAverage = (skill.frequencyScore + skill.recencyScore) / 2
  const scoreMultiplier = 0.75 + scoreAverage / 10
  return levelWeight * scoreMultiplier
}

function computeTestQuestionCount(skillCount: number): number {
  if (skillCount <= 0) return MIN_QUESTIONS

  let target: number
  if (skillCount === 1) target = 30
  else if (skillCount === 2) target = 35
  else if (skillCount <= 3) target = 40
  else if (skillCount <= 7) target = 40 + ((skillCount - 3) / 4) * 28
  else if (skillCount <= 10) target = 68 + ((skillCount - 7) / 3) * 7
  else target = 75

  return Math.round(Math.min(Math.max(target, MIN_QUESTIONS), MAX_QUESTIONS))
}

function allocateProportionally(
  weights: Record<string, number>,
  total: number,
  keys: string[],
): Record<string, number> {
  const allocations = Object.fromEntries(keys.map((key) => [key, 0])) as Record<string, number>
  if (total <= 0 || keys.length === 0) return allocations

  const weightSum = keys.reduce((sum, key) => sum + Math.max(weights[key] ?? 0, 0), 0)
  if (weightSum === 0) {
    const base = Math.floor(total / keys.length)
    const remainder = total % keys.length
    for (const key of keys) allocations[key] = base
    for (let i = 0; i < remainder; i++) allocations[keys[i]] += 1
    return allocations
  }

  let allocatedSum = 0
  const remainders: { key: string; remainder: number }[] = []

  for (const key of keys) {
    const exact = (Math.max(weights[key] ?? 0, 0) / weightSum) * total
    const floorVal = Math.floor(exact)
    allocations[key] = floorVal
    allocatedSum += floorVal
    remainders.push({ key, remainder: exact - floorVal })
  }

  remainders.sort((a, b) => b.remainder - a.remainder)
  let index = 0
  while (allocatedSum < total) {
    const key = remainders[index % remainders.length].key
    allocations[key] += 1
    allocatedSum += 1
    index++
  }

  return allocations
}

/** Default per-category question counts based on skills profile (mirrors backend allocation). */
export function defaultCategoryCounts(profile: SkillsProfile): Record<QuestionCategory, number> {
  const categories = [...new Set(profile.skills.map((skill) => skill.category))]
  const totalQuestions = computeTestQuestionCount(profile.skills.length)
  const categoryWeights = Object.fromEntries(categories.map((category) => [category, 0]))

  for (const skill of profile.skills) {
    if (skill.category in categoryWeights) {
      categoryWeights[skill.category] += computeSkillWeight(skill)
    }
  }

  const allocations = allocateProportionally(categoryWeights, totalQuestions, categories)
  return allocations as Record<QuestionCategory, number>
}

/** Rough duration preview based on difficulty-weighted per-question time limits. */
export function estimateDurationMinutes(
  categoryCounts: Record<string, number>,
  difficulty: TestDifficultyPreset = 'medium',
): number {
  const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)
  return Math.max(1, Math.ceil((total * averageSecondsPerQuestion(difficulty)) / 60))
}

/** Scale category counts to a new total while preserving relative proportions. */
export function scaleCategoryCountsToTotal(
  current: Record<string, number>,
  categories: string[],
  newTotal: number,
): Record<string, number> {
  const safeTotal = Math.round(Math.min(Math.max(newTotal, 0), MAX_QUESTIONS))
  const weights = Object.fromEntries(categories.map((category) => [category, current[category] ?? 0]))
  return allocateProportionally(weights, safeTotal, categories)
}

export function activeCategories(profile: SkillsProfile): QuestionCategory[] {
  return [...new Set(profile.skills.map((skill) => skill.category))]
}
