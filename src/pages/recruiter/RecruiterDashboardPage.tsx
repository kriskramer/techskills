import { useEffect, useState } from 'react'
import { NewSubmissionPanel } from '../../components/recruiter/NewSubmissionPanel'
import { RecentSubmissionsList } from '../../components/recruiter/RecentSubmissionsList'
import { isFirebaseConfigured } from '../../lib/firebase'
import { subscribeToCandidates } from '../../services/candidates'
import type { Candidate } from '../../types/candidate'

export function RecruiterDashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])

  useEffect(() => {
    if (!isFirebaseConfigured) return
    return subscribeToCandidates(setCandidates)
  }, [])

  useEffect(() => {
    if (window.location.hash === '#new-submission') {
      document.getElementById('new-submission')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Review recent submissions or add a new candidate to analyze and invite.
        </p>
      </div>

      {!isFirebaseConfigured && (
        <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          Firebase isn't configured yet — copy .env.example to .env.local and add your project's values to load
          candidates.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
        <RecentSubmissionsList candidates={candidates} />
        <div className="lg:sticky lg:top-8 lg:self-start">
          <NewSubmissionPanel />
        </div>
      </div>
    </div>
  )
}
