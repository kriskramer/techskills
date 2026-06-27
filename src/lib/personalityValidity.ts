export const VALIDITY_CLEAN_MESSAGE = 'Response pattern appears consistent.'
export const VALIDITY_CLEAN_ACTION = 'Proceed with standard interview focus areas.'

export const VALIDITY_FLAG_GUIDANCE: Record<
  string,
  { message: string; action: string; interviewQuestions: string[] }
> = {
  social_desirability: {
    message: 'Answers skew unusually positive on impression-management items.',
    action: 'Weight behavioral examples over self-assessment; ask follow-ups on specific incidents.',
    interviewQuestions: [
      'Describe a recent project where things did not go as planned. What happened and what was your part in it?',
      'Tell me about feedback you received that was hard to hear. How did you respond in the moment?',
    ],
  },
  inconsistent_responses: {
    message: 'Contradictory answers on paired items.',
    action: 'Clarify ambiguous responses in interview; consider a retest if responses remain unclear.',
    interviewQuestions: [
      'Some of your answers touched on similar themes in different ways. Can you walk me through how you typically approach teamwork under pressure?',
      'Tell me about a recent week at work that felt representative of how you actually operate day to day.',
    ],
  },
}

export const RECRUITER_DISCLAIMER =
  'This profile describes work-style tendencies, not ability or character. Use it alongside technical assessment results and structured interviews. Do not use personality results as the sole basis for hiring, rejection, or compensation decisions.'

export const CANDIDATE_DISCLAIMER =
  'This reflects your self-reported work preferences, not a judgment of your ability.'
