import type { Skill, SkillsProfile } from '../../types/candidate'
import { Card } from '../shared/Card'

const LEVEL_COLOR: Record<Skill['level'], string> = {
  beginner: 'bg-slate-700 text-slate-200',
  intermediate: 'bg-cyan-900/60 text-cyan-200',
  advanced: 'bg-cyan-700/60 text-cyan-100',
  expert: 'bg-emerald-700/60 text-emerald-100',
}

interface SkillsProfileCardProps {
  profile: SkillsProfile
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
      <div className="space-y-4">
        {[...byCategory.entries()].map(([category, skills]) => (
          <div key={category}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{category}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.name}
                  title={skill.evidence}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${LEVEL_COLOR[skill.level]}`}
                >
                  {skill.name} · {skill.level}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
