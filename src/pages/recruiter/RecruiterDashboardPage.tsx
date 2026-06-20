import { useEffect, useMemo, useState } from 'react'
import { computePortfolioStats } from '../../lib/portfolioStats'
import { NeedsAttentionQueue } from '../../components/recruiter/NeedsAttentionQueue'
import { NewSubmissionPanel } from '../../components/recruiter/NewSubmissionPanel'
import { PortfolioFiltersBar } from '../../components/recruiter/PortfolioFiltersBar'
import { PortfolioStatsBar } from '../../components/recruiter/PortfolioStatsBar'
import { RecentSubmissionsList } from '../../components/recruiter/RecentSubmissionsList'
import { Spinner } from '../../components/shared/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { mapTestsByCandidateId, useTestsByToken } from '../../hooks/usePortfolioTests'
import { isFirebaseConfigured } from '../../lib/firebase'
import {
  DEFAULT_PORTFOLIO_FILTERS,
  buildAttentionItems,
  filterCandidates,
  uniqueHiringCompanies,
  type PortfolioFilters,
} from '../../lib/portfolioFilters'
import { subscribeToCandidates } from '../../services/candidates'
import type { Candidate } from '../../types/candidate'

export function RecruiterDashboardPage() {
  const { uid, loading: authLoading } = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filters, setFilters] = useState<PortfolioFilters>(DEFAULT_PORTFOLIO_FILTERS)

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) return
    return subscribeToCandidates(uid, setCandidates)
  }, [uid])

  useEffect(() => {
    if (window.location.hash === '#new-submission') {
      document.getElementById('new-submission')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const testIds = useMemo(
    () => candidates.map((candidate) => candidate.testId).filter((testId): testId is string => Boolean(testId)),
    [candidates],
  )
  const testsByToken = useTestsByToken(testIds)
  const testsByCandidateId = useMemo(
    () => mapTestsByCandidateId(candidates, testsByToken),
    [candidates, testsByToken],
  )

  const filteredCandidates = useMemo(() => filterCandidates(candidates, filters), [candidates, filters])
  const hiringCompanies = useMemo(() => uniqueHiringCompanies(candidates), [candidates])
  const attentionItems = useMemo(
    () => buildAttentionItems(candidates, testsByCandidateId),
    [candidates, testsByCandidateId],
  )
  const portfolioStats = useMemo(
    () => computePortfolioStats(candidates, testsByCandidateId),
    [candidates, testsByCandidateId],
  )

  if (authLoading) {
    return <Spinner label="Loading dashboard…" />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Recruiter Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Review your portfolio, act on items that need attention, or add a new candidate.
        </p>
      </div>

      {!isFirebaseConfigured && (
        <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          Firebase isn't configured yet — copy .env.example to .env.local and add your project's values to load
          candidates.
        </p>
      )}

      <PortfolioStatsBar stats={portfolioStats} />

      <NeedsAttentionQueue items={attentionItems} />

      <PortfolioFiltersBar filters={filters} hiringCompanies={hiringCompanies} onChange={setFilters} />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
        <RecentSubmissionsList
          candidates={filteredCandidates}
          totalCount={candidates.length}
          testsByCandidateId={testsByCandidateId}
        />
        <div className="lg:sticky lg:top-8 lg:self-start">
          <NewSubmissionPanel />
        </div>
      </div>
    </div>
  )
}
