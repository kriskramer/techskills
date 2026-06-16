import type { TestQuestion } from '../../types/test'
import { Card } from '../shared/Card'

interface QuestionCardProps {
  question: TestQuestion
  index: number
  total: number
  value: string
  onChange: (value: string) => void
}

export function QuestionCard({ question, index, total, value, onChange }: QuestionCardProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        <span>
          Question {index + 1} of {total}
        </span>
        <span>{question.category}</span>
      </div>
      <p className="text-lg text-white">{question.prompt}</p>

      {question.type === 'multiple-choice' && question.options ? (
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                value === option
                  ? 'border-cyan-300 bg-cyan-300/10 text-white'
                  : 'border-white/10 bg-slate-950/60 text-slate-200 hover:border-cyan-300/40'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="accent-cyan-300"
              />
              {option}
            </label>
          ))}
        </div>
      ) : (
        <textarea
          rows={4}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type your answer…"
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
        />
      )}
    </Card>
  )
}
