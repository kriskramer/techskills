import { useMemo, useState } from 'react'
import type { QuestionCategory } from '../../types/question'
import type { SkillsProfile } from '../../types/candidate'
import { formatCategoryLabel } from '../../lib/categoryLabels'
import {
  activeCategories,
  defaultCategoryCounts,
  estimateDurationMinutes,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  scaleCategoryCountsToTotal,
} from '../../lib/testCustomization'
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
  const [disabledCategories, setDisabledCategories] = useState<Set<QuestionCategory>>(() => new Set())

  const counts = useMemo(() => {
    const base = { ...defaults }
    if (countsDraft) {
      for (const category of categories) {
        if (countsDraft[category] != null) base[category] = countsDraft[category]!
      }
    }
    return base
  }, [defaults, countsDraft, categories])

  const enabledCategories = useMemo(
    () => categories.filter((category) => !disabledCategories.has(category)),
    [categories, disabledCategories],
  )

  const activeCounts = useMemo(() => {
    const result = { ...counts }
    for (const category of disabledCategories) {
      result[category] = 0
    }
    return result
  }, [counts, disabledCategories])

  const totalQuestions = enabledCategories.reduce((sum, category) => sum + (activeCounts[category] ?? 0), 0)
  const durationMinutes = estimateDurationMinutes(activeCounts)

  function applyCounts(
    next: Partial<Record<QuestionCategory, number>>,
    disabledOverride?: Set<QuestionCategory>,
  ) {
    const disabled = disabledOverride ?? disabledCategories
    setCountsDraft((current) => {
      const merged = { ...defaults, ...current, ...next }
      for (const category of disabled) {
        merged[category] = 0
      }
      return merged
    })
  }

  function updateCount(category: QuestionCategory, value: number) {
    if (disabledCategories.has(category)) return
    const safe = Math.max(0, Math.min(40, value))
    applyCounts({ [category]: safe })
  }

  function updateTotal(value: number) {
    if (enabledCategories.length === 0) return
    const safe = Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, value))
    const enabledCounts = Object.fromEntries(
      enabledCategories.map((category) => [category, counts[category] ?? 0]),
    )
    const scaled = scaleCategoryCountsToTotal(enabledCounts, enabledCategories, safe)
    applyCounts(scaled)
  }

  function toggleCategory(category: QuestionCategory, enabled: boolean) {
    if (enabled) {
      const nextEnabled = [...enabledCategories, category]
      const nextDisabled = new Set(disabledCategories)
      nextDisabled.delete(category)
      const redistributed = scaleCategoryCountsToTotal(
        Object.fromEntries(nextEnabled.map((key) => [key, defaults[key] ?? 0])),
        nextEnabled,
        totalQuestions,
      )
      setDisabledCategories(nextDisabled)
      applyCounts(redistributed, nextDisabled)
      return
    }

    if (enabledCategories.length <= 1) return

    const remaining = enabledCategories.filter((key) => key !== category)
    const nextDisabled = new Set(disabledCategories).add(category)
    const redistributed = scaleCategoryCountsToTotal(
      Object.fromEntries(remaining.map((key) => [key, counts[key] ?? 0])),
      remaining,
      totalQuestions,
    )

    setDisabledCategories(nextDisabled)
    applyCounts({ ...redistributed, [category]: 0 }, nextDisabled)
  }

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Customize test</h3>
        <p className="mt-1 text-sm text-slate-400">
          Adjust question counts per category before generating. Defaults are weighted by skill levels in the profile.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/40 px-4 py-3">
        <label htmlFor="total-questions" className="text-sm font-semibold text-white">
          Total questions
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Decrease total questions"
            disabled={totalQuestions <= MIN_QUESTIONS || enabledCategories.length === 0}
            onClick={() => updateTotal(totalQuestions - 1)}
            className="rounded-lg border border-white/10 px-2.5 py-1 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <input
            id="total-questions"
            type="number"
            min={MIN_QUESTIONS}
            max={MAX_QUESTIONS}
            value={totalQuestions}
            disabled={enabledCategories.length === 0}
            onChange={(event) => updateTotal(Number(event.target.value))}
            className="w-20 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 text-center text-sm text-white outline-none focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          />
          <button
            type="button"
            aria-label="Increase total questions"
            disabled={totalQuestions >= MAX_QUESTIONS || enabledCategories.length === 0}
            onClick={() => updateTotal(totalQuestions + 1)}
            className="rounded-lg border border-white/10 px-2.5 py-1 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((category) => {
          const isEnabled = !disabledCategories.has(category)
          return (
            <div key={category} className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <input
                  id={`include-${category}`}
                  type="checkbox"
                  checked={isEnabled}
                  disabled={isEnabled && enabledCategories.length <= 1}
                  onChange={(event) => toggleCategory(category, event.target.checked)}
                  className="size-4 rounded border-white/20 bg-slate-950/60 text-cyan-300 focus:ring-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-40"
                />
                <label
                  htmlFor={`include-${category}`}
                  className={`text-sm font-medium ${isEnabled ? 'text-slate-200' : 'text-slate-500'}`}
                >
                  {formatCategoryLabel(category)}
                </label>
              </div>
              <input
                id={`count-${category}`}
                type="number"
                min={0}
                max={40}
                value={activeCounts[category] ?? 0}
                disabled={!isEnabled}
                onChange={(event) => updateCount(category, Number(event.target.value))}
                className="w-24 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              />
            </div>
          )
        })}
      </div>

      <p className="text-sm text-slate-400">
        Preview: {totalQuestions} questions · ~{durationMinutes} min
      </p>

      <button
        type="button"
        disabled={isGenerating || totalQuestions === 0}
        onClick={() => void onGenerate(activeCounts)}
        className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? 'Generating test…' : 'Generate test'}
      </button>
    </Card>
  )
}
