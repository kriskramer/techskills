import { useState } from 'react'
import { extendTestInvite } from '../../services/functions'
import { Card } from '../shared/Card'
import type { TestDoc } from '../../types/test'

function isTestExpired(test: TestDoc): boolean {
  return test.status !== 'completed' && test.expiresAt != null && test.expiresAt.toDate() < new Date()
}

interface ExpiredInvitePanelProps {
  test: TestDoc
  onUpdated: () => void
}

export function ExpiredInvitePanel({ test, onUpdated }: ExpiredInvitePanelProps) {
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isTestExpired(test)) return null

  async function handleAction(action: 'extend' | 'regenerate') {
    setError(null)
    setIsWorking(true)
    try {
      await extendTestInvite(test.id, action)
      onUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong updating this invite.')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <Card className="space-y-3 border-rose-500/30 bg-rose-500/5">
      <div>
        <h3 className="text-lg font-semibold text-rose-100">Invite expired</h3>
        <p className="mt-1 text-sm text-slate-400">
          This test link is no longer valid. Extend the deadline or send a new assessment.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isWorking}
          onClick={() => void handleAction('extend')}
          className="rounded-full border border-cyan-300/60 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/10 disabled:opacity-50"
        >
          {isWorking ? 'Working…' : 'Extend 7 days'}
        </button>
        <button
          type="button"
          disabled={isWorking}
          onClick={() => void handleAction('regenerate')}
          className="rounded-full border border-cyan-300 bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
        >
          Send new assessment
        </button>
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
    </Card>
  )
}
