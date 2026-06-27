import type { HexacoDimension, MotivationFacet, PersonalityScore } from '../types/personality'
import {
  getAverageBandSummary,
  getTraitInterpretation,
} from './personalityInterpretations'
import {
  HEXACO_DIMENSION_LABELS,
  MOTIVATION_FACET_LABELS,
  TRAIT_BAND_LABELS,
} from './personalityLabels'
import { buildExecutiveSummary, buildInterviewQuestions } from './personalityReportSummary'
import { getRoleArchetype, type RoleArchetypeId } from './personalityRoleArchetypes'
import {
  RECRUITER_DISCLAIMER,
  VALIDITY_CLEAN_ACTION,
  VALIDITY_CLEAN_MESSAGE,
  VALIDITY_FLAG_GUIDANCE,
} from './personalityValidity'
import { PERSONALITY_ESTIMATED_MINUTES } from '../types/personality'
import { TEST_TYPE_LABELS } from '../types/assessmentBundle'

export interface PersonalityReportHtmlOptions {
  score: PersonalityScore
  candidateName?: string
  completedAt?: Date | null
  roleArchetypeId?: RoleArchetypeId
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function traitSectionHtml(
  label: string,
  mean: number,
  band: PersonalityScore['dimensions'][HexacoDimension]['band'],
  traitKey: HexacoDimension | MotivationFacet,
): string {
  const interpretation = getTraitInterpretation(traitKey, band)
  const summary = band === 'average' ? getAverageBandSummary() : interpretation.summary
  const probeHtml =
    band !== 'average' && interpretation.probeHint
      ? `<p class="probe"><strong>Worth probing:</strong> ${escapeHtml(interpretation.probeHint)}</p>`
      : ''

  return `<div class="trait">
    <div class="trait-header">
      <span class="trait-label">${escapeHtml(label)}</span>
      <span class="trait-band">${escapeHtml(TRAIT_BAND_LABELS[band])} · ${mean.toFixed(2)}</span>
    </div>
    <p>${escapeHtml(summary)}</p>
    ${probeHtml}
  </div>`
}

export function buildPersonalityReportHtml({
  score,
  candidateName,
  completedAt,
  roleArchetypeId = 'general',
}: PersonalityReportHtmlOptions): string {
  const summaryBullets = buildExecutiveSummary(score, roleArchetypeId)
  const interviewQuestions = buildInterviewQuestions(score, roleArchetypeId)
  const archetype = getRoleArchetype(roleArchetypeId)

  const completedLabel =
    completedAt != null
      ? completedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
      : null

  const metaParts = [
    TEST_TYPE_LABELS.personality,
    candidateName,
    completedLabel ? `Completed ${completedLabel}` : null,
    `~${PERSONALITY_ESTIMATED_MINUTES} min, untimed`,
    archetype.id !== 'general' ? `Role context: ${archetype.label}` : null,
  ].filter(Boolean)

  const summaryHtml =
    summaryBullets.length > 0
      ? `<ul class="summary">${summaryBullets
          .map(
            (bullet) =>
              `<li><strong>${escapeHtml(bullet.headline)}</strong> — ${escapeHtml(bullet.body)}</li>`,
          )
          .join('')}</ul>`
      : '<p class="muted">No extreme trait bands — profile is within typical ranges across dimensions.</p>'

  const dimensionHtml = (Object.entries(score.dimensions) as [HexacoDimension, PersonalityScore['dimensions'][HexacoDimension]][])
    .map(([dimension, result]) =>
      traitSectionHtml(HEXACO_DIMENSION_LABELS[dimension], result.mean, result.band, dimension),
    )
    .join('')

  const motivationHtml = (Object.entries(score.motivation) as [MotivationFacet, PersonalityScore['motivation'][MotivationFacet]][])
    .map(([facet, result]) =>
      traitSectionHtml(MOTIVATION_FACET_LABELS[facet], result.mean, result.band, facet),
    )
    .join('')

  const interviewHtml =
    interviewQuestions.length > 0
      ? `<ol class="questions">${interviewQuestions
          .map((question) => `<li>${escapeHtml(question)}</li>`)
          .join('')}</ol>`
      : ''

  let validityHtml = ''
  if (score.validity.flags.length === 0) {
    validityHtml = `<p>${escapeHtml(VALIDITY_CLEAN_MESSAGE)} ${escapeHtml(VALIDITY_CLEAN_ACTION)}</p>`
  } else {
    validityHtml = score.validity.flags
      .map((flag) => {
        const guidance = VALIDITY_FLAG_GUIDANCE[flag]
        if (!guidance) return ''
        return `<p><strong>${escapeHtml(flag.replace(/_/g, ' '))}:</strong> ${escapeHtml(guidance.message)} ${escapeHtml(guidance.action)}</p>`
      })
      .join('')
  }

  return `<section class="personality-report">
  <h2>Work style &amp; personality</h2>
  <p class="meta">${escapeHtml(metaParts.join(' · '))}</p>
  <p class="disclaimer">${escapeHtml(RECRUITER_DISCLAIMER)}</p>
  <h3>Summary</h3>
  ${summaryHtml}
  <h3>HEXACO traits</h3>
  ${dimensionHtml}
  <h3>Work motivation</h3>
  ${motivationHtml}
  ${interviewHtml ? `<h3>Interview focus</h3>${interviewHtml}` : ''}
  <h3>Validity &amp; confidence</h3>
  ${validityHtml}
  <details class="technical-details">
    <summary>Technical details</summary>
    <p>Social desirability score: ${score.validity.socialDesirability.toFixed(2)}</p>
    <p>Max paired-item inconsistency: ${score.validity.inconsistency.toFixed(0)}</p>
  </details>
</section>`
}

export const PERSONALITY_REPORT_STYLES = `
  .personality-report { margin-top: 24px; }
  .personality-report h2 { font-size: 1.1rem; margin-top: 0; }
  .personality-report h3 { font-size: 0.95rem; margin-top: 20px; margin-bottom: 8px; }
  .disclaimer { font-size: 0.85rem; color: #444; border: 1px solid #ddd; padding: 12px; border-radius: 8px; background: #fafafa; }
  .trait { margin: 12px 0; padding-bottom: 12px; border-bottom: 1px solid #eee; }
  .trait-header { display: flex; justify-content: space-between; gap: 12px; font-weight: 600; margin-bottom: 4px; }
  .trait-band { font-weight: 500; color: #555; font-size: 0.85rem; }
  .probe { font-size: 0.85rem; color: #555; margin-top: 4px; }
  .summary { padding-left: 20px; }
  .summary li { margin: 6px 0; }
  .questions { padding-left: 20px; }
  .questions li { margin: 8px 0; }
  .muted { color: #666; font-size: 0.9rem; }
  .technical-details { margin-top: 16px; font-size: 0.85rem; color: #555; }
  .page-break { page-break-before: always; break-before: page; margin-top: 32px; padding-top: 8px; border-top: 2px solid #ddd; }
`
