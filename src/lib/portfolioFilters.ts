import type { Candidate, CandidateStatus } from '../types/candidate'
import type { TestDoc } from '../types/test'

export type PortfolioStatusFilter = CandidateStatus | 'all'

export interface PortfolioFilters {
  status: PortfolioStatusFilter
  search: string
  hiringCompany: string
  showArchived: boolean
}

export const DEFAULT_PORTFOLIO_FILTERS: PortfolioFilters = {
  status: 'all',
  search: '',
  hiringCompany: '',
  showArchived: false,
}

export function filterCandidates(candidates: Candidate[], filters: PortfolioFilters): Candidate[] {
  const search = filters.search.trim().toLowerCase()

  return candidates.filter((candidate) => {
    if (!filters.showArchived && (candidate.pipelineStatus ?? 'active') === 'archived') return false
    if (filters.status !== 'all' && candidate.status !== filters.status) return false
    if (filters.hiringCompany && candidate.hiringCompany !== filters.hiringCompany) return false
    if (!search) return true

    return (
      candidate.name.toLowerCase().includes(search) ||
      candidate.email.toLowerCase().includes(search)
    )
  })
}

export function uniqueHiringCompanies(candidates: Candidate[]): string[] {
  return [...new Set(candidates.map((candidate) => candidate.hiringCompany).filter(Boolean))].sort()
}

export type AttentionReason = 'unread_results' | 'invite_expiring' | 'stale_in_progress' | 'analysis_failed'

export interface AttentionItem {
  candidateId: string
  candidateName: string
  reason: AttentionReason
  label: string
}

const MS_PER_DAY = 24 * 60 * 60 * 1000
const MS_48H = 48 * 60 * 60 * 1000

function isTestExpired(test: TestDoc): boolean {
  return test.status !== 'completed' && test.expiresAt != null && test.expiresAt.toDate() < new Date()
}

function hasUnreadResults(candidate: Candidate, test: TestDoc | null): boolean {
  if (candidate.status !== 'completed' || !test || test.status !== 'completed' || !test.completedAt) return false
  if (!candidate.reviewedAt) return true
  return test.completedAt.toMillis() > candidate.reviewedAt.toMillis()
}

export function buildAttentionItems(
  candidates: Candidate[],
  testsByCandidateId: Record<string, TestDoc | null>,
): AttentionItem[] {
  const items: AttentionItem[] = []
  const now = Date.now()

  for (const candidate of candidates) {
    const test = candidate.testId ? testsByCandidateId[candidate.testId] ?? null : null

    if (candidate.analysisError) {
      items.push({
        candidateId: candidate.id,
        candidateName: candidate.name,
        reason: 'analysis_failed',
        label: 'Resume analysis failed — retry needed',
      })
    }

    if (hasUnreadResults(candidate, test)) {
      items.push({
        candidateId: candidate.id,
        candidateName: candidate.name,
        reason: 'unread_results',
        label: 'New test results to review',
      })
    }

    if (test && !isTestExpired(test) && (test.status === 'pending' || test.status === 'in-progress')) {
      if (test.expiresAt && test.expiresAt.toDate().getTime() - now <= MS_48H) {
        items.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          reason: 'invite_expiring',
          label: 'Test invite expiring within 48 hours',
        })
      }
    }

    if (test?.status === 'in-progress' && test.startedAt) {
      const startedMs = now - test.startedAt.toDate().getTime()
      if (startedMs > 3 * MS_PER_DAY) {
        items.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          reason: 'stale_in_progress',
          label: 'Test in progress for more than 3 days',
        })
      }
    }
  }

  return items
}

export function countUnreadResults(candidates: Candidate[], testsByCandidateId: Record<string, TestDoc | null>): number {
  return candidates.filter((candidate) => {
    const test = candidate.testId ? testsByCandidateId[candidate.testId] ?? null : null
    return hasUnreadResults(candidate, test)
  }).length
}
