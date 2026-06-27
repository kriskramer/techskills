import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../shared/Card'
import { Spinner } from '../../shared/Spinner'
import { saveAnswers, submitTest } from '../../../services/tests'
import { PERSONALITY_QUESTIONS_PER_PAGE } from '../../../types/personality'
import type { TestDoc } from '../../../types/test'
import { PersonalityProgressBar } from './PersonalityProgressBar'
import { PersonalityQuestionRow } from './PersonalityQuestionRow'

interface PersonalityRunnerProps {
  test: TestDoc
  token: string
}

function findInitialPage(
  questions: NonNullable<TestDoc['personalityQuestions']>,
  answers: Record<string, string>,
): number {
  const pageCount = Math.max(1, Math.ceil(questions.length / PERSONALITY_QUESTIONS_PER_PAGE))
  for (let page = 0; page < pageCount; page++) {
    const slice = questions.slice(
      page * PERSONALITY_QUESTIONS_PER_PAGE,
      (page + 1) * PERSONALITY_QUESTIONS_PER_PAGE,
    )
    if (slice.some((question) => !answers[question.id])) return page
  }
  return 0
}

export function PersonalityRunner({ test, token }: PersonalityRunnerProps) {
  const navigate = useNavigate()
  const questions = useMemo(() => test.personalityQuestions ?? [], [test.personalityQuestions])
  const [answers, setAnswers] = useState<Record<string, string>>(() => test.answers ?? {})
  const [pageIndex, setPageIndex] = useState(() => findInitialPage(questions, test.answers ?? {}))
  const [isReviewing, setIsReviewing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pendingAnswersRef = useRef<Record<string, string>>({})

  const pageCount = Math.max(1, Math.ceil(questions.length / PERSONALITY_QUESTIONS_PER_PAGE))

  const pageQuestions = useMemo(
    () =>
      questions.slice(
        pageIndex * PERSONALITY_QUESTIONS_PER_PAGE,
        (pageIndex + 1) * PERSONALITY_QUESTIONS_PER_PAGE,
      ),
    [questions, pageIndex],
  )

  const answeredCount = useMemo(
    () => questions.filter((question) => Boolean(answers[question.id])).length,
    [answers, questions],
  )

  const pageComplete = pageQuestions.every((question) => Boolean(answers[question.id]))
  const allComplete = answeredCount === questions.length

  const flushPendingAnswers = useCallback(async () => {
    const pending = pendingAnswersRef.current
    if (Object.keys(pending).length === 0) return
    try {
      await saveAnswers(token, pending)
      pendingAnswersRef.current = {}
    } catch {
      // Continue even if batch save fails
    }
  }, [token])

  function handleAnswer(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }))
    pendingAnswersRef.current[questionId] = value
  }

  async function handleContinue() {
    if (!pageComplete) return
    await flushPendingAnswers()
    if (pageIndex + 1 >= pageCount) {
      setIsReviewing(true)
      return
    }
    setPageIndex((current) => current + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleBack() {
    await flushPendingAnswers()
    if (isReviewing) {
      setIsReviewing(false)
      setPageIndex(pageCount - 1)
      return
    }
    setPageIndex((current) => Math.max(0, current - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    if (!allComplete || isSubmitting) return
    setIsSubmitting(true)
    try {
      await flushPendingAnswers()
      await submitTest(token, 'personality')
      navigate(`/test/${token}/results`)
    } catch {
      setIsSubmitting(false)
    }
  }

  if (questions.length === 0) {
    return <p className="text-sm text-slate-300">This personality assessment has no questions.</p>
  }

  if (isReviewing) {
    return (
      <Card className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Review and submit</h1>
          <p className="mt-2 text-sm text-slate-300">
            You answered {answeredCount} of {questions.length} questions.
          </p>
        </div>

        {!allComplete && (
          <p className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            Please go back and answer all questions before submitting.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleBack()}
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-slate-200 transition hover:border-white/40"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!allComplete || isSubmitting}
            className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting…' : 'Submit assessment'}
          </button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <PersonalityProgressBar
        answeredCount={answeredCount}
        totalCount={questions.length}
        pageIndex={pageIndex}
        pageCount={pageCount}
      />

      <Card className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Work Style & Personality</h1>
          <p className="mt-1 text-sm text-slate-400">
            Answer honestly based on how you typically behave at work. There are no right or wrong answers.
          </p>
        </div>

        <div className="space-y-3">
          {pageQuestions.map((question, index) => (
            <PersonalityQuestionRow
              key={question.id}
              question={question}
              index={pageIndex * PERSONALITY_QUESTIONS_PER_PAGE + index}
              value={answers[question.id]}
              onChange={handleAnswer}
              disabled={isSubmitting}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => void handleBack()}
            disabled={pageIndex === 0 || isSubmitting}
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-slate-200 transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => void handleContinue()}
            disabled={!pageComplete || isSubmitting}
            className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pageIndex + 1 >= pageCount ? 'Review answers →' : 'Continue →'}
          </button>
        </div>
      </Card>

      {isSubmitting && <Spinner label="Submitting your responses…" />}
    </div>
  )
}
