import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../../components/shared/Card'
import { Spinner } from '../../components/shared/Spinner'
import { isFirebaseConfigured } from '../../lib/firebase'
import { getTest } from '../../services/tests'
import type { TestDoc } from '../../types/test'

export function TestResultsPage() {
  const { token } = useParams<{ token: string }>()
  const [test, setTest] = useState<TestDoc | null | undefined>(undefined)

  useEffect(() => {
    if (!token || !isFirebaseConfigured) return
    let active = true
    void getTest(token).then((result) => {
      if (active) setTest(result)
    })
    return () => {
      active = false
    }
  }, [token])

  if (!isFirebaseConfigured) {
    return (
      <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        Results aren't available — Firebase isn't configured.
      </p>
    )
  }

  if (test === undefined) {
    return <Spinner label="Loading your results…" />
  }

  if (!test || !test.score) {
    return <p className="text-sm text-slate-300">We couldn't find results for this assessment yet.</p>
  }

  return (
    <Card className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Thanks, {test.candidateName}!</h1>
      <p className="text-sm text-slate-300">
        You scored {test.score.correct} out of {test.score.total}.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {Object.entries(test.score.byCategory).map(([category, breakdown]) => (
          <div key={category} className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{category}</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {breakdown.correct} / {breakdown.total}
            </p>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-400">A recruiter will follow up with next steps.</p>
    </Card>
  )
}
