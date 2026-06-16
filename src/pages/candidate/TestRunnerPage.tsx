import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QuestionCard } from '../../components/candidate/QuestionCard'
import { TestTimer } from '../../components/candidate/TestTimer'
import { Spinner } from '../../components/shared/Spinner'
import { isFirebaseConfigured } from '../../lib/firebase'
import { getTest, submitTest } from '../../services/tests'
import type { TestDoc } from '../../types/test'

export function TestRunnerPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [test, setTest] = useState<TestDoc | null | undefined>(undefined)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token || !isFirebaseConfigured) return
    let active = true
    void getTest(token).then((result) => {
      if (!active) return
      if (!result || result.status === 'pending') {
        navigate(`/test/${token}`, { replace: true })
        return
      }
      if (result.status === 'completed') {
        navigate(`/test/${token}/results`, { replace: true })
        return
      }
      setTest(result)
    })
    return () => {
      active = false
    }
  }, [token, navigate])

  const handleSubmit = useCallback(
    async (finalAnswers: Record<string, string>) => {
      if (!token) return
      setIsSubmitting(true)
      await submitTest(token, finalAnswers)
      navigate(`/test/${token}/results`)
    },
    [token, navigate],
  )

  const handleAdvance = useCallback(
    (questionId: string, answer: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: answer }

        if (!test) return next

        if (currentIndex + 1 >= test.questions.length) {
          void handleSubmit(next)
        } else {
          setCurrentIndex((index) => index + 1)
        }

        return next
      })
    },
    [currentIndex, test, handleSubmit],
  )

  if (!isFirebaseConfigured) {
    return (
      <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        This assessment link isn't ready yet — Firebase isn't configured.
      </p>
    )
  }

  if (!test) {
    return <Spinner label="Loading your assessment…" />
  }

  const question = test.questions[currentIndex]
  const currentAnswer = answers[question.id] ?? ''
  const isLastQuestion = currentIndex + 1 === test.questions.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{test.candidateName}'s assessment</p>
        <TestTimer
          key={question.id}
          seconds={question.timeLimitSeconds}
          onExpire={() => handleAdvance(question.id, currentAnswer)}
        />
      </div>

      <QuestionCard
        question={question}
        index={currentIndex}
        total={test.questions.length}
        value={currentAnswer}
        onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => handleAdvance(question.id, currentAnswer)}
          disabled={isSubmitting}
          className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLastQuestion ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  )
}
