import { Link } from 'react-router-dom'
import type { Candidate } from '../../types/candidate'
import { Card } from '../shared/Card'

const STATUS_LABEL: Record<Candidate['status'], string> = {
  new: 'New',
  analyzed: 'Skills analyzed',
  invited: 'Test sent',
  completed: 'Test completed',
}

interface CandidateListItemProps {
  candidate: Candidate
}

export function CandidateListItem({ candidate }: CandidateListItemProps) {
  return (
    <Link to={`/recruiter/candidates/${candidate.id}`}>
      <Card className="flex items-center justify-between transition hover:border-cyan-300/40">
        <div>
          <p className="text-lg font-semibold text-white">{candidate.name}</p>
          <p className="text-sm text-slate-400">{candidate.email}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
          {STATUS_LABEL[candidate.status]}
        </span>
      </Card>
    </Link>
  )
}
