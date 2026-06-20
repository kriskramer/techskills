import { useMemo, useState } from 'react'
import type { QuestionCategory } from '../../types/question'
import type { SkillsProfile } from '../../types/candidate'
import { formatCategoryLabel } from '../../lib/categoryLabels'
import { activeCategories, defaultCategoryCounts, estimateDurationMinutes } from '../../lib/testCustomization'
import { Card } from '../shared/Card'

interface TestCustomizationPanelProps {
  profile: SkillsProfile
  onGenerate: (categoryCounts: Record<string, number>) => Promise<void>
  isGenerating: boolean
}

export function TestCustomizationPanel({ profile, onGenerate, isGenerating }: TestCustomizationPanelProps) {
  const categories = useMemo(() => activeCategories(profile), [profile])
  const defaults = useMemo(() => defaultCategoryCounts(profile), [profile])
  const [countsDraft, setCountsDraft] = useState<Partial<Record<QuestionCategory, number>> | null>(null)

  const counts = useMemo(() => {
    const base = { ...defaults }
    if (countsDraft) {
      for (const category of categories) {
        if (countsDraft[category] != null) base[category] = countsDraft[category]!
      }
    }
    return base
  }, [defaults, countsDraft, categories])

  const totalQuestions = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const durationMinutes = estimateDurationMinutes(counts)

  function updateCount(category: QuestionCategory, value: number) {
    const safe = Math.max(0, Math.min(40, value))
    setCountsDraft((current) => ({ ...current, [category]: safe }))
  }

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Customize test</h3>
        <p className="mt-1 text-sm text-slate-400">
          Adjust question counts per category before generating. Defaults are weighted by skill levels in the profile.
        </p>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category} className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor={`count-${category}`} className="text-sm font-medium text-slate-200">
              {formatCategoryLabel(category)}
            </label>
            <input
              id={`count-${category}`}
              type="number"
              min={0}
              max={40}
              value={counts[category] ?? 0}
              onChange={(event) => updateCount(category, Number(event.target.value))}
              className="w-24 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-300"
            />
          </div>
        ))}
      </div>

      <p className="text-sm text-slate-400">
        Preview: {totalQuestions} questions · ~{durationMinutes} min
      </p>

      <button
        type="button"
        disabled={isGenerating || totalQuestions === 0}
        onClick={() => void onGenerate(counts)}
        className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? 'Generating test…' : 'Generate test'}
      </button>
    </Card>
  )
}
