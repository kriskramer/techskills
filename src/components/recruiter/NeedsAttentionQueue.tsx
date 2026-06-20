import { Link } from 'react-router-dom'
import type { AttentionItem } from '../../lib/portfolioFilters'
import { Card } from '../shared/Card'

const REASON_STYLE: Record<AttentionItem['reason'], string> = {
  unread_results: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100',
  invite_expiring: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
  stale_in_progress: 'border-violet-300/30 bg-violet-300/10 text-violet-100',
  analysis_failed: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
}

interface NeedsAttentionQueueProps {
  items: AttentionItem[]
}

export function NeedsAttentionQueue({ items }: NeedsAttentionQueueProps) {
  if (items.length === 0) return null

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-white">Needs attention</h2>
        <p className="mt-1 text-sm text-slate-400">
          {items.length} item{items.length === 1 ? '' : 's'} waiting for your action.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link key={`${item.candidateId}-${item.reason}`} to={`/recruiter/candidates/${item.candidateId}`}>
            <Card className={`transition hover:border-cyan-300/40 ${REASON_STYLE[item.reason]}`}>
              <p className="font-medium">{item.candidateName}</p>
              <p className="mt-1 text-sm opacity-90">{item.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
