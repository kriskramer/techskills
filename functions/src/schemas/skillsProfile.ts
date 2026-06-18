import { z } from 'zod'
import { CATEGORY_IDS } from '../data/assessmentCategories'

const scoreField = z.number().int().min(1).max(5)

/** JSON Schema–compatible schema for Anthropic structured output (no transforms/refines). */
export const SkillOutputSchema = z.object({
  name: z.string(),
  category: z.enum(CATEGORY_IDS),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  evidence: z.string(),
  frequencyScore: scoreField,
  recencyScore: scoreField,
})

export const SkillsProfileOutputSchema = z.object({
  summary: z.string(),
  skills: z.array(SkillOutputSchema),
})

export type SkillsProfile = z.infer<typeof SkillsProfileOutputSchema>

type RawSkill = z.infer<typeof SkillOutputSchema> & {
  frequency_score?: number
  recency_score?: number
}

/** Accept snake_case score aliases Claude may emit despite the output schema. */
export function normalizeSkillsProfile(profile: SkillsProfile): SkillsProfile {
  return {
    summary: profile.summary,
    skills: (profile.skills as RawSkill[]).map(
      ({ frequency_score, recency_score, frequencyScore, recencyScore, ...rest }) => ({
        ...rest,
        frequencyScore: frequencyScore ?? frequency_score ?? 3,
        recencyScore: recencyScore ?? recency_score ?? 3,
      }),
    ),
  }
}
