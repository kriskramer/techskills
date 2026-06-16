import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CandidateListItem } from '../../components/recruiter/CandidateListItem'
import { isFirebaseConfigured } from '../../lib/firebase'
import { subscribeToCandidates } from '../../services/candidates'
import type { Candidate } from '../../types/candidate'

export function RecruiterDashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])

  useEffect(() => {
    if (!isFirebaseConfigured) return
    return subscribeToCandidates(setCandidates)
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Recruiter workspace</h1>
          <p className="mt-1 text-sm text-slate-400">
            Add a candidate, generate a skills overview, and send a test invite.
          </p>
        </div>
        <Link
          to="/recruiter/new"
          className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          New recruit
        </Link>
      </div>

      {!isFirebaseConfigured && (
        <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          Firebase isn't configured yet — copy .env.example to .env.local and add your project's values to load
          candidates.
        </p>
      )}

      <div className="space-y-3">
        {candidates.map((candidate) => (
          <CandidateListItem key={candidate.id} candidate={candidate} />
        ))}
        {isFirebaseConfigured && candidates.length === 0 && (
          <p className="text-sm text-slate-400">No candidates yet. Click "New recruit" to get started.</p>
        )}
      </div>
    </div>
  )
}
