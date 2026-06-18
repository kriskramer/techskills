import { Link } from 'react-router-dom'
import type { Candidate } from '../../types/candidate'
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

interface CandidateListItemProps {
  candidate: Candidate
}

export function CandidateListItem({ candidate }: CandidateListItemProps) {
  const submittedAt = formatSubmittedAt(candidate.createdAt)

  return (
    <Link to={`/recruiter/candidates/${candidate.id}`}>
      <Card className="flex items-center justify-between gap-4 transition hover:border-cyan-300/40">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">{candidate.name}</p>
          <p className="truncate text-sm text-slate-400">{candidate.email}</p>
          {submittedAt && <p className="mt-1 text-xs text-slate-500">Submitted {submittedAt}</p>}
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
          {STATUS_LABEL[candidate.status]}
        </span>
      </Card>
    </Link>
  )
}
