import { z } from 'zod'

export const SkillsProfileSchema = z.object({
  summary: z.string(),
  skills: z.array(
    z.object({
      name: z.string(),
      category: z.enum(['CSharp', 'DotNet', 'SQL']),
      level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
      evidence: z.string(),
    }),
  ),
})

export type SkillsProfile = z.infer<typeof SkillsProfileSchema>
