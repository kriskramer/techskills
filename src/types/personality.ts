export type RoleArchetypeId =
  | 'general'
  | 'ic-deep'
  | 'tech-lead'
  | 'sre-ops'
  | 'startup-general'
  | 'enterprise-team'

export type HexacoDimension =
  | 'honestyHumility'
  | 'emotionality'
  | 'extraversion'
  | 'agreeableness'
  | 'conscientiousness'
  | 'openness'

export type MotivationFacet = 'achievement' | 'autonomy' | 'collaboration'

export type TraitBand = 'low' | 'average' | 'high'

export interface TraitResult {
  mean: number
  band: TraitBand
}

export interface PersonalityQuestion {
  id: string
  prompt: string
  dimension: HexacoDimension | 'motivation'
  facet?: MotivationFacet
  keyed: 'positive' | 'negative'
  isValidityItem?: boolean
  /** Paired item id for inconsistency detection */
  consistencyPairId?: string
}

export interface PersonalityScore {
  dimensions: Record<HexacoDimension, TraitResult>
  motivation: Record<MotivationFacet, TraitResult>
  validity: {
    socialDesirability: number
    inconsistency: number
    flags: string[]
  }
}

export const LIKERT_LABELS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
] as const

export const PERSONALITY_QUESTIONS_PER_PAGE = 10

export const PERSONALITY_ESTIMATED_MINUTES = 15
