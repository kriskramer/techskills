import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QuestionCard } from '../../components/candidate/QuestionCard'
import { TestTimer } from '../../components/candidate/TestTimer'
import { Spinner } from '../../components/shared/Spinner'
import { isFirebaseConfigured } from '../../lib/firebase'
import { getTest, saveAnswers, submitTest } from '../../services/tests'
import type { TestDoc } from '../../types/test'

const ANSWER_FLUSH_INTERVAL = 4

export function TestRunnerPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [test, setTest] = useState<TestDoc | null | undefined>(undefined)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pendingAnswersRef = useRef<Record<string, string>>({})
  const answersSinceFlushRef = useRef(0)

  const flushPendingAnswers = useCallback(async () => {
    if (!token) return
    const pending = pendingAnswersRef.current
    if (Object.keys(pending).length === 0) return
    try {
      await saveAnswers(token, pending)
      pendingAnswersRef.current = {}
      answersSinceFlushRef.current = 0
    } catch {
      // Continue even if the batch save fails
    }
  }, [token])

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

      const savedAnswers = result.answers ?? {}
      setAnswers(savedAnswers)
      const firstUnanswered = result.questions.findIndex((q) => !savedAnswers[q.id])
      setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0)
    })
    return () => {
      active = false
    }
  }, [token, navigate])

  const handleAdvance = useCallback(
    async (questionId: string, answer: string) => {
      if (!token || !test || isSubmitting) return

      const nextAnswers = { ...answers, [questionId]: answer }
      setAnswers(nextAnswers)
      pendingAnswersRef.current[questionId] = answer
      answersSinceFlushRef.current += 1

      const isLastQuestion = currentIndex + 1 >= test.questions.length
      if (isLastQuestion || answersSinceFlushRef.current >= ANSWER_FLUSH_INTERVAL) {
        await flushPendingAnswers()
      }

      if (isLastQuestion) {
        setIsSubmitting(true)
        try {
          await submitTest(token)
          navigate(`/test/${token}/results`)
        } catch {
          setIsSubmitting(false)
        }
      } else {
        setCurrentIndex((i) => i + 1)
      }
    },
    [token, test, currentIndex, isSubmitting, navigate, answers, flushPendingAnswers],
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
          onExpire={() => void handleAdvance(question.id, currentAnswer)}
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
          onClick={() => void handleAdvance(question.id, currentAnswer)}
          disabled={isSubmitting}
          className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLastQuestion ? (isSubmitting ? 'Submitting…' : 'Submit') : 'Next'}
        </button>
      </div>
    </div>
  )
}
