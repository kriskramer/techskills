import type { Skill, SkillsProfile } from '../../types/candidate'
import { formatCategoryLabel } from '../../lib/categoryLabels'
import { Card } from '../shared/Card'

const LEVEL_COLOR: Record<Skill['level'], string> = {
  beginner: 'bg-slate-700 text-slate-200',
  intermediate: 'bg-amber-400/30 text-amber-100',
  advanced: 'bg-cyan-700/60 text-cyan-100',
  expert: 'bg-emerald-700/60 text-emerald-100',
}

const SKILL_LEVELS: Skill['level'][] = ['beginner', 'intermediate', 'advanced', 'expert']

function SkillsOverviewLegend() {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
      <p className="font-semibold uppercase tracking-widest text-slate-500">Legend</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-slate-500">Level</span>
        {SKILL_LEVELS.map((level) => (
          <span key={level} className={`rounded-full px-2 py-0.5 font-medium capitalize ${LEVEL_COLOR[level]}`}>
            {level}
          </span>
        ))}
      </div>
      <p className="mt-2 leading-relaxed">
        <span className="font-medium text-slate-300">freq</span> — how prominently the skill appears across the resume
        (1 = mentioned once, 5 = central theme).{' '}
        <span className="font-medium text-slate-300">recent</span> — how recently the skill was used (1 = 10+ years
        ago, 5 = current role or within the last year).
      </p>
    </div>
  )
}

interface SkillsProfileCardProps {
  profile: SkillsProfile
}

function readScore(skill: Skill, camelKey: 'frequencyScore' | 'recencyScore', snakeKey: string): number | undefined {
  for (const value of [skill[camelKey], (skill as unknown as Record<string, unknown>)[snakeKey]]) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }

  return undefined
}

function formatScoreSummary(skill: Skill): string | null {
  const frequencyScore = readScore(skill, 'frequencyScore', 'frequency_score')
  const recencyScore = readScore(skill, 'recencyScore', 'recency_score')
  if (frequencyScore === undefined || recencyScore === undefined) return null
  return `${frequencyScore}/5 freq · ${recencyScore}/5 recent`
}

export function SkillsProfileCard({ profile }: SkillsProfileCardProps) {
  const byCategory = new Map<string, Skill[]>()
  for (const skill of profile.skills) {
    const list = byCategory.get(skill.category) ?? []
    list.push(skill)
    byCategory.set(skill.category, list)
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Skills overview</h3>
        <p className="mt-1 text-sm text-slate-300">{profile.summary}</p>
      </div>
      <SkillsOverviewLegend />
      <div className="space-y-4">
        {[...byCategory.entries()].map(([category, skills]) => (
          <div key={category}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {formatCategoryLabel(category)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map((skill) => {
                const scoreSummary = formatScoreSummary(skill)
                return (
                  <span
                    key={skill.name}
                    title={
                      scoreSummary
                        ? `${skill.evidence} | Frequency: ${readScore(skill, 'frequencyScore', 'frequency_score')}/5 · Recency: ${readScore(skill, 'recencyScore', 'recency_score')}/5`
                        : skill.evidence
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium ${LEVEL_COLOR[skill.level]}`}
                  >
                    {skill.name} · {skill.level}
                    {scoreSummary && <span className="ml-1.5 opacity-60">· {scoreSummary}</span>}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
