import { formatCategoryLabel } from './categoryLabels'
import {
  HEXACO_DIMENSION_LABELS,
  MOTIVATION_FACET_LABELS,
  TRAIT_BAND_LABELS,
} from './personalityLabels'
import type { Candidate } from '../types/candidate'
import type { TestDoc } from '../types/test'
import { compareResumeToTest } from './resumeTestComparison'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function printAssessmentReport(
  candidate: Candidate,
  test: TestDoc,
  personalityTest?: TestDoc | null,
): void {
  const hasTechnical = test.score != null && candidate.skillsProfile
  const hasPersonality = personalityTest?.personalityScore != null

  if (!hasTechnical && !hasPersonality) return

  let technicalSection = ''
  if (hasTechnical && test.score && candidate.skillsProfile) {
    const overallPct =
      test.score.total > 0 ? Math.round((test.score.correct / test.score.total) * 100) : 0
    const comparisons = compareResumeToTest(candidate.skillsProfile, test.score)
    const mismatches = comparisons.filter((row) => row.verdict === 'underperform')

    const categoryRows = Object.entries(test.score.byCategory)
      .map(
        ([category, breakdown]) =>
          `<tr><td>${escapeHtml(formatCategoryLabel(category))}</td><td>${breakdown.correct}/${breakdown.total}</td><td>${breakdown.total > 0 ? Math.round((breakdown.correct / breakdown.total) * 100) : 0}%</td></tr>`,
      )
      .join('')

    const skillRows = comparisons
      .filter((row) => row.questionsAsked > 0)
      .map(
        (row) =>
          `<tr><td>${escapeHtml(row.skill.name)}</td><td>${row.skill.level}</td><td>${row.testScorePercent ?? '—'}%</td><td>${escapeHtml(row.message)}</td></tr>`,
      )
      .join('')

    technicalSection = `
  <h2>Technical skills assessment</h2>
  <p class="score">${overallPct}% overall (${test.score.correct}/${test.score.total} correct)</p>
  <h2>By category</h2>
  <table>
    <thead><tr><th>Category</th><th>Score</th><th>%</th></tr></thead>
    <tbody>${categoryRows}</tbody>
  </table>
  <h2>Resume vs test</h2>
  ${
    mismatches.length > 0
      ? `<p><strong>${mismatches.length} skill mismatch${mismatches.length === 1 ? '' : 'es'} flagged</strong> where resume claims exceed test performance.</p>`
      : '<p>No significant mismatches between resume claims and test scores.</p>'
  }
  <table>
    <thead><tr><th>Skill</th><th>Resume level</th><th>Test %</th><th>Notes</th></tr></thead>
    <tbody>${skillRows}</tbody>
  </table>
  <h2>Skills summary</h2>
  <p>${escapeHtml(candidate.skillsProfile.summary)}</p>`
  }

  let personalitySection = ''
  if (hasPersonality && personalityTest?.personalityScore) {
    const score = personalityTest.personalityScore
    const dimensionRows = Object.entries(score.dimensions)
      .map(
        ([dimension, result]) =>
          `<tr><td>${escapeHtml(HEXACO_DIMENSION_LABELS[dimension as keyof typeof HEXACO_DIMENSION_LABELS])}</td><td>${TRAIT_BAND_LABELS[result.band]}</td><td>${result.mean.toFixed(2)}</td></tr>`,
      )
      .join('')
    const motivationRows = Object.entries(score.motivation)
      .map(
        ([facet, result]) =>
          `<tr><td>${escapeHtml(MOTIVATION_FACET_LABELS[facet as keyof typeof MOTIVATION_FACET_LABELS])}</td><td>${TRAIT_BAND_LABELS[result.band]}</td><td>${result.mean.toFixed(2)}</td></tr>`,
      )
      .join('')

    personalitySection = `
  <h2>Work style & personality</h2>
  <p class="meta">Trait bands inform interview focus areas; not a standalone hiring decision.</p>
  <h3>HEXACO traits</h3>
  <table>
    <thead><tr><th>Trait</th><th>Band</th><th>Mean</th></tr></thead>
    <tbody>${dimensionRows}</tbody>
  </table>
  <h3>Work motivation</h3>
  <table>
    <thead><tr><th>Facet</th><th>Band</th><th>Mean</th></tr></thead>
    <tbody>${motivationRows}</tbody>
  </table>
  ${
    score.validity.flags.length > 0
      ? `<p><strong>Validity flags:</strong> ${escapeHtml(score.validity.flags.join(', '))}</p>`
      : ''
  }`
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Assessment Report — ${escapeHtml(candidate.name)}</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #111; padding: 32px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1rem; margin-top: 24px; }
    h3 { font-size: 0.95rem; margin-top: 16px; }
    .meta { color: #555; font-size: 0.9rem; margin-bottom: 24px; }
    .score { font-size: 2rem; font-weight: 700; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; font-size: 0.9rem; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>${escapeHtml(candidate.name)}</h1>
  <p class="meta">${escapeHtml(candidate.email)} · ${escapeHtml(candidate.hiringCompany || candidate.recruiterCompany)}</p>
  <p class="meta">Generated ${new Date().toLocaleString()} · Praxis Assessment Report</p>
  ${technicalSection}
  ${personalitySection}
</body>
</html>`

  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) return

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.onload = () => {
    printWindow.print()
  }
}
