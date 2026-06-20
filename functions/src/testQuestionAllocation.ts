import { QUESTION_BANK } from './data/questionBank'
import type { QuestionBankEntry } from './data/questionBank'
import { CATEGORY_IDS } from './data/assessmentCategories'
import type { QuestionCategory } from './types'
import type { SkillsProfile } from './schemas/skillsProfile'

const CATEGORIES = CATEGORY_IDS

/** Few skills (3–4) → ~40 questions; many skills (7–10) → ~75; hard cap at 80. */
const MIN_QUESTIONS = 30
const MAX_QUESTIONS = 80

const LEVEL_WEIGHT: Record<SkillsProfile['skills'][number]['level'], number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
}

export type ProfileSkill = SkillsProfile['skills'][number]

/** Maps skill count to total test size before the 80-question cap. */
export function computeTestQuestionCount(skillCount: number): number {
  if (skillCount <= 0) {
    return MIN_QUESTIONS
  }

  let target: number
  if (skillCount === 1) {
    target = 30
  } else if (skillCount === 2) {
    target = 35
  } else if (skillCount <= 3) {
    target = 40
  } else if (skillCount <= 7) {
    // 3 → 40, 7 → ~68
    target = 40 + ((skillCount - 3) / 4) * 28
  } else if (skillCount <= 10) {
    // 7 → ~68, 10 → 75
    target = 68 + ((skillCount - 7) / 3) * 7
  } else {
    target = 75
  }

  return Math.round(Math.min(Math.max(target, MIN_QUESTIONS), MAX_QUESTIONS))
}

/** Higher skill level and stronger frequency/recency scores yield more questions. */
export function computeSkillWeight(skill: ProfileSkill): number {
  const levelWeight = LEVEL_WEIGHT[skill.level] ?? 2
  const scoreAverage = (skill.frequencyScore + skill.recencyScore) / 2
  // Scores are 1–5; 3 is neutral. Boost or trim weight by up to ~25%.
  const scoreMultiplier = 0.75 + scoreAverage / 10
  return levelWeight * scoreMultiplier
}

export function allocateProportionally<T extends string>(
  weights: Record<T, number>,
  total: number,
  keys: readonly T[],
): Record<T, number> {
  const allocations = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>

  if (total <= 0 || keys.length === 0) {
    return allocations
  }

  const weightSum = keys.reduce((sum, key) => sum + Math.max(weights[key], 0), 0)

  if (weightSum === 0) {
    const base = Math.floor(total / keys.length)
    const remainder = total % keys.length
    for (const key of keys) {
      allocations[key] = base
    }
    for (let i = 0; i < remainder; i++) {
      allocations[keys[i]] += 1
    }
    return allocations
  }

  let allocatedSum = 0
  const remainders: { key: T; remainder: number }[] = []

  for (const key of keys) {
    const exact = (Math.max(weights[key], 0) / weightSum) * total
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

function normalizeSkillToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#]/g, '')
}

function skillMatchesQuestionTag(skillName: string, questionTag: string): boolean {
  const skillToken = normalizeSkillToken(skillName)
  const tagToken = normalizeSkillToken(questionTag)
  if (!skillToken || !tagToken) {
    return false
  }
  return skillToken.includes(tagToken) || tagToken.includes(skillToken)
}

function questionMatchesSkill(question: QuestionBankEntry, skillName: string): boolean {
  return question.skills.some((tag) => skillMatchesQuestionTag(skillName, tag))
}

function pickFromCategoryPool(
  category: QuestionCategory,
  skillsInCategory: ProfileSkill[],
  allocation: number | undefined,
  usedIds: Set<string>,
): QuestionBankEntry[] {
  const targetCount = Math.max(allocation ?? 0, 0)
  if (targetCount <= 0) {
    return []
  }

  const pool = QUESTION_BANK.filter(
    (question) => question.category === category && !usedIds.has(question.id),
  )
  const selected: QuestionBankEntry[] = []

  if (skillsInCategory.length === 0) {
    selected.push(...shuffle(pool).slice(0, targetCount))
    return selected
  }

  const skillWeights = Object.fromEntries(
    skillsInCategory.map((skill) => [skill.name, computeSkillWeight(skill)]),
  ) as Record<string, number>
  const skillNames = skillsInCategory.map((skill) => skill.name)
  const skillAllocations = allocateProportionally(skillWeights, targetCount, skillNames)

  for (const skill of skillsInCategory) {
    const count = skillAllocations[skill.name]
    if (count <= 0) {
      continue
    }

    const skillPool = pool.filter(
      (question) => !usedIds.has(question.id) && questionMatchesSkill(question, skill.name),
    )
    const picked = shuffle(skillPool).slice(0, count)
    for (const question of picked) {
      selected.push(question)
      usedIds.add(question.id)
    }
  }

  if (selected.length < targetCount) {
    const remaining = pool.filter((question) => !usedIds.has(question.id))
    const filler = shuffle(remaining).slice(0, targetCount - selected.length)
    for (const question of filler) {
      selected.push(question)
      usedIds.add(question.id)
    }
  }

  return selected
}

/** Picks a variable-size subset of the question bank weighted by skill level. */
export function pickQuestionsForProfile(
  skills: ProfileSkill[],
  categoryCountOverrides?: Partial<Record<QuestionCategory, number>>,
): QuestionBankEntry[] {
  const activeCategories = [...new Set(skills.map((skill) => skill.category))]
  const overrideTotal = categoryCountOverrides
    ? activeCategories.reduce((sum, category) => sum + Math.max(categoryCountOverrides[category] ?? 0, 0), 0)
    : 0
  const totalQuestions = overrideTotal > 0 ? overrideTotal : computeTestQuestionCount(skills.length)

  const categoryWeights = Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<
    QuestionCategory,
    number
  >

  for (const skill of skills) {
    if (skill.category in categoryWeights) {
      categoryWeights[skill.category] += computeSkillWeight(skill)
    }
  }

  const categoryAllocations =
    overrideTotal > 0
      ? (Object.fromEntries(
          CATEGORIES.map((category) => [category, Math.max(categoryCountOverrides?.[category] ?? 0, 0)]),
        ) as Record<QuestionCategory, number>)
      : allocateProportionally(categoryWeights, totalQuestions, CATEGORIES)
  const usedIds = new Set<string>()
  const selected: QuestionBankEntry[] = []

  for (const category of CATEGORIES) {
    const skillsInCategory = skills.filter((skill) => skill.category === category)
    const picked = pickFromCategoryPool(
      category,
      skillsInCategory,
      categoryAllocations[category],
      usedIds,
    )
    selected.push(...picked)
  }

  if (selected.length < totalQuestions) {
    const remaining = shuffle(QUESTION_BANK.filter((question) => !usedIds.has(question.id)))
    for (const question of remaining.slice(0, totalQuestions - selected.length)) {
      selected.push(question)
      usedIds.add(question.id)
    }
  }

  return shuffle(selected.slice(0, totalQuestions))
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
