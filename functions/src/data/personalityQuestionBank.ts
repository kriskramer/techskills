export type HexacoDimension =
  | 'honestyHumility'
  | 'emotionality'
  | 'extraversion'
  | 'agreeableness'
  | 'conscientiousness'
  | 'openness'

export type MotivationFacet = 'achievement' | 'autonomy' | 'collaboration'

export type TestType = 'technical' | 'personality' | 'cognitive'

export interface PersonalityQuestionBankEntry {
  id: string
  prompt: string
  dimension: HexacoDimension | 'motivation'
  facet?: MotivationFacet
  keyed: 'positive' | 'negative'
  isValidityItem?: boolean
  consistencyPairId?: string
}

export interface PersonalityScoringKeyEntry {
  dimension: HexacoDimension | 'motivation'
  facet?: MotivationFacet
  keyed: 'positive' | 'negative'
  isValidityItem?: boolean
  consistencyPairId?: string
}

export const PERSONALITY_ESTIMATED_MINUTES = 15

type ItemDef = Omit<PersonalityQuestionBankEntry, 'id'>

function items(prefix: string, defs: ItemDef[]): PersonalityQuestionBankEntry[] {
  return defs.map((def, index) => ({ ...def, id: `${prefix}-${String(index + 1).padStart(2, '0')}` }))
}

const honestyHumility = items('hh', [
  { prompt: 'At work, I would never accept a bribe, even a small one.', dimension: 'honestyHumility', keyed: 'positive' },
  { prompt: 'I would use flattery to get a raise or promotion, even if I felt I didn\'t deserve it.', dimension: 'honestyHumility', keyed: 'negative' },
  { prompt: 'I keep my promises at work, even when it is inconvenient.', dimension: 'honestyHumility', keyed: 'positive' },
  { prompt: 'I would pretend to be more knowledgeable than I am to impress colleagues.', dimension: 'honestyHumility', keyed: 'negative' },
  { prompt: 'I return extra change or company property I find by mistake.', dimension: 'honestyHumility', keyed: 'positive' },
  { prompt: 'I believe it is acceptable to take small supplies from work for personal use.', dimension: 'honestyHumility', keyed: 'negative' },
  { prompt: 'I give credit to others for their contributions on shared projects.', dimension: 'honestyHumility', keyed: 'positive' },
  { prompt: 'I am willing to bend rules if it helps me meet my targets.', dimension: 'honestyHumility', keyed: 'negative' },
  { prompt: 'I admit my mistakes openly rather than covering them up.', dimension: 'honestyHumility', keyed: 'positive' },
  { prompt: 'I think people who always follow every rule are naive.', dimension: 'honestyHumility', keyed: 'negative' },
])

const emotionality = items('em', [
  { prompt: 'Work setbacks tend to worry me for a long time.', dimension: 'emotionality', keyed: 'positive' },
  { prompt: 'I stay calm under pressure at work.', dimension: 'emotionality', keyed: 'negative' },
  { prompt: 'I feel anxious before important presentations or reviews.', dimension: 'emotionality', keyed: 'positive' },
  { prompt: 'Criticism from my manager rarely bothers me.', dimension: 'emotionality', keyed: 'negative' },
  { prompt: 'I need reassurance from colleagues when facing uncertain projects.', dimension: 'emotionality', keyed: 'positive' },
  { prompt: 'I recover quickly after a difficult day at work.', dimension: 'emotionality', keyed: 'negative' },
  { prompt: 'I take workplace conflicts personally.', dimension: 'emotionality', keyed: 'positive' },
  { prompt: 'I rarely feel stressed about deadlines.', dimension: 'emotionality', keyed: 'negative' },
  { prompt: 'I am sensitive to tension in my team.', dimension: 'emotionality', keyed: 'positive' },
  { prompt: 'I do not get emotional about work problems.', dimension: 'emotionality', keyed: 'negative' },
])

const extraversion = items('ex', [
  { prompt: 'I feel energized when collaborating with a large group.', dimension: 'extraversion', keyed: 'positive' },
  { prompt: 'I prefer to work independently rather than in team settings.', dimension: 'extraversion', keyed: 'negative' },
  { prompt: 'I enjoy being the one to present ideas in meetings.', dimension: 'extraversion', keyed: 'positive' },
  { prompt: 'I find networking events draining.', dimension: 'extraversion', keyed: 'negative' },
  { prompt: 'I start conversations easily with new colleagues.', dimension: 'extraversion', keyed: 'positive' },
  { prompt: 'I avoid speaking up unless I am directly asked.', dimension: 'extraversion', keyed: 'negative' },
  { prompt: 'I like roles that involve frequent interaction with clients.', dimension: 'extraversion', keyed: 'positive' },
  { prompt: 'I need quiet time alone to recharge after a busy workday.', dimension: 'extraversion', keyed: 'negative' },
  { prompt: 'I am comfortable leading group discussions.', dimension: 'extraversion', keyed: 'positive' },
  { prompt: 'I would rather communicate by email than face-to-face when possible.', dimension: 'extraversion', keyed: 'negative' },
])

const agreeableness = items('ag', [
  { prompt: 'I go out of my way to help colleagues who are struggling.', dimension: 'agreeableness', keyed: 'positive' },
  { prompt: 'I speak bluntly even when it might hurt someone\'s feelings.', dimension: 'agreeableness', keyed: 'negative' },
  { prompt: 'I try to find compromise when teammates disagree.', dimension: 'agreeableness', keyed: 'positive' },
  { prompt: 'I find it hard to forgive a coworker who wronged me.', dimension: 'agreeableness', keyed: 'negative' },
  { prompt: 'I consider others\' perspectives before making decisions.', dimension: 'agreeableness', keyed: 'positive' },
  { prompt: 'I enjoy debating and winning arguments at work.', dimension: 'agreeableness', keyed: 'negative' },
  { prompt: 'I am patient when training new team members.', dimension: 'agreeableness', keyed: 'positive' },
  { prompt: 'I tend to be skeptical of others\' good intentions.', dimension: 'agreeableness', keyed: 'negative' },
  { prompt: 'I prioritize team harmony over being right.', dimension: 'agreeableness', keyed: 'positive' },
  { prompt: 'I have little sympathy for coworkers who complain often.', dimension: 'agreeableness', keyed: 'negative' },
])

const conscientiousness = items('co', [
  { prompt: 'I plan my work carefully before starting a task.', dimension: 'conscientiousness', keyed: 'positive' },
  { prompt: 'I often leave tasks until the last minute.', dimension: 'conscientiousness', keyed: 'negative' },
  { prompt: 'I pay close attention to detail in my deliverables.', dimension: 'conscientiousness', keyed: 'positive' },
  { prompt: 'I sometimes skip steps in a process to save time.', dimension: 'conscientiousness', keyed: 'negative' },
  { prompt: 'I follow through on commitments even when motivation fades.', dimension: 'conscientiousness', keyed: 'positive' },
  { prompt: 'My workspace and files tend to be disorganized.', dimension: 'conscientiousness', keyed: 'negative' },
  { prompt: 'I set clear goals and track progress toward them.', dimension: 'conscientiousness', keyed: 'positive' },
  { prompt: 'I find it difficult to stay focused on repetitive work.', dimension: 'conscientiousness', keyed: 'negative' },
  { prompt: 'I double-check my work before submitting it.', dimension: 'conscientiousness', keyed: 'positive' },
  { prompt: 'I prefer to wing it rather than prepare thoroughly.', dimension: 'conscientiousness', keyed: 'negative' },
])

const openness = items('op', [
  { prompt: 'I enjoy learning new tools and technologies at work.', dimension: 'openness', keyed: 'positive' },
  { prompt: 'I prefer sticking to methods I already know well.', dimension: 'openness', keyed: 'negative' },
  { prompt: 'I am curious about ideas outside my area of expertise.', dimension: 'openness', keyed: 'positive' },
  { prompt: 'I dislike when my routine tasks change unexpectedly.', dimension: 'openness', keyed: 'negative' },
  { prompt: 'I like brainstorming creative solutions to problems.', dimension: 'openness', keyed: 'positive' },
  { prompt: 'I think most new workplace initiatives are unnecessary.', dimension: 'openness', keyed: 'negative' },
  { prompt: 'I seek out diverse viewpoints when solving complex problems.', dimension: 'openness', keyed: 'positive' },
  { prompt: 'I prefer clear rules over ambiguous, open-ended projects.', dimension: 'openness', keyed: 'negative' },
  { prompt: 'I appreciate art, design, or aesthetics in my work environment.', dimension: 'openness', keyed: 'positive' },
  { prompt: 'I avoid abstract discussions in favor of practical action.', dimension: 'openness', keyed: 'negative' },
])

const motivation = items('mo', [
  { prompt: 'I set ambitious goals for myself at work.', dimension: 'motivation', facet: 'achievement', keyed: 'positive' },
  { prompt: 'Meeting stretch targets gives me a strong sense of satisfaction.', dimension: 'motivation', facet: 'achievement', keyed: 'positive' },
  { prompt: 'I push myself to exceed expectations, not just meet them.', dimension: 'motivation', facet: 'achievement', keyed: 'positive' },
  { prompt: 'I am motivated by recognition for outstanding performance.', dimension: 'motivation', facet: 'achievement', keyed: 'positive' },
  { prompt: 'I prefer having freedom to decide how I complete my work.', dimension: 'motivation', facet: 'autonomy', keyed: 'positive' },
  { prompt: 'Micromanagement frustrates me and reduces my motivation.', dimension: 'motivation', facet: 'autonomy', keyed: 'positive' },
  { prompt: 'I work best when I can set my own schedule and priorities.', dimension: 'motivation', facet: 'autonomy', keyed: 'positive' },
  { prompt: 'I value independence in choosing the approach to my tasks.', dimension: 'motivation', facet: 'autonomy', keyed: 'positive' },
  { prompt: 'I feel most engaged when working closely with a team.', dimension: 'motivation', facet: 'collaboration', keyed: 'positive' },
  { prompt: 'Shared success matters more to me than individual credit.', dimension: 'motivation', facet: 'collaboration', keyed: 'positive' },
  { prompt: 'I enjoy mentoring and supporting my teammates.', dimension: 'motivation', facet: 'collaboration', keyed: 'positive' },
  { prompt: 'I prefer projects where everyone contributes equally.', dimension: 'motivation', facet: 'collaboration', keyed: 'positive' },
])

const validity = items('va', [
  {
    prompt: 'I have never told a lie, not even a white lie.',
    dimension: 'honestyHumility',
    keyed: 'positive',
    isValidityItem: true,
    consistencyPairId: 'consistency-01',
  },
  {
    prompt: 'I always tell the truth, even when it is difficult.',
    dimension: 'honestyHumility',
    keyed: 'positive',
    isValidityItem: true,
    consistencyPairId: 'consistency-01',
  },
  {
    prompt: 'I never feel annoyed by anyone I work with.',
    dimension: 'agreeableness',
    keyed: 'positive',
    isValidityItem: true,
    consistencyPairId: 'consistency-02',
  },
  {
    prompt: 'I always get along perfectly with every colleague.',
    dimension: 'agreeableness',
    keyed: 'positive',
    isValidityItem: true,
    consistencyPairId: 'consistency-02',
  },
  {
    prompt: 'I never procrastinate on work assignments.',
    dimension: 'conscientiousness',
    keyed: 'positive',
    isValidityItem: true,
    consistencyPairId: 'consistency-03',
  },
  {
    prompt: 'I always complete tasks well ahead of every deadline.',
    dimension: 'conscientiousness',
    keyed: 'positive',
    isValidityItem: true,
    consistencyPairId: 'consistency-03',
  },
  {
    prompt: 'I never feel stressed or anxious at work.',
    dimension: 'emotionality',
    keyed: 'negative',
    isValidityItem: true,
    consistencyPairId: 'consistency-04',
  },
  {
    prompt: 'I am always completely calm, no matter what happens at work.',
    dimension: 'emotionality',
    keyed: 'negative',
    isValidityItem: true,
    consistencyPairId: 'consistency-04',
  },
])

export const PERSONALITY_QUESTION_BANK: PersonalityQuestionBankEntry[] = [
  ...honestyHumility,
  ...emotionality,
  ...extraversion,
  ...agreeableness,
  ...conscientiousness,
  ...openness,
  ...motivation,
  ...validity,
]

export function buildPersonalityScoringKey(
  questions: PersonalityQuestionBankEntry[],
): Record<string, PersonalityScoringKeyEntry> {
  const key: Record<string, PersonalityScoringKeyEntry> = {}
  for (const question of questions) {
    key[question.id] = {
      dimension: question.dimension,
      facet: question.facet,
      keyed: question.keyed,
      isValidityItem: question.isValidityItem,
      consistencyPairId: question.consistencyPairId,
    }
  }
  return key
}
