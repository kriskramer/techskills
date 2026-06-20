import { Link } from 'react-router-dom'
import type { Candidate } from '../../types/candidate'
import type { TestDoc } from '../../types/test'
import { pipelineStatusLabel } from '../../lib/pipeline'
import { Card } from '../shared/Card'

const STATUS_LABEL: Record<Candidate['status'], string> = {
  new: 'New',
  analyzed: 'Skills analyzed',
  invited: 'Test sent',
  completed: 'Test completed',
}

function formatSubmittedAt(createdAt: Candidate['createdAt']): string | null {
  if (!createdAt) return null
  const date = createdAt.toDate()
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function hasUnreadResults(candidate: Candidate, test: TestDoc | null | undefined): boolean {
  if (candidate.status !== 'completed' || !test || test.status !== 'completed' || !test.completedAt) return false
  if (!candidate.reviewedAt) return true
  return test.completedAt.toMillis() > candidate.reviewedAt.toMillis()
}

interface CandidateListItemProps {
  candidate: Candidate
  test?: TestDoc | null
}

export function CandidateListItem({ candidate, test }: CandidateListItemProps) {
  const submittedAt = formatSubmittedAt(candidate.createdAt)
  const unread = hasUnreadResults(candidate, test)

  return (
    <Link to={`/recruiter/candidates/${candidate.id}`}>
      <Card className="flex items-center justify-between gap-4 transition hover:border-cyan-300/40">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-lg font-semibold text-white">{candidate.name}</p>
            {unread && (
              <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
                New results
              </span>
            )}
            {candidate.pipelineStatus && candidate.pipelineStatus !== 'active' && (
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                {pipelineStatusLabel(candidate.pipelineStatus)}
              </span>
            )}
            {candidate.analysisError && (
              <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-200">
                Analysis failed
              </span>
            )}
          </div>
          <p className="truncate text-sm text-slate-400">{candidate.email}</p>
          {candidate.hiringCompany && (
            <p className="truncate text-xs text-slate-500">{candidate.hiringCompany}</p>
          )}
          {submittedAt && <p className="mt-1 text-xs text-slate-500">Submitted {submittedAt}</p>}
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
          {STATUS_LABEL[candidate.status]}
        </span>
      </Card>
    </Link>
  )
}
