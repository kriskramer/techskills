import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../../components/shared/Card'
import { Spinner } from '../../components/shared/Spinner'
import { isFirebaseConfigured } from '../../lib/firebase'
import { getTest } from '../../services/tests'
import type { TestDoc } from '../../types/test'

function CategoryBar({ label, correct, total }: { label: string; correct: number; total: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-200">{label}</span>
        <span className="text-slate-400">
          {correct}/{total} · {pct}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

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

  const overallPct = test.score.total > 0 ? Math.round((test.score.correct / test.score.total) * 100) : 0

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Thanks, {test.candidateName}!</h1>
        <p className="text-4xl font-bold text-cyan-300">
          {overallPct}%
          <span className="ml-2 text-lg font-normal text-slate-400">
            ({test.score.correct}/{test.score.total} correct)
          </span>
        </p>
        <div className="space-y-3 pt-2">
          {Object.entries(test.score.byCategory).map(([category, breakdown]) => (
            <CategoryBar
              key={category}
              label={category}
              correct={breakdown.correct}
              total={breakdown.total}
            />
          ))}
        </div>

        {test.score.bySkill && Object.keys(test.score.bySkill).length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">By skill</p>
            {Object.entries(test.score.bySkill)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([skill, breakdown]) => (
                <CategoryBar key={skill} label={skill} correct={breakdown.correct} total={breakdown.total} />
              ))}
          </div>
        )}
        <p className="pt-2 text-sm text-slate-400">A recruiter will follow up with next steps.</p>
      </Card>

      {test.questionBreakdown && test.questionBreakdown.length > 0 && (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Question breakdown</h2>
          <div className="space-y-3">
            {test.questionBreakdown.map((result, i) => (
              <div
                key={result.questionId}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  result.isCorrect ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'
                }`}
              >
                <p className="font-medium text-slate-200">
                  <span className="mr-2 text-slate-500">Q{i + 1}.</span>
                  {result.prompt}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <span className="text-slate-400">
                    Your answer:{' '}
                    <span className={result.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                      {result.candidateAnswer || <em>no answer</em>}
                    </span>
                  </span>
                  {!result.isCorrect && (
                    <span className="text-slate-400">
                      Correct: <span className="text-emerald-300">{result.correctAnswer}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

