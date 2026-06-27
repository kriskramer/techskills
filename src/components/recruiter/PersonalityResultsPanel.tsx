import type { PersonalityScore } from '../../types/personality'
import { PersonalityReportPanel } from './PersonalityReportPanel'

interface PersonalityResultsPanelProps {
  score: PersonalityScore
  title?: string
}

/** Candidate-facing wrapper — hides interview prep and executive summary. */
export function PersonalityResultsPanel({ score, title }: PersonalityResultsPanelProps) {
  return <PersonalityReportPanel score={score} mode="candidate" title={title} />
}
