import type { TestDoc } from '../../types/test'
import { Card } from '../shared/Card'

const STATUS_LABEL: Record<TestDoc['status'], string> = {
  pending: 'Pending',
  'in-progress': 'In progress',
  completed: 'Completed',
  expired: 'Expired',
}

function formatTimestamp(value: TestDoc['createdAt'] | TestDoc['completedAt']): string | null {
  if (!value) return null
  return value.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function scorePercent(test: TestDoc): number | null {
  if (!test.score) return null
  return test.score.total > 0 ? Math.round((test.score.correct / test.score.total) * 100) : 0
}

function isTestExpired(test: TestDoc): boolean {
  return test.status !== 'completed' && test.expiresAt != null && test.expiresAt.toDate() < new Date()
}

interface TestHistoryPanelProps {
  tests: TestDoc[]
  currentTestId: string | null
}

export function TestHistoryPanel({ tests, currentTestId }: TestHistoryPanelProps) {
  if (tests.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-400">No test attempts yet. Generate a test from the overview tab.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {tests.map((test) => {
        const expired = isTestExpired(test)
        const pct = scorePercent(test)
        const dateLabel = formatTimestamp(test.completedAt ?? test.createdAt)
        const isCurrent = test.id === currentTestId

        return (
          <Card key={test.id} className={isCurrent ? 'border-cyan-300/40' : undefined}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">
                    {test.questions.length} questions · {test.durationMinutes} min
                  </p>
                  {isCurrent && (
                    <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2 py-0.5 text-xs font-medium text-cyan-200">
                      Current
                    </span>
                  )}
                </div>
                {dateLabel && <p className="text-sm text-slate-400">{dateLabel}</p>}
                {test.status === 'completed' && pct != null && test.score && (
                  <p className="text-sm text-cyan-300">
                    {pct}% ({test.score.correct}/{test.score.total} correct)
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                  expired
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                    : test.status === 'completed'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : 'border-white/10 bg-slate-900/70 text-slate-300'
                }`}
              >
                {expired ? 'Expired' : STATUS_LABEL[test.status]}
              </span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
