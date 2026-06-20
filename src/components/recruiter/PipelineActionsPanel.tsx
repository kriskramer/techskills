import type { Candidate, PipelineStatus } from '../../types/candidate'
import { pipelineStatusLabel, pipelineStatusOptions } from '../../lib/pipeline'
import { Card } from '../shared/Card'

const PIPELINE_OPTIONS = pipelineStatusOptions()

interface PipelineActionsPanelProps {
  candidate: Candidate
  onUpdate: (status: PipelineStatus, note: string) => Promise<void>
  isSaving: boolean
}

export function PipelineActionsPanel({ candidate, onUpdate, isSaving }: PipelineActionsPanelProps) {
  const note = candidate.pipelineNote ?? ''

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Pipeline</h3>
          <p className="mt-1 text-sm text-slate-400">
            Current status:{' '}
            <span className="font-medium text-slate-200">
              {pipelineStatusLabel(candidate.pipelineStatus ?? 'active')}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PIPELINE_OPTIONS.map(({ value: status, label }) => (
          <button
            key={status}
            type="button"
            disabled={isSaving || (candidate.pipelineStatus ?? 'active') === status}
            onClick={() => void onUpdate(status, note)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              (candidate.pipelineStatus ?? 'active') === status
                ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-200'
                : 'border-white/20 text-slate-300 hover:border-cyan-300/60 hover:text-cyan-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)
          const nextNote = String(formData.get('pipeline-note') ?? '')
          void onUpdate(candidate.pipelineStatus ?? 'active', nextNote)
        }}
      >
        <div className="space-y-2">
          <label htmlFor="pipeline-note" className="text-sm font-medium text-slate-200">
            Note (optional)
          </label>
          <textarea
            id="pipeline-note"
            name="pipeline-note"
            rows={2}
            defaultValue={note}
            placeholder="Reason for hold, next steps, etc."
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300 placeholder:text-slate-600"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/40 hover:text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save note'}
        </button>
      </form>
    </Card>
  )
}
