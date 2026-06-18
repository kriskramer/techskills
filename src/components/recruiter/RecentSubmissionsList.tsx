import { useState } from 'react'
import { CandidateListItem } from './CandidateListItem'
import { Card } from '../shared/Card'
import type { Candidate } from '../../types/candidate'

const DEFAULT_VISIBLE = 5

interface RecentSubmissionsListProps {
  candidates: Candidate[]
}

export function RecentSubmissionsList({ candidates }: RecentSubmissionsListProps) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = candidates.length > DEFAULT_VISIBLE
  const visible = expanded ? candidates : candidates.slice(0, DEFAULT_VISIBLE)

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent submissions</h2>
          <p className="mt-1 text-sm text-slate-400">
            {candidates.length === 0
              ? 'Your candidate submissions will appear here.'
              : `${candidates.length} total submission${candidates.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((candidate) => (
          <CandidateListItem key={candidate.id} candidate={candidate} />
        ))}

        {candidates.length === 0 && (
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
