import type { HexacoDimension, MotivationFacet, RoleArchetypeId } from '../types/personality'

export type { RoleArchetypeId }

export type TraitKey = HexacoDimension | MotivationFacet

export interface RoleArchetype {
  id: RoleArchetypeId
  label: string
  emphasizedTraits: TraitKey[]
  probeQuestion: string | null
}

export const ROLE_ARCHETYPES: RoleArchetype[] = [
  {
    id: 'general',
    label: 'General software engineer',
    emphasizedTraits: ['conscientiousness', 'openness', 'collaboration'],
    probeQuestion: null,
  },
  {
    id: 'ic-deep',
    label: 'Deep IC / specialist',
    emphasizedTraits: ['autonomy', 'conscientiousness', 'openness'],
    probeQuestion:
      'How do you structure your week when you have long stretches of heads-down work?',
  },
  {
    id: 'tech-lead',
    label: 'Tech lead / staff engineer',
    emphasizedTraits: ['agreeableness', 'extraversion', 'collaboration'],
    probeQuestion:
      'Tell me about a time you had to deliver hard feedback on code quality to a peer or senior engineer.',
  },
  {
    id: 'sre-ops',
    label: 'SRE / DevOps / platform',
    emphasizedTraits: ['conscientiousness', 'emotionality', 'achievement'],
    probeQuestion:
      'Walk me through your last production incident. What was your role and what happened afterward?',
  },
  {
    id: 'startup-general',
    label: 'Startup generalist',
    emphasizedTraits: ['openness', 'achievement', 'autonomy'],
    probeQuestion:
      'Tell me about a time you had to learn something completely new to unblock the team.',
  },
  {
    id: 'enterprise-team',
    label: 'Enterprise team engineer',
    emphasizedTraits: ['collaboration', 'conscientiousness', 'agreeableness'],
    probeQuestion:
      'Describe working within a formal process such as code reviews and change management. What worked and what did not?',
  },
]

export const DEFAULT_ROLE_ARCHETYPE_ID: RoleArchetypeId = 'general'

export function getRoleArchetype(id: RoleArchetypeId): RoleArchetype {
  return ROLE_ARCHETYPES.find((archetype) => archetype.id === id) ?? ROLE_ARCHETYPES[0]
}
