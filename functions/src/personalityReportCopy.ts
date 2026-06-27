type TraitBand = 'low' | 'average' | 'high'

type HexacoDimension =
  | 'honestyHumility'
  | 'emotionality'
  | 'extraversion'
  | 'agreeableness'
  | 'conscientiousness'
  | 'openness'

type MotivationFacet = 'achievement' | 'autonomy' | 'collaboration'

type TraitKey = HexacoDimension | MotivationFacet

interface TraitResult {
  mean: number
  band: TraitBand
}

export interface PersonalityScorePayload {
  dimensions: Record<HexacoDimension, TraitResult>
  motivation: Record<MotivationFacet, TraitResult>
  validity: {
    socialDesirability: number
    inconsistency: number
    flags: string[]
  }
}

interface SummaryBullet {
  headline: string
  body: string
}

interface ScoredTrait {
  key: TraitKey
  mean: number
  band: TraitBand
}

export const RECRUITER_EMAIL_DISCLAIMER =
  'This profile describes work-style tendencies, not ability or character. Use it alongside technical assessment results and structured interviews. Do not use personality results as the sole basis for hiring, rejection, or compensation decisions.'

const SUMMARY_BULLETS: Record<TraitKey, Partial<Record<'low' | 'high', SummaryBullet>>> = {
  honestyHumility: {
    high: {
      headline: 'Strong integrity signals',
      body: 'Reports high honesty-humility; probe ethical trade-offs and credit assignment in interview.',
    },
    low: {
      headline: 'Integrity worth probing',
      body: 'Reports lower honesty-humility; use behavioral examples around transparency and rule-bending.',
    },
  },
  emotionality: {
    high: {
      headline: 'Higher sensitivity to stress',
      body: 'Reports higher emotionality; discuss coping strategies for incidents, deadlines, and feedback.',
    },
    low: {
      headline: 'Calm under pressure',
      body: 'Reports lower emotionality; may handle incident or on-call stress well — confirm with examples.',
    },
  },
  extraversion: {
    high: {
      headline: 'Energized by interaction',
      body: 'Reports high extraversion; likely comfortable facilitating discussion and cross-team alignment.',
    },
    low: {
      headline: 'Prefers focused solo work',
      body: "Reports lower extraversion; confirm communication habits fit the team's collaboration model.",
    },
  },
  agreeableness: {
    high: {
      headline: 'Cooperative team style',
      body: 'Reports high agreeableness; probe ability to deliver constructive dissent when needed.',
    },
    low: {
      headline: 'Direct communication style',
      body: 'Reports lower agreeableness; probe conflict navigation and feedback delivery with examples.',
    },
  },
  conscientiousness: {
    high: {
      headline: 'Execution-oriented',
      body: 'Reports high conscientiousness; likely reliable on detail-heavy work such as testing, ops, and maintenance.',
    },
    low: {
      headline: 'Flexibility over rigor',
      body: 'Reports lower conscientiousness; probe quality habits and follow-through on long-running tasks.',
    },
  },
  openness: {
    high: {
      headline: 'Exploration-oriented',
      body: 'Reports high openness; may thrive on new tools, architecture, and ambiguous problem spaces.',
    },
    low: {
      headline: 'Prefers proven approaches',
      body: 'Reports lower openness; probe adaptability when requirements or technology shift.',
    },
  },
  achievement: {
    high: {
      headline: 'Goal-driven',
      body: 'Reports high achievement motivation; confirm the role offers meaningful targets and growth.',
    },
    low: {
      headline: 'Steady motivators',
      body: 'Reports lower achievement drive; probe what sustains engagement over multi-month work.',
    },
  },
  autonomy: {
    high: {
      headline: 'Prefers independent work',
      body: 'Reports high autonomy motivation; confirm the role offers self-direction and clear outcomes.',
    },
    low: {
      headline: 'Prefers structured guidance',
      body: 'Reports lower autonomy preference; confirm manager support and clear priorities are available.',
    },
  },
  collaboration: {
    high: {
      headline: 'Collaboration-oriented',
      body: 'Reports high collaboration motivation; confirm team structure supports shared ownership.',
    },
    low: {
      headline: 'Independent contributor style',
      body: 'Reports lower collaboration motivation; probe fit if the role is highly interdependent.',
    },
  },
}

const HEXACO_DIMENSIONS: HexacoDimension[] = [
  'honestyHumility',
  'emotionality',
  'extraversion',
  'agreeableness',
  'conscientiousness',
  'openness',
]

const MOTIVATION_FACETS: MotivationFacet[] = ['achievement', 'autonomy', 'collaboration']

function collectScoredTraits(score: PersonalityScorePayload): ScoredTrait[] {
  const dimensions = HEXACO_DIMENSIONS.map((key) => ({
    key,
    mean: score.dimensions[key].mean,
    band: score.dimensions[key].band,
  }))
  const motivation = MOTIVATION_FACETS.map((key) => ({
    key,
    mean: score.motivation[key].mean,
    band: score.motivation[key].band,
  }))
  return [...dimensions, ...motivation]
}

function getExtremeTraits(score: PersonalityScorePayload): ScoredTrait[] {
  return collectScoredTraits(score)
    .filter((trait) => trait.band === 'low' || trait.band === 'high')
    .sort((a, b) => Math.abs(b.mean - 3) - Math.abs(a.mean - 3))
}

export function buildExecutiveSummaryBullets(score: PersonalityScorePayload): SummaryBullet[] {
  const bullets: SummaryBullet[] = []

  for (const trait of getExtremeTraits(score).slice(0, 3)) {
    const template = SUMMARY_BULLETS[trait.key][trait.band as 'low' | 'high']
    if (template) bullets.push(template)
  }

  if (score.validity.flags.includes('social_desirability')) {
    bullets.push({
      headline: 'Interpret with caution',
      body: 'Response pattern suggests social desirability bias; use behavioral examples, not hypotheticals.',
    })
  } else if (score.validity.flags.includes('inconsistent_responses')) {
    bullets.push({
      headline: 'Interpret with caution',
      body: 'Inconsistent answers on paired items; clarify responses with specific examples in interview.',
    })
  }

  return bullets.slice(0, 5)
}

export function formatPersonalityCompletionEmail(
  candidateName: string,
  score: PersonalityScorePayload,
  candidateLink: string | null,
): string {
  const bullets = buildExecutiveSummaryBullets(score)
  const lines = [`${candidateName} has completed their work style & personality assessment.`, '']

  if (bullets.length > 0) {
    lines.push('Summary:')
    for (const bullet of bullets) {
      lines.push(`• ${bullet.headline} — ${bullet.body}`)
    }
    lines.push('')
  } else {
    lines.push('Summary: Profile is within typical ranges across all dimensions.', '')
  }

  if (score.validity.flags.length > 0) {
    lines.push(`Validity flags: ${score.validity.flags.join(', ')}`, '')
  } else {
    lines.push('Validity: Response pattern appears consistent.', '')
  }

  lines.push(RECRUITER_EMAIL_DISCLAIMER)

  if (candidateLink) {
    lines.push('', `View full report: ${candidateLink}`)
  }

  return lines.join('\n')
}
