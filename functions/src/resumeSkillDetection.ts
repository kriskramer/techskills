import {
  ASSESSMENT_CATEGORIES,
  CATEGORY_IDS,
  type QuestionCategory,
} from './data/assessmentCategories'
import type { SkillsProfile } from './schemas/skillsProfile'

type Skill = SkillsProfile['skills'][number]

const CATEGORY_PATTERNS: Record<QuestionCategory, RegExp[]> = {
  CSharp: [/\bc\s*#/i, /\bcsharp\b/i, /\bc sharp\b/i],
  DotNet: [
    /\b\.net\b/i,
    /\basp\.?net\b/i,
    /\bentity framework\b/i,
    /\bef core\b/i,
    /\bblazor\b/i,
    /\bnuget\b/i,
    /\basp\.?net core\b/i,
  ],
  SQL: [/\bsql\b/i, /\bt-?sql\b/i, /\bsql server\b/i, /\bpostgres(?:ql)?\b/i, /\bmysql\b/i],
  JavaScript: [/\bjavascript\b/i, /\bes\d{1,2}\b/i, /\becmascript\b/i],
  TypeScript: [/\btypescript\b/i],
  Angular: [/\bangular(?:\.?js)?\b/i, /\bangular\s+\d+/i, /\brxjs\b/i, /\bngmodule\b/i],
  Vue: [/\bvue(?:\.?js|x)?\b/i, /\bnuxt(?:\.?js)?\b/i, /\bvue router\b/i, /\bvuex\b/i],
  React: [/\breact(?:\.?js| native)?\b/i, /\bnext(?:\.?js)?\b/i, /\bjsx\b/i, /\bredux\b/i],
  NodeJS: [/\bnode(?:\.?js)?\b/i, /\bexpress(?:\.?js)?\b/i, /\bnpm\b/i],
  HTML: [/\bhtml(?:5)?\b/i],
  CSS: [/\bcss(?:3)?\b/i, /\bsass\b/i, /\bscss\b/i, /\btailwind\b/i, /\bbootstrap\b/i],
}

// More specific framework categories take precedence when reclassifying AI output.
const RECONCILE_PRIORITY: QuestionCategory[] = [
  'Angular',
  'Vue',
  'React',
  'NodeJS',
  'TypeScript',
  'CSharp',
  'DotNet',
  'SQL',
  'HTML',
  'CSS',
  'JavaScript',
]

function categoryMeta(category: QuestionCategory) {
  return ASSESSMENT_CATEGORIES.find((entry) => entry.id === category)!
}

export function matchesCategory(text: string, category: QuestionCategory): boolean {
  return CATEGORY_PATTERNS[category].some((pattern) => pattern.test(text))
}

export function detectCategoriesFromResume(resumeText: string): QuestionCategory[] {
  return CATEGORY_IDS.filter((category) => matchesCategory(resumeText, category))
}

function countMentions(resumeText: string, category: QuestionCategory): number {
  return CATEGORY_PATTERNS[category].reduce((total, pattern) => {
    const matches = resumeText.match(new RegExp(pattern.source, `${pattern.flags}g`))
    return total + (matches?.length ?? 0)
  }, 0)
}

function frequencyScoreFromMentions(count: number): number {
  if (count >= 5) return 5
  if (count >= 3) return 4
  if (count >= 2) return 3
  return 2
}

function extractEvidenceSnippet(resumeText: string, category: QuestionCategory): string | null {
  for (const line of resumeText.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed.length > 0 && matchesCategory(trimmed, category)) {
      return trimmed.length > 200 ? `${trimmed.slice(0, 197)}…` : trimmed
    }
  }
  return null
}

function bestMatchingCategory(text: string, detected: Set<QuestionCategory>): QuestionCategory | null {
  for (const category of RECONCILE_PRIORITY) {
    if (detected.has(category) && matchesCategory(text, category)) {
      return category
    }
  }
  return null
}

function reconcileSkillCategories(skills: Skill[], resumeText: string): Skill[] {
  const detected = new Set(detectCategoriesFromResume(resumeText))

  return skills.map((skill) => {
    const haystack = `${skill.name} ${skill.evidence}`
    const matchedCategory = bestMatchingCategory(haystack, detected)
    if (matchedCategory && skill.category !== matchedCategory) {
      return { ...skill, category: matchedCategory }
    }
    return skill
  })
}

function addMissingCategorySkills(skills: Skill[], resumeText: string): Skill[] {
  const merged = [...skills]
  const existingCategories = new Set(merged.map((skill) => skill.category))

  for (const category of detectCategoriesFromResume(resumeText)) {
    if (existingCategories.has(category)) continue

    const meta = categoryMeta(category)
    const mentions = countMentions(resumeText, category)
    merged.push({
      name: meta.label,
      category,
      level: 'intermediate',
      evidence: extractEvidenceSnippet(resumeText, category) ?? `Resume mentions ${meta.label}.`,
      frequencyScore: frequencyScoreFromMentions(mentions),
      recencyScore: 3,
    })
    existingCategories.add(category)
  }

  return merged
}

export function enrichSkillsProfile(skillsProfile: SkillsProfile, resumeText: string): SkillsProfile {
  const skills = addMissingCategorySkills(reconcileSkillCategories(skillsProfile.skills, resumeText), resumeText)

  return {
    ...skillsProfile,
    skills,
  }
}
