import type { PersonalityScore, TraitBand } from '../types/personality'
import { getSummaryBullet, getTraitInterpretation } from './personalityInterpretations'
import {
  getRoleArchetype,
  type RoleArchetypeId,
  type TraitKey,
} from './personalityRoleArchetypes'
import { VALIDITY_FLAG_GUIDANCE } from './personalityValidity'

export interface SummaryBullet {
  headline: string
  body: string
}

export interface ScoredTrait {
  key: TraitKey
  mean: number
  band: TraitBand
}

const ROLE_EMPHASIS_BOOST = 0.3

export function collectScoredTraits(score: PersonalityScore): ScoredTrait[] {
  const dimensions = Object.entries(score.dimensions).map(([key, result]) => ({
    key: key as TraitKey,
    mean: result.mean,
    band: result.band,
  }))

  const motivation = Object.entries(score.motivation).map(([key, result]) => ({
    key: key as TraitKey,
    mean: result.mean,
    band: result.band,
  }))

  return [...dimensions, ...motivation]
}

function extremityScore(trait: ScoredTrait, roleArchetypeId: RoleArchetypeId): number {
  const base = Math.abs(trait.mean - 3)
  if (trait.band === 'average') return 0

  const archetype = getRoleArchetype(roleArchetypeId)
  const emphasisBoost = archetype.emphasizedTraits.includes(trait.key) ? ROLE_EMPHASIS_BOOST : 0
  return base + emphasisBoost
}

export function getExtremeTraits(
  score: PersonalityScore,
  roleArchetypeId: RoleArchetypeId = 'general',
): ScoredTrait[] {
  return collectScoredTraits(score)
    .filter((trait) => trait.band === 'low' || trait.band === 'high')
    .sort((a, b) => extremityScore(b, roleArchetypeId) - extremityScore(a, roleArchetypeId))
}

export function buildExecutiveSummary(
  score: PersonalityScore,
  roleArchetypeId: RoleArchetypeId = 'general',
): SummaryBullet[] {
  const bullets: SummaryBullet[] = []

  for (const trait of getExtremeTraits(score, roleArchetypeId).slice(0, 3)) {
    const template = getSummaryBullet(trait.key, trait.band as 'low' | 'high')
    if (template) bullets.push(template)
  }

  if (score.validity.flags.includes('social_desirability')) {
    bullets.push({
      headline: 'Interpret with caution',
      body: 'Response pattern suggests social desirability bias; use behavioral examples, not hypotheticals.',
    })
  } else if (score.validity.flags.includes('inconsistent_responses')) {
    bullets.push({
      headline: 'Interpret with caution',
      body: 'Inconsistent answers on paired items; clarify responses with specific examples in interview.',
    })
  }

  return bullets.slice(0, 5)
}

export function buildInterviewQuestions(
  score: PersonalityScore,
  roleArchetypeId: RoleArchetypeId = 'general',
): string[] {
  const questions: string[] = []
  const seen = new Set<string>()

  function addQuestion(question: string): void {
    if (seen.has(question) || questions.length >= 6) return
    seen.add(question)
    questions.push(question)
  }

  for (const trait of getExtremeTraits(score, roleArchetypeId)) {
    const interpretation = getTraitInterpretation(trait.key, trait.band)
    if (interpretation.interviewQuestions[0]) {
      addQuestion(interpretation.interviewQuestions[0])
    }
  }

  for (const flag of score.validity.flags) {
    const guidance = VALIDITY_FLAG_GUIDANCE[flag]
    if (!guidance) continue
    for (const question of guidance.interviewQuestions) {
      addQuestion(question)
    }
  }

  const archetype = getRoleArchetype(roleArchetypeId)
  if (archetype.probeQuestion) {
    addQuestion(archetype.probeQuestion)
  }

  return questions
}
