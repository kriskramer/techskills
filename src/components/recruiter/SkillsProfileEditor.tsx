import { useState } from 'react'
import type { QuestionCategory } from '../../types/question'
import type { Skill, SkillLevel, SkillsProfile } from '../../types/candidate'
import { formatCategoryLabel } from '../../lib/categoryLabels'
import { Card } from '../shared/Card'

const LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert']

const CATEGORIES: QuestionCategory[] = [
  'CSharp',
  'DotNet',
  'SQL',
  'JavaScript',
  'TypeScript',
  'Angular',
  'Vue',
  'React',
  'NodeJS',
  'HTML',
  'CSS',
]

interface SkillsProfileEditorProps {
  profile: SkillsProfile
  onSave: (profile: SkillsProfile) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

function emptySkill(category: QuestionCategory): Skill {
  return {
    name: '',
    category,
    level: 'intermediate',
    evidence: 'Manual entry',
    frequencyScore: 3,
    recencyScore: 3,
  }
}

export function SkillsProfileEditor({ profile, onSave, onCancel, isSaving }: SkillsProfileEditorProps) {
  const [summary, setSummary] = useState(profile.summary)
  const [skills, setSkills] = useState<Skill[]>(profile.skills)
  const [error, setError] = useState<string | null>(null)

  function moveSkill(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= skills.length) return
    const next = [...skills]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    setSkills(next)
  }

  function removeSkill(index: number) {
    setSkills(skills.filter((_, i) => i !== index))
  }

  function updateSkill(index: number, patch: Partial<Skill>) {
    setSkills(skills.map((skill, i) => (i === index ? { ...skill, ...patch } : skill)))
  }

  function addSkill() {
    const defaultCategory = skills[0]?.category ?? 'CSharp'
    setSkills([...skills, emptySkill(defaultCategory)])
  }

  async function handleSubmit() {
    const trimmedSkills = skills
      .map((skill) => ({ ...skill, name: skill.name.trim() }))
      .filter((skill) => skill.name.length > 0)

    if (trimmedSkills.length === 0) {
      setError('Add at least one skill before saving.')
      return
    }

    setError(null)
    await onSave({ summary: summary.trim(), skills: trimmedSkills })
  }

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Edit skills overview</h3>
        <p className="mt-1 text-sm text-slate-400">
          Adjust skills before generating a test. Changes override the AI analysis until you re-analyze the resume.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="skills-summary" className="text-sm font-medium text-slate-200">
          Summary
        </label>
        <textarea
          id="skills-summary"
          rows={3}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
        />
      </div>

      <div className="space-y-3">
        {skills.map((skill, index) => (
          <div key={`${skill.name}-${index}`} className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[140px] flex-1 space-y-1">
                <label className="text-xs text-slate-400">Skill name</label>
                <input
                  value={skill.name}
                  onChange={(event) => updateSkill(index, { name: event.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Category</label>
                <select
                  value={skill.category}
                  onChange={(event) => updateSkill(index, { category: event.target.value as QuestionCategory })}
                  className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-300"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {formatCategoryLabel(category)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Level</label>
                <select
                  value={skill.level}
                  onChange={(event) => updateSkill(index, { level: event.target.value as SkillLevel })}
                  className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-300"
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveSkill(index, -1)}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300 disabled:opacity-40"
              >
                Move up
              </button>
              <button
                type="button"
                disabled={index === skills.length - 1}
                onClick={() => moveSkill(index, 1)}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300 disabled:opacity-40"
              >
                Move down
              </button>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="rounded-full border border-rose-500/30 px-3 py-1 text-xs text-rose-200"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addSkill}
          className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-300/60 hover:text-cyan-200"
        >
          Add skill
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSubmit()}
          className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save skills'}
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={onCancel}
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-slate-300 hover:border-white/40 hover:text-white disabled:opacity-50"
        >
          Cancel
        </button>
        {error && <p className="text-sm text-rose-300">{error}</p>}
      </div>
    </Card>
  )
}
