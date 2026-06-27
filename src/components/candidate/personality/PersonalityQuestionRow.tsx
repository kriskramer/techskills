import type { PersonalityQuestion } from '../../../types/personality'
import { LikertScale } from './LikertScale'

interface PersonalityQuestionRowProps {
  question: PersonalityQuestion
  index: number
  value: string | undefined
  onChange: (questionId: string, value: string) => void
  disabled?: boolean
}

export function PersonalityQuestionRow({
  question,
  index,
  value,
  onChange,
  disabled,
}: PersonalityQuestionRowProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-4">
      <p className="text-sm font-medium text-white">
        {index + 1}. {question.prompt}
      </p>
      <LikertScale
        name={question.id}
        value={value}
        onChange={(next) => onChange(question.id, next)}
        disabled={disabled}
      />
    </div>
  )
}
