import type { PersonalityScore } from '../../types/personality'
import {
  HEXACO_DIMENSION_LABELS,
  MOTIVATION_FACET_LABELS,
  TRAIT_BAND_DESCRIPTIONS,
  TRAIT_BAND_LABELS,
  traitBandColor,
} from '../../lib/personalityLabels'
import { Card } from '../shared/Card'

interface PersonalityResultsPanelProps {
  score: PersonalityScore
  title?: string
}

function TraitBar({ label, mean, band }: { label: string; mean: number; band: 'low' | 'average' | 'high' }) {
  const widthPercent = Math.round(((mean - 1) / 4) * 100)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-slate-200">{label}</span>
        <span className={`font-medium ${traitBandColor(band)}`}>{TRAIT_BAND_LABELS[band]}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-400/80 transition-all"
          style={{ width: `${Math.max(0, Math.min(100, widthPercent))}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">{TRAIT_BAND_DESCRIPTIONS[band]}</p>
    </div>
  )
}

export function PersonalityResultsPanel({ score, title = 'Personality profile' }: PersonalityResultsPanelProps) {
  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">
          Trait bands inform interview focus areas. They are not a standalone hiring decision.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">HEXACO traits</h3>
        {Object.entries(score.dimensions).map(([dimension, result]) => (
          <TraitBar
            key={dimension}
            label={HEXACO_DIMENSION_LABELS[dimension as keyof typeof HEXACO_DIMENSION_LABELS]}
            mean={result.mean}
            band={result.band}
          />
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">Work motivation</h3>
        {Object.entries(score.motivation).map(([facet, result]) => (
          <TraitBar
            key={facet}
            label={MOTIVATION_FACET_LABELS[facet as keyof typeof MOTIVATION_FACET_LABELS]}
            mean={result.mean}
            band={result.band}
          />
        ))}
      </div>

      {score.validity.flags.length > 0 && (
        <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          <p className="font-medium">Validity flags</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-amber-100/90">
            {score.validity.flags.includes('social_desirability') && (
              <li>Response pattern suggests strong social desirability bias — interpret with caution.</li>
            )}
            {score.validity.flags.includes('inconsistent_responses') && (
              <li>Inconsistent answers on paired items — consider follow-up in interview.</li>
            )}
          </ul>
        </div>
      )}
    </Card>
  )
}
