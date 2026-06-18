import { z } from 'zod'

export const SkillsProfileSchema = z.object({
  summary: z.string(),
  skills: z.array(
    z.object({
      name: z.string(),
      category: z.enum(['CSharp', 'DotNet', 'SQL', 'JavaScript', 'TypeScript', 'Angular', 'Vue', 'React', 'NodeJS']),
      level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
      evidence: z.string(),
      frequencyScore: z.number().int().min(1).max(5),
      recencyScore: z.number().int().min(1).max(5),
    }),
  ),
})

export type SkillsProfile = z.infer<typeof SkillsProfileSchema>
