import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '../../components/shared/Card'
import { Spinner } from '../../components/shared/Spinner'
import { isFirebaseConfigured } from '../../lib/firebase'
import { getTest, startTest } from '../../services/tests'
import type { TestDoc } from '../../types/test'

export function TestLandingPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [test, setTest] = useState<TestDoc | null | undefined>(undefined)
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    if (!token || !isFirebaseConfigured) return
    let active = true
    void getTest(token).then((result) => {
      if (!active) return
      if (result?.status === 'in-progress') {
        navigate(`/test/${token}/run`, { replace: true })
        return
      }
      if (result?.status === 'completed') {
        navigate(`/test/${token}/results`, { replace: true })
        return
      }
      setTest(result)
    })
    return () => {
      active = false
    }
  }, [token, navigate])

  const isExpired =
    test != null &&
    test.status !== 'completed' &&
    test.expiresAt != null &&
    test.expiresAt.toDate() < new Date()

  async function handleStart() {
    if (!token) return
    setIsStarting(true)
    await startTest(token)
    navigate(`/test/${token}/run`)
  }

  if (!isFirebaseConfigured) {
    return (
      <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        This assessment link isn't ready yet — Firebase isn't configured.
      </p>
    )
  }

  if (test === undefined) {
    return <Spinner label="Loading your assessment…" />
  }

  if (test === null) {
    return <p className="text-sm text-slate-300">We couldn't find an assessment for this link.</p>
  }

  if (isExpired) {
    return (
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold text-white">This assessment link has expired</h1>
        <p className="text-sm text-slate-300">
          Assessment links are valid for 7 days. Please contact the recruiter if you believe this is a mistake.
        </p>
      </Card>
    )
  }

  return (
    <Card className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Hi {test.candidateName}, ready for your assessment?</h1>
      <p className="text-sm text-slate-300">
        This assessment has {test.questions.length} questions covering the skills on your resume. Each question is
        timed — once it expires you'll automatically move to the next one, so go with your gut.
      </p>
      <p className="text-sm text-slate-400">Estimated time: about {test.durationMinutes} minutes.</p>
      <button
        type="button"
        onClick={handleStart}
        disabled={isStarting}
        className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isStarting ? 'Starting…' : 'Start test'}
      </button>
    </Card>
  )
}
