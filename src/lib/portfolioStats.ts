import type { Candidate } from '../types/candidate'
import type { TestDoc } from '../types/test'

export interface PortfolioStats {
  activeInvites: number
  awaitingResults: number
  completedThisWeek: number
  averageScorePercent: number | null
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

function isTestExpired(test: TestDoc): boolean {
  return test.status !== 'completed' && test.expiresAt != null && test.expiresAt.toDate() < new Date()
}

function scorePercent(test: TestDoc): number | null {
  if (!test.score || test.score.total <= 0) return null
  return Math.round((test.score.correct / test.score.total) * 100)
}

export function computePortfolioStats(
  candidates: Candidate[],
  testsByCandidateId: Record<string, TestDoc | null>,
): PortfolioStats {
  const now = Date.now()
  let activeInvites = 0
  let awaitingResults = 0
  let completedThisWeek = 0
  const completedScores: number[] = []

  for (const candidate of candidates) {
    if ((candidate.pipelineStatus ?? 'active') === 'archived') continue

    const test = candidate.testId ? testsByCandidateId[candidate.id] ?? null : null
    if (!test) continue

    if ((test.status === 'pending' || test.status === 'in-progress') && !isTestExpired(test)) {
      activeInvites++
    }

    if (
      (candidate.status === 'invited' || candidate.status === 'analyzed') &&
      test.status !== 'completed' &&
      !isTestExpired(test)
    ) {
      awaitingResults++
    }

    if (test.status === 'completed' && test.completedAt) {
      const completedMs = test.completedAt.toDate().getTime()
      if (now - completedMs <= MS_PER_WEEK) {
        completedThisWeek++
      }
      const pct = scorePercent(test)
      if (pct != null) completedScores.push(pct)
    }
  }

  const averageScorePercent =
    completedScores.length > 0
      ? Math.round(completedScores.reduce((sum, value) => sum + value, 0) / completedScores.length)
      : null

  return { activeInvites, awaitingResults, completedThisWeek, averageScorePercent }
}
