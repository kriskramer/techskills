import type { TraitBand } from '../types/personality'
import type { TraitKey } from './personalityRoleArchetypes'

export interface TraitInterpretation {
  summary: string
  probeHint?: string
  interviewQuestions: string[]
}

export interface SummaryBulletTemplate {
  headline: string
  body: string
}

type BandInterpretations = Record<TraitBand, TraitInterpretation>
type TraitInterpretationMap = Record<TraitKey, BandInterpretations>

const INTERPRETATIONS: TraitInterpretationMap = {
  honestyHumility: {
    low: {
      summary: 'May prioritize personal gain or image over transparency when stakes are high.',
      probeHint: 'Worth probing how they handle ethical gray areas, credit assignment, and reporting bad news.',
      interviewQuestions: [
        'Tell me about a time you faced pressure to misrepresent progress or scope. How did you handle it?',
        'Describe a situation where taking a shortcut would have been easier but you chose not to. What happened?',
      ],
    },
    average: {
      summary: 'Within typical range for integrity and fairness in work settings.',
      interviewQuestions: [],
    },
    high: {
      summary: 'Likely to act with transparency, give credit fairly, and follow through on commitments.',
      probeHint: 'Confirm with examples of owning mistakes and ethical trade-offs under pressure.',
      interviewQuestions: [
        'Tell me about a time you discovered a mistake in your own work after it had already shipped. What did you do?',
        'Describe a situation where being fully honest created short-term friction. How did you handle it?',
      ],
    },
  },
  emotionality: {
    low: {
      summary: 'Tends to stay calm under pressure and recover quickly from setbacks.',
      probeHint: 'Worth confirming with real examples from incidents, deadlines, or critical feedback.',
      interviewQuestions: [
        'Tell me about a high-pressure deadline or outage. How did you stay focused and what did you do first?',
        'Describe a time you received sharp criticism on your work. How did you respond?',
      ],
    },
    average: {
      summary: 'Within typical range for stress response and emotional recovery at work.',
      interviewQuestions: [],
    },
    high: {
      summary: 'May experience stronger worry or sensitivity to conflict and criticism.',
      probeHint: 'Worth probing coping strategies during incidents, reviews, and sustained ambiguity.',
      interviewQuestions: [
        'Tell me about a period when work stress was elevated for several weeks. How did you manage it?',
        'Describe a tense disagreement on a technical decision. How did you stay productive through it?',
      ],
    },
  },
  extraversion: {
    low: {
      summary: 'Likely prefers focused solo work and may need time to warm up in group settings.',
      probeHint: 'Worth probing communication habits in async teams, standups, and cross-team work.',
      interviewQuestions: [
        'How do you keep stakeholders informed when you prefer working independently?',
        'Tell me about a project that required more collaboration than you expected. How did you adapt?',
      ],
    },
    average: {
      summary: 'Within typical range for social energy and outward engagement at work.',
      interviewQuestions: [],
    },
    high: {
      summary: 'Likely energized by discussion, facilitation, and frequent interaction.',
      probeHint: 'Worth confirming they can also sustain deep focus when the role requires it.',
      interviewQuestions: [
        'Tell me about a time you drove alignment across teams with different priorities.',
        'Describe how you balance collaboration with heads-down implementation time.',
      ],
    },
  },
  agreeableness: {
    low: {
      summary: 'May prioritize directness or debate over harmony when opinions differ.',
      probeHint: 'Worth probing how they deliver dissent, handle conflict, and support teammates.',
      interviewQuestions: [
        'Tell me about a technical disagreement where you strongly disagreed with the group. What did you do?',
        'Describe how you give feedback when you think a colleague\'s approach will not work.',
      ],
    },
    average: {
      summary: 'Within typical range for cooperation and interpersonal warmth at work.',
      interviewQuestions: [],
    },
    high: {
      summary: 'Likely cooperative, supportive in reviews, and attentive to team dynamics.',
      probeHint: 'Worth probing whether they can push back constructively when quality or scope is at risk.',
      interviewQuestions: [
        'Tell me about a time you had to disagree with a teammate while preserving the relationship.',
        'Describe how you handle a situation where a popular decision might not be the best technical choice.',
      ],
    },
  },
  conscientiousness: {
    low: {
      summary: 'May prioritize speed or flexibility over meticulous follow-through.',
      probeHint: 'Worth probing quality habits, testing discipline, and handling of long-running tasks.',
      interviewQuestions: [
        'Describe a situation where you had to balance speed and thoroughness. What did you prioritize and why?',
        'Tell me about a time a detail you overlooked caused rework. What changed afterward?',
      ],
    },
    average: {
      summary: 'Within typical range for reliability, planning, and attention to detail.',
      interviewQuestions: [],
    },
    high: {
      summary: 'Likely reliable on detail-heavy work such as testing, maintenance, and process adherence.',
      probeHint: 'Worth confirming they can still move quickly when the situation calls for pragmatism.',
      interviewQuestions: [
        'Describe a long-running task where quality mattered more than speed. How did you keep standards high?',
        'Tell me about a time you improved a process or checklist that others now rely on.',
      ],
    },
  },
  openness: {
    low: {
      summary: 'May prefer proven approaches and incremental change over experimentation.',
      probeHint: 'Worth probing adaptability when stack, requirements, or architecture shifts.',
      interviewQuestions: [
        'Tell me about a time you had to adopt a tool or framework you initially disagreed with.',
        'Describe how you approach learning when the team wants to keep an existing design.',
      ],
    },
    average: {
      summary: 'Within typical range for curiosity and openness to new ideas at work.',
      interviewQuestions: [],
    },
    high: {
      summary: 'Likely curious about new tools, ideas, and unconventional solutions.',
      probeHint: 'Worth probing how they validate experiments and know when to stop exploring.',
      interviewQuestions: [
        'Tell me about a time you advocated for a new tool or approach when the team preferred the status quo.',
        'Describe an experiment that did not work. How did you decide to pivot or stop?',
      ],
    },
  },
  achievement: {
    low: {
      summary: 'May be less driven by visible milestones, promotions, or competitive targets.',
      probeHint: 'Worth probing what motivates sustained effort in this role day to day.',
      interviewQuestions: [
        'What kinds of goals or outcomes keep you engaged over a multi-month project?',
        'Tell me about work you were proud of that did not come with public recognition.',
      ],
    },
    average: {
      summary: 'Within typical range for achievement drive and goal orientation.',
      interviewQuestions: [],
    },
    high: {
      summary: 'Likely motivated by challenging targets, visible progress, and high standards.',
      probeHint: 'Worth confirming the role offers meaningful goals and growth paths.',
      interviewQuestions: [
        'Tell me about a goal you set for yourself that stretched your capabilities. How did you track progress?',
        'Describe a time you went beyond the minimum requirements because you wanted a stronger outcome.',
      ],
    },
  },
  autonomy: {
    low: {
      summary: 'May prefer clear direction, frequent check-ins, and structured workflows.',
      probeHint: 'Worth probing fit if the role is ambiguous or self-directed.',
      interviewQuestions: [
        'Describe the level of manager involvement that helps you do your best work.',
        'Tell me about a time unclear priorities made it hard to progress. What did you need to move forward?',
      ],
    },
    average: {
      summary: 'Within typical range for independence versus guided work.',
      interviewQuestions: [],
    },
    high: {
      summary: 'Likely prefers self-direction, ownership, and minimal micromanagement.',
      probeHint: 'Confirm the role offers enough autonomy and clear outcome expectations.',
      interviewQuestions: [
        'Tell me about a project where you had broad freedom to decide how to deliver. How did you stay aligned?',
        'Describe a time too much process or oversight slowed you down. How did you handle it?',
      ],
    },
  },
  collaboration: {
    low: {
      summary: 'May prefer independent ownership over frequent pairing or group decision-making.',
      probeHint: 'Worth probing fit if the team is highly interdependent or pair-heavy.',
      interviewQuestions: [
        'Tell me about a project where you worked mostly alone. What would have made collaboration easier?',
        'Describe how you hand off work or stay unblocked when others depend on you.',
      ],
    },
    average: {
      summary: 'Within typical range for teamwork and shared ownership.',
      interviewQuestions: [],
    },
    high: {
      summary: 'Likely energized by shared ownership, pairing, and cross-functional alignment.',
      probeHint: 'Confirm the team structure supports regular collaboration rather than isolated queues.',
      interviewQuestions: [
        'Describe a project where your success depended on others. How did you stay aligned?',
        'Tell me about a time you helped a teammate unblock without being asked directly.',
      ],
    },
  },
}

const SUMMARY_BULLETS: Record<TraitKey, Partial<Record<'low' | 'high', SummaryBulletTemplate>>> = {
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
      body: 'Reports lower extraversion; confirm communication habits fit the team\'s collaboration model.',
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

export function getTraitInterpretation(trait: TraitKey, band: TraitBand): TraitInterpretation {
  return INTERPRETATIONS[trait][band]
}

export function getSummaryBullet(trait: TraitKey, band: 'low' | 'high'): SummaryBulletTemplate | null {
  return SUMMARY_BULLETS[trait][band] ?? null
}

export function getAverageBandSummary(): string {
  return 'Within typical range — no specific interview focus needed.'
}
