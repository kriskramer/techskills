import { useState } from 'react'
import { CandidateListItem } from './CandidateListItem'
import { Card } from '../shared/Card'
import type { Candidate } from '../../types/candidate'
import type { TestDoc } from '../../types/test'

const DEFAULT_VISIBLE = 5

interface RecentSubmissionsListProps {
  candidates: Candidate[]
  totalCount?: number
  testsByCandidateId?: Record<string, TestDoc | null>
}

export function RecentSubmissionsList({
  candidates,
  totalCount,
  testsByCandidateId = {},
}: RecentSubmissionsListProps) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = candidates.length > DEFAULT_VISIBLE
  const visible = expanded ? candidates : candidates.slice(0, DEFAULT_VISIBLE)
  const portfolioTotal = totalCount ?? candidates.length

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent submissions</h2>
          <p className="mt-1 text-sm text-slate-400">
            {portfolioTotal === 0
              ? 'Your candidate submissions will appear here.'
              : candidates.length === portfolioTotal
                ? `${portfolioTotal} total submission${portfolioTotal === 1 ? '' : 's'}`
                : `Showing ${candidates.length} of ${portfolioTotal} submissions`}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((candidate) => (
          <CandidateListItem
            key={candidate.id}
            candidate={candidate}
            test={testsByCandidateId[candidate.id]}
          />
        ))}

        {candidates.length === 0 && portfolioTotal > 0 && (
          <Card className="text-center">
            <p className="text-sm text-slate-400">No submissions match your filters.</p>
          </Card>
        )}

        {portfolioTotal === 0 && (
          <Card className="text-center">
            <p className="text-sm text-slate-400">No submissions yet. Use the panel to add your first candidate.</p>
          </Card>
        )}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
        >
          {expanded ? 'Show fewer submissions' : `Show all ${candidates.length} submissions`}
        </button>
      )}
    </div>
  )
}
