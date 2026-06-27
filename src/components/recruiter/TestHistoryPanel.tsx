import { useState } from 'react'
import { useInviteCooldown } from '../../hooks/useInviteCooldown'
import { cancelTest, extendTestInvite, sendInvitation } from '../../services/functions'
import { TEST_TYPE_LABELS } from '../../types/assessmentBundle'
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
  return test.status === 'expired' || (test.status !== 'completed' && test.expiresAt != null && test.expiresAt.toDate() < new Date())
}

function isActiveCurrentTest(test: TestDoc, currentTestId: string | null): boolean {
  return test.id === currentTestId && !isTestExpired(test) && (test.status === 'pending' || test.status === 'in-progress')
}

function ResendInviteButton({
  test,
  isWorking,
  onResend,
}: {
  test: TestDoc
  isWorking: boolean
  onResend: (test: TestDoc) => Promise<void>
}) {
  const { canSend, isOnCooldown, isAtMaxSends, remainingLabel } = useInviteCooldown(
    test.lastInvitationSentAt,
    test.invitationSendCount ?? 0,
  )

  let label = 'Resend invite'
  if (isWorking) {
    label = 'Sending…'
  } else if (isAtMaxSends) {
    label = 'Send limit reached'
  } else if (isOnCooldown) {
    label = `Resend in ${remainingLabel}`
  }

  return (
    <button
      type="button"
      disabled={isWorking || !canSend}
      onClick={() => void onResend(test)}
      className="rounded-full border border-cyan-300/60 px-4 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  )
}

interface TestHistoryPanelProps {
  tests: TestDoc[]
  currentTestId: string | null
  candidateId: string
}

export function TestHistoryPanel({ tests, currentTestId, candidateId }: TestHistoryPanelProps) {
  const [workingTestId, setWorkingTestId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  if (tests.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-400">No test attempts yet. Generate a test from the overview tab.</p>
      </Card>
    )
  }

  async function handleCancel(test: TestDoc) {
    setActionError(null)
    setWorkingTestId(test.id)
    try {
      await cancelTest(test.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong cancelling this test.')
    } finally {
      setWorkingTestId(null)
    }
  }

  async function handleResend(test: TestDoc) {
    setActionError(null)
    setWorkingTestId(test.id)
    const inviteUrl = `${window.location.origin}/test/${test.id}`
    try {
      await sendInvitation(candidateId, inviteUrl)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong sending the invite.')
    } finally {
      setWorkingTestId(null)
    }
  }

  async function handleRestart(test: TestDoc) {
    setActionError(null)
    setWorkingTestId(test.id)
    try {
      await extendTestInvite(test.id, 'regenerate')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong restarting this test.')
    } finally {
      setWorkingTestId(null)
    }
  }

  return (
    <div className="space-y-3">
      {tests.map((test) => {
        const expired = isTestExpired(test)
        const pct = scorePercent(test)
        const dateLabel = formatTimestamp(test.completedAt ?? test.createdAt)
        const isCurrent = test.id === currentTestId
        const showActions = isActiveCurrentTest(test, currentTestId)
        const isWorking = workingTestId === test.id

        return (
          <Card key={test.id} className={isCurrent ? 'border-cyan-300/40' : undefined}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{TEST_TYPE_LABELS[test.testType]}</p>
                  <p className="text-sm text-slate-400">
                    {test.testType === 'personality'
                      ? (test.personalityQuestions?.length ?? 0)
                      : test.questions.length}{' '}
                    questions · {test.durationMinutes} min
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

            {showActions && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() => void handleCancel(test)}
                  className="rounded-full border border-rose-500/40 px-4 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isWorking ? 'Working…' : 'Cancel test'}
                </button>
                {test.status === 'pending' ? (
                  <ResendInviteButton
                    test={test}
                    isWorking={isWorking}
                    onResend={handleResend}
                  />
                ) : (
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={() => void handleRestart(test)}
                    className="rounded-full border border-cyan-300 bg-cyan-300 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isWorking ? 'Working…' : 'Restart test'}
                  </button>
                )}
              </div>
            )}
          </Card>
        )
      })}
      {actionError && <p className="text-sm text-rose-300">{actionError}</p>}
    </div>
  )
}
