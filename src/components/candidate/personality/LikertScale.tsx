import { LIKERT_LABELS } from '../../../types/personality'

interface LikertScaleProps {
  name: string
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function LikertScale({ name, value, onChange, disabled = false }: LikertScaleProps) {
  return (
    <fieldset className="mt-2" disabled={disabled}>
      <legend className="sr-only">Rate your agreement</legend>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1">
        {LIKERT_LABELS.map((label, index) => {
          const optionValue = String(index + 1)
          const id = `${name}-${optionValue}`
          return (
            <label
              key={optionValue}
              htmlFor={id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 text-xs transition sm:flex-1 sm:flex-col sm:px-1 sm:py-2 sm:text-center ${
                value === optionValue
                  ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100'
                  : 'border-white/10 bg-slate-950/40 text-slate-400 hover:border-white/20'
              }`}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={optionValue}
                checked={value === optionValue}
                onChange={() => onChange(optionValue)}
                className="sr-only"
              />
              <span className="font-semibold text-slate-300 sm:text-sm">{optionValue}</span>
              <span className="leading-tight">{label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
