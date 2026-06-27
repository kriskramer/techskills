import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../../components/shared/Card'
import { Spinner } from '../../components/shared/Spinner'
import { isFirebaseConfigured } from '../../lib/firebase'
import { getTest, startTest } from '../../services/tests'
import { TEST_TYPE_LABELS } from '../../types/assessmentBundle'
import type { TestDoc } from '../../types/test'

function questionCount(test: TestDoc): number {
  if (test.testType === 'personality') {
    return test.personalityQuestions?.length ?? 0
  }
  return test.questions.length
}

function landingCopy(test: TestDoc): { description: string; buttonLabel: string } {
  if (test.testType === 'personality') {
    return {
      description: `This assessment has ${questionCount(test)} untimed questions about your work style and motivation. You'll answer in batches of 10 — go at your own pace and respond based on how you typically behave at work.`,
      buttonLabel: 'Start assessment',
    }
  }
  return {
    description: `This assessment has ${questionCount(test)} questions covering the skills on your resume. Each question is timed — once it expires you'll automatically move to the next one, so go with your gut.`,
    buttonLabel: 'Start test',
  }
}

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

  const copy = landingCopy(test)

  return (
    <Card className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-cyan-300/80">
        {TEST_TYPE_LABELS[test.testType]}
      </p>
      <h1 className="text-2xl font-semibold text-white">Hi {test.candidateName}, ready for your assessment?</h1>
      <p className="text-sm text-slate-300">{copy.description}</p>
      <p className="text-sm text-slate-400">Estimated time: about {test.durationMinutes} minutes.</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleStart}
          disabled={isStarting}
          className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isStarting ? 'Starting…' : copy.buttonLabel}
        </button>
        <Link
          to="/recruit/tests"
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/60"
        >
          View all assessments
        </Link>
      </div>
    </Card>
  )
}
