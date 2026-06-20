import { useEffect, useState } from 'react'
import { formatQuestionDifficultyLabel, questionDifficultyBadgeClass } from '../../lib/questionDifficulty'
import { getTestPreview } from '../../services/functions'
import type { TestDoc } from '../../types/test'

interface TestPreviewModalProps {
  test: TestDoc
  onClose: () => void
}

export function TestPreviewModal({ test, onClose }: TestPreviewModalProps) {
  const [answerKey, setAnswerKey] = useState<Record<string, string> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    let cancelled = false

    async function loadAnswerKey() {
      setIsLoading(true)
      setError(null)

      const fromBreakdown = test.questionBreakdown?.reduce<Record<string, string>>((acc, result) => {
        acc[result.questionId] = result.correctAnswer
        return acc
      }, {})

      if (fromBreakdown && Object.keys(fromBreakdown).length > 0) {
        if (!cancelled) {
          setAnswerKey(fromBreakdown)
          setIsLoading(false)
        }
        return
      }

      try {
        const preview = await getTestPreview(test.id)
        if (!cancelled) {
          setAnswerKey(preview.answerKey)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load test preview.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadAnswerKey()

    return () => {
      cancelled = true
    }
  }, [test.id, test.questionBreakdown])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="test-preview-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 id="test-preview-title" className="text-lg font-semibold text-white">
              Test preview
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {test.questions.length} questions · {test.durationMinutes} min
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4">
          {isLoading && <p className="text-sm text-slate-400">Loading questions…</p>}
          {error && <p className="text-sm text-rose-300">{error}</p>}

          {!isLoading && !error && answerKey && (
            <div className="space-y-4">
              {test.questions.map((question, index) => {
                const correctAnswer = answerKey[question.id] ?? ''

                return (
                  <div
                    key={question.id}
                    className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Q{index + 1}
                      </span>
                      <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-0.5 text-xs font-medium text-cyan-200">
                        {question.category}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${questionDifficultyBadgeClass(question)}`}
                      >
                        {formatQuestionDifficultyLabel(question)}
                      </span>
                    </div>

                    <p className="mt-3 font-medium text-slate-200">{question.prompt}</p>

                    {question.type === 'multiple-choice' && question.options ? (
                      <div className="mt-3 space-y-2">
                        {question.options.map((option) => {
                          const isCorrect =
                            option.trim().toLowerCase() === correctAnswer.trim().toLowerCase()

                          return (
                            <div
                              key={option}
                              className={`rounded-xl border px-4 py-2.5 ${
                                isCorrect
                                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                                  : 'border-white/10 bg-slate-950/60 text-slate-300'
                              }`}
                            >
                              {option}
                              {isCorrect && (
                                <span className="ml-2 text-xs font-medium uppercase tracking-wide text-emerald-300">
                                  Correct
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-emerald-100">
                        <span className="text-xs font-medium uppercase tracking-wide text-emerald-300">
                          Correct answer
                        </span>
                        <p className="mt-1">{correctAnswer || <em className="text-slate-400">Not available</em>}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
