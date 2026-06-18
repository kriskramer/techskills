import { z } from 'zod'
import { CATEGORY_IDS } from '../data/assessmentCategories'

const scoreField = z.coerce.number().int().min(1).max(5)

const SkillSchema = z
  .object({
    name: z.string(),
    category: z.enum(CATEGORY_IDS),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    evidence: z.string(),
    frequencyScore: scoreField.optional(),
    recencyScore: scoreField.optional(),
    frequency_score: scoreField.optional(),
    recency_score: scoreField.optional(),
  })
  .transform(({ frequency_score, recency_score, frequencyScore, recencyScore, ...rest }) => ({
    ...rest,
    frequencyScore: frequencyScore ?? frequency_score,
    recencyScore: recencyScore ?? recency_score,
  }))
  .refine((skill) => skill.frequencyScore !== undefined && skill.recencyScore !== undefined, {
    message: 'Each skill must include frequencyScore and recencyScore (1-5).',
  })

export const SkillsProfileSchema = z.object({
  summary: z.string(),
  skills: z.array(SkillSchema),
})

export type SkillsProfile = z.infer<typeof SkillsProfileSchema>
