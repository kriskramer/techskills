import type { PortfolioStats } from '../../lib/portfolioStats'
import { Card } from '../shared/Card'

interface PortfolioStatsBarProps {
  stats: PortfolioStats
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="space-y-1">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </Card>
  )
}

export function PortfolioStatsBar({ stats }: PortfolioStatsBarProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Active invites" value={String(stats.activeInvites)} />
      <StatCard label="Awaiting results" value={String(stats.awaitingResults)} />
      <StatCard label="Completed this week" value={String(stats.completedThisWeek)} />
      <StatCard
        label="Avg score (completed)"
        value={stats.averageScorePercent != null ? `${stats.averageScorePercent}%` : '—'}
      />
    </div>
  )
}
