import type { PipelineStatus } from '../types/candidate'

const PIPELINE_LABEL: Record<PipelineStatus, string> = {
  active: 'Active',
  advance: 'Advance',
  hold: 'On hold',
  archived: 'Archived',
}

export function pipelineStatusLabel(status: PipelineStatus): string {
  return PIPELINE_LABEL[status]
}

export function pipelineStatusOptions(): { value: PipelineStatus; label: string }[] {
  return (['active', 'advance', 'hold', 'archived'] as const).map((value) => ({
    value,
    label: value === 'advance' ? 'Advance' : PIPELINE_LABEL[value],
  }))
}
