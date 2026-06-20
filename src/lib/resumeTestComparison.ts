import type { Skill, SkillLevel, SkillsProfile } from '../types/candidate'
import type { TestScore } from '../types/test'

export type ComparisonVerdict = 'aligned' | 'underperform' | 'overperform' | 'untested'

export interface SkillComparisonRow {
  skill: Skill
  verdict: ComparisonVerdict
  testScorePercent: number | null
  expectedMinPercent: number
  questionsAsked: number
  message: string
}

const LEVEL_MIN_SCORE: Record<SkillLevel, number> = {
  beginner: 35,
  intermediate: 50,
  advanced: 65,
  expert: 80,
}

function normalizeSkillToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#]/g, '')
}

function findSkillBreakdown(skillName: string, bySkill: TestScore['bySkill']): { key: string; breakdown: { correct: number; total: number } } | null {
  const token = normalizeSkillToken(skillName)
  if (!token) return null

  for (const [key, breakdown] of Object.entries(bySkill)) {
    const keyToken = normalizeSkillToken(key)
    if (keyToken.includes(token) || token.includes(keyToken)) {
      return { key, breakdown }
    }
  }

  return null
}

function scorePercent(correct: number, total: number): number | null {
  if (total <= 0) return null
  return Math.round((correct / total) * 100)
}

export function compareResumeToTest(profile: SkillsProfile, score: TestScore): SkillComparisonRow[] {
  return profile.skills.map((skill) => {
    const expectedMinPercent = LEVEL_MIN_SCORE[skill.level]
    const match = findSkillBreakdown(skill.name, score.bySkill)

    if (!match || match.breakdown.total === 0) {
      return {
        skill,
        verdict: 'untested',
        testScorePercent: null,
        expectedMinPercent,
        questionsAsked: 0,
        message: 'Not covered by this assessment',
      }
    }

    const testScorePercent = scorePercent(match.breakdown.correct, match.breakdown.total)!
    let verdict: ComparisonVerdict = 'aligned'
    let message = 'Resume claim aligns with test performance'

    if (testScorePercent < expectedMinPercent) {
      verdict = 'underperform'
      message = `Claimed ${skill.level} but scored ${testScorePercent}% (expected ≥${expectedMinPercent}%)`
    } else if (testScorePercent >= expectedMinPercent + 20 && (skill.level === 'beginner' || skill.level === 'intermediate')) {
      verdict = 'overperform'
      message = `Scored ${testScorePercent}% — stronger than ${skill.level} level on resume`
    }

    return {
      skill,
      verdict,
      testScorePercent,
      expectedMinPercent,
      questionsAsked: match.breakdown.total,
      message,
    }
  })
}

export function mismatchCount(rows: SkillComparisonRow[]): number {
  return rows.filter((row) => row.verdict === 'underperform').length
}
