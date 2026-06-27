import { useMemo, useState } from 'react'
import type { TestType } from '../../types/assessmentBundle'
import { TEST_TYPE_DESCRIPTIONS, TEST_TYPE_LABELS } from '../../types/assessmentBundle'
import type { SkillsProfile } from '../../types/candidate'
import type { TestDifficultyPreset } from '../../lib/testDifficulty'
import { Card } from '../shared/Card'
import { TestCustomizationPanel } from './TestCustomizationPanel'

interface AssessmentSetupPanelProps {
  profile: SkillsProfile | null
  onGenerate: (
    testTypes: TestType[],
    categoryCounts?: Record<string, number>,
    difficulty?: TestDifficultyPreset,
  ) => Promise<void>
  isGenerating: boolean
}

const SELECTABLE_TYPES: TestType[] = ['technical', 'personality']

export function AssessmentSetupPanel({ profile, onGenerate, isGenerating }: AssessmentSetupPanelProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<TestType>>(() => new Set(['technical']))
  const [showTechnicalOptions, setShowTechnicalOptions] = useState(true)

  const canGenerate = useMemo(() => {
    if (selectedTypes.size === 0) return false
    if (selectedTypes.has('technical') && !profile) return false
    return true
  }, [selectedTypes, profile])

  function toggleType(type: TestType, enabled: boolean) {
    setSelectedTypes((current) => {
      const next = new Set(current)
      if (enabled) next.add(type)
      else next.delete(type)
      return next
    })
    if (type === 'technical') {
      setShowTechnicalOptions(enabled)
    }
  }

  async function handleGenerateFromCustomization(
    categoryCounts: Record<string, number>,
    difficulty: TestDifficultyPreset,
  ) {
    await onGenerate([...selectedTypes], categoryCounts, difficulty)
  }

  async function handleGeneratePersonalityOnly() {
    await onGenerate([...selectedTypes])
  }

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Assessment setup</h3>
        <p className="mt-1 text-sm text-slate-400">
          Choose which assessments this candidate should complete. You can send one email with links to all selected
          tests.
        </p>
      </div>

      <div className="space-y-3">
        {SELECTABLE_TYPES.map((type) => (
          <label
            key={type}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 transition hover:border-cyan-300/30"
          >
            <input
              type="checkbox"
              checked={selectedTypes.has(type)}
              onChange={(event) => toggleType(type, event.target.checked)}
              disabled={type === 'technical' && !profile}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-300 focus:ring-cyan-300"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-white">{TEST_TYPE_LABELS[type]}</span>
              <span className="mt-0.5 block text-xs text-slate-400">{TEST_TYPE_DESCRIPTIONS[type]}</span>
              {type === 'technical' && !profile && (
                <span className="mt-1 block text-xs text-amber-200">Requires a completed skills profile.</span>
              )}
            </span>
          </label>
        ))}

        <label className="flex cursor-not-allowed items-start gap-3 rounded-xl border border-white/5 bg-slate-950/20 px-4 py-3 opacity-60">
          <input type="checkbox" disabled checked={false} className="mt-1 h-4 w-4" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-slate-400">{TEST_TYPE_LABELS.cognitive}</span>
            <span className="mt-0.5 block text-xs text-slate-500">{TEST_TYPE_DESCRIPTIONS.cognitive}</span>
            <span className="mt-1 block text-xs text-slate-500">Coming soon.</span>
          </span>
        </label>
      </div>

      {selectedTypes.has('technical') && profile && showTechnicalOptions && (
        <TestCustomizationPanel
          profile={profile}
          onGenerate={handleGenerateFromCustomization}
          isGenerating={isGenerating}
          generateLabel="Generate assessments"
          disabled={!canGenerate}
        />
      )}

      {!selectedTypes.has('technical') && selectedTypes.has('personality') && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-4">
          <p className="text-sm text-slate-300">
            Work Style & Personality includes 80 untimed Likert questions (~15 min). Candidates answer in batches of 10.
          </p>
          <button
            type="button"
            onClick={() => void handleGeneratePersonalityOnly()}
            disabled={!canGenerate || isGenerating}
            className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? 'Generating…' : 'Generate assessments'}
          </button>
        </div>
      )}

      {selectedTypes.size === 0 && (
        <p className="text-sm text-amber-200">Select at least one assessment type to continue.</p>
      )}
    </Card>
  )
}
