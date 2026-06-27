export const HEXACO_DIMENSION_LABELS = {
  honestyHumility: 'Honesty-Humility',
  emotionality: 'Emotionality',
  extraversion: 'Extraversion',
  agreeableness: 'Agreeableness',
  conscientiousness: 'Conscientiousness',
  openness: 'Openness',
} as const

export const MOTIVATION_FACET_LABELS = {
  achievement: 'Achievement drive',
  autonomy: 'Autonomy preference',
  collaboration: 'Collaboration orientation',
} as const

export const TRAIT_BAND_LABELS = {
  low: 'Low',
  average: 'Average',
  high: 'High',
} as const

export const TRAIT_BAND_DESCRIPTIONS = {
  low: 'Below typical range for this trait in work settings.',
  average: 'Within the typical range for this trait in work settings.',
  high: 'Above typical range for this trait in work settings.',
} as const

export function traitBandColor(band: 'low' | 'average' | 'high'): string {
  if (band === 'high') return 'text-emerald-300'
  if (band === 'low') return 'text-amber-200'
  return 'text-slate-300'
}
