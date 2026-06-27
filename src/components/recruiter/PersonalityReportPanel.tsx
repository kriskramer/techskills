import { useState } from 'react'
import type {
  HexacoDimension,
  MotivationFacet,
  PersonalityScore,
  RoleArchetypeId,
  TraitBand,
} from '../../types/personality'
import {
  getAverageBandSummary,
  getTraitInterpretation,
} from '../../lib/personalityInterpretations'
import {
  HEXACO_DIMENSION_LABELS,
  MOTIVATION_FACET_LABELS,
  TRAIT_BAND_LABELS,
  traitBandColor,
} from '../../lib/personalityLabels'
import { buildExecutiveSummary, buildInterviewQuestions } from '../../lib/personalityReportSummary'
import {
  DEFAULT_ROLE_ARCHETYPE_ID,
  ROLE_ARCHETYPES,
  type TraitKey,
} from '../../lib/personalityRoleArchetypes'
import {
  CANDIDATE_DISCLAIMER,
  RECRUITER_DISCLAIMER,
  VALIDITY_CLEAN_ACTION,
  VALIDITY_CLEAN_MESSAGE,
  VALIDITY_FLAG_GUIDANCE,
} from '../../lib/personalityValidity'
import { PERSONALITY_ESTIMATED_MINUTES } from '../../types/personality'
import { TEST_TYPE_LABELS } from '../../types/assessmentBundle'
import { Card } from '../shared/Card'

interface PersonalityReportPanelProps {
  score: PersonalityScore
  mode: 'recruiter' | 'candidate'
  title?: string
  candidateName?: string
  completedAt?: Date | null
  roleArchetype?: RoleArchetypeId
  onRoleArchetypeChange?: (id: RoleArchetypeId) => void
  onExport?: () => void
  onMarkReviewed?: () => void
  isMarkingReviewed?: boolean
  personalityNeedsReview?: boolean
}

function TraitBar({
  label,
  mean,
  band,
  interpretation,
  showRecruiterCopy,
}: {
  label: string
  mean: number
  band: TraitBand
  interpretation: ReturnType<typeof getTraitInterpretation>
  showRecruiterCopy: boolean
}) {
  const widthPercent = Math.round(((mean - 1) / 4) * 100)

  return (
    <div className="space-y-1.5">
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
      {showRecruiterCopy ? (
        <>
          <p className="text-xs text-slate-400">
            <span className="font-medium text-slate-300">What this suggests: </span>
            {band === 'average' ? getAverageBandSummary() : interpretation.summary}
          </p>
          {band !== 'average' && interpretation.probeHint && (
            <p className="text-xs text-slate-500">
              <span className="font-medium text-slate-400">Worth probing: </span>
              {interpretation.probeHint}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-slate-500">
          {band === 'average' ? getAverageBandSummary() : interpretation.summary}
        </p>
      )}
    </div>
  )
}

function CopyQuestionButton({ question }: { question: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(question)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-xs text-slate-400 transition hover:border-cyan-300/40 hover:text-cyan-200"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function PersonalityReportPanel({
  score,
  mode,
  title,
  candidateName,
  completedAt,
  roleArchetype: roleArchetypeProp,
  onRoleArchetypeChange,
  onExport,
  onMarkReviewed,
  isMarkingReviewed = false,
  personalityNeedsReview = false,
}: PersonalityReportPanelProps) {
  const [localRoleArchetype, setLocalRoleArchetype] = useState<RoleArchetypeId>(DEFAULT_ROLE_ARCHETYPE_ID)
  const roleArchetype = roleArchetypeProp ?? localRoleArchetype
  const isRecruiter = mode === 'recruiter'

  function handleRoleChange(id: RoleArchetypeId): void {
    if (onRoleArchetypeChange) {
      onRoleArchetypeChange(id)
    } else {
      setLocalRoleArchetype(id)
    }
  }

  const summaryBullets = isRecruiter ? buildExecutiveSummary(score, roleArchetype) : []
  const interviewQuestions = isRecruiter ? buildInterviewQuestions(score, roleArchetype) : []

  const panelTitle =
    title ?? (isRecruiter ? 'Work style report' : 'Your work style profile')

  const completedLabel =
    completedAt != null
      ? completedAt.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null

  return (
    <Card className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{panelTitle}</h2>
            {isRecruiter && (
              <p className="mt-1 text-sm text-slate-400">
                {TEST_TYPE_LABELS.personality}
                {candidateName ? ` · ${candidateName}` : ''}
                {completedLabel ? ` · Completed ${completedLabel}` : ''}
                {` · ~${PERSONALITY_ESTIMATED_MINUTES} min, untimed`}
              </p>
            )}
          </div>
          {isRecruiter && (
            <div className="flex flex-col items-end gap-2">
              {(onExport || onMarkReviewed) && (
                <div className="flex flex-wrap justify-end gap-2">
                  {personalityNeedsReview && onMarkReviewed && (
                    <button
                      type="button"
                      onClick={onMarkReviewed}
                      disabled={isMarkingReviewed}
                      className="rounded-full border border-cyan-300/50 bg-cyan-300/10 px-4 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-cyan-300/20 disabled:opacity-50"
                    >
                      {isMarkingReviewed ? 'Saving…' : 'Mark reviewed'}
                    </button>
                  )}
                  {onExport && (
                    <button
                      type="button"
                      onClick={onExport}
                      className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200"
                    >
                      Export report
                    </button>
                  )}
                </div>
              )}
              <label className="flex min-w-[12rem] flex-col gap-1 text-xs text-slate-400">
                Role context
                <select
                  value={roleArchetype}
                  onChange={(event) => handleRoleChange(event.target.value as RoleArchetypeId)}
                  className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                >
                  {ROLE_ARCHETYPES.map((archetype) => (
                    <option key={archetype.id} value={archetype.id}>
                      {archetype.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          {isRecruiter ? RECRUITER_DISCLAIMER : CANDIDATE_DISCLAIMER}
        </p>
      </div>

      {isRecruiter && summaryBullets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">Summary</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {summaryBullets.map((bullet) => (
              <li key={`${bullet.headline}-${bullet.body}`} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
                <span>
                  <span className="font-medium text-white">{bullet.headline}</span>
                  {' — '}
                  {bullet.body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">HEXACO traits</h3>
        {(Object.entries(score.dimensions) as [HexacoDimension, PersonalityScore['dimensions'][HexacoDimension]][]).map(
          ([dimension, result]) => (
            <TraitBar
              key={dimension}
              label={HEXACO_DIMENSION_LABELS[dimension]}
              mean={result.mean}
              band={result.band}
              interpretation={getTraitInterpretation(dimension as TraitKey, result.band)}
              showRecruiterCopy={isRecruiter}
            />
          ),
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">Work motivation</h3>
        {(Object.entries(score.motivation) as [MotivationFacet, PersonalityScore['motivation'][MotivationFacet]][]).map(
          ([facet, result]) => (
            <TraitBar
              key={facet}
              label={MOTIVATION_FACET_LABELS[facet]}
              mean={result.mean}
              band={result.band}
              interpretation={getTraitInterpretation(facet as TraitKey, result.band)}
              showRecruiterCopy={isRecruiter}
            />
          ),
        )}
      </div>

      {isRecruiter && interviewQuestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">Interview focus</h3>
          <ul className="space-y-3">
            {interviewQuestions.map((question) => (
              <li
                key={question}
                className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-300"
              >
                <span>{question}</span>
                <CopyQuestionButton question={question} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">Validity & confidence</h3>
        {score.validity.flags.length === 0 ? (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-100/90">
            <p>{VALIDITY_CLEAN_MESSAGE}</p>
            {isRecruiter && <p className="mt-1 text-emerald-100/70">{VALIDITY_CLEAN_ACTION}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {score.validity.flags.map((flag) => {
              const guidance = VALIDITY_FLAG_GUIDANCE[flag]
              if (!guidance) return null
              return (
                <div
                  key={flag}
                  className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100"
                >
                  <p>{guidance.message}</p>
                  {isRecruiter && <p className="mt-1 text-amber-100/80">{guidance.action}</p>}
                </div>
              )
            })}
          </div>
        )}

        {isRecruiter && (
          <details className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            <summary className="cursor-pointer font-medium text-slate-300">Technical details</summary>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <dt>Social desirability score</dt>
                <dd className="text-slate-300">{score.validity.socialDesirability.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Max paired-item inconsistency</dt>
                <dd className="text-slate-300">{score.validity.inconsistency.toFixed(0)}</dd>
              </div>
            </dl>
          </details>
        )}
      </div>
    </Card>
  )
}
