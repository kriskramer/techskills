import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'
import type { SkillsProfile } from '../types/candidate'
import type { TestDifficultyPreset } from '../lib/testDifficulty'

function requireFunctions() {
  if (!functions) {
    throw new Error('Firebase Functions is not configured. Set VITE_FIREBASE_* env vars in .env.local.')
  }
  return functions
}

interface AnalyzeResumeResponse {
  skillsProfile: SkillsProfile
  cached?: boolean
}

export async function analyzeResume(candidateId: string, options?: { force?: boolean }): Promise<SkillsProfile> {
  const callable = httpsCallable<{ candidateId: string; force?: boolean }, AnalyzeResumeResponse>(
    requireFunctions(),
    'analyzeResume',
  )
  const result = await callable({ candidateId, force: options?.force })
  return result.data.skillsProfile
}

interface GenerateTestProfileResponse {
  token: string
}

export async function generateTestProfile(
  candidateId: string,
  categoryCounts?: Record<string, number>,
  difficulty: TestDifficultyPreset = 'medium',
  forceRegenerate = false,
): Promise<string> {
  const callable = httpsCallable<
    {
      candidateId: string
      categoryCounts?: Record<string, number>
      difficulty?: TestDifficultyPreset
      forceRegenerate?: boolean
    },
    GenerateTestProfileResponse
  >(requireFunctions(), 'generateTestProfile')
  const result = await callable({ candidateId, categoryCounts, difficulty, forceRegenerate })
  return result.data.token
}

interface SendInvitationResponse {
  success: boolean
}

export async function sendInvitation(candidateId: string, inviteUrl: string): Promise<void> {
  const callable = httpsCallable<{ candidateId: string; inviteUrl: string }, SendInvitationResponse>(
    requireFunctions(),
    'sendInvitation',
  )
  await callable({ candidateId, inviteUrl })
}

interface ScoreTestResponse {
  score: object
}

export async function scoreTest(testId: string): Promise<void> {
  const callable = httpsCallable<{ testId: string }, ScoreTestResponse>(requireFunctions(), 'scoreTest')
  await callable({ testId })
}

interface ExtendTestInviteResponse {
  token: string
  action: 'extend' | 'regenerate'
}

export async function cancelTest(testId: string): Promise<void> {
  const callable = httpsCallable<{ testId: string }, { success: boolean }>(requireFunctions(), 'cancelTest')
  await callable({ testId })
}

export async function extendTestInvite(testId: string, action: 'extend' | 'regenerate'): Promise<string> {
  const callable = httpsCallable<{ testId: string; action: 'extend' | 'regenerate' }, ExtendTestInviteResponse>(
    requireFunctions(),
    'extendTestInvite',
  )
  const result = await callable({ testId, action })
  return result.data.token
}

interface GetTestPreviewResponse {
  answerKey: Record<string, string>
}

export async function getTestPreview(testId: string): Promise<GetTestPreviewResponse> {
  const callable = httpsCallable<{ testId: string }, GetTestPreviewResponse>(
    requireFunctions(),
    'getTestPreview',
  )
  const result = await callable({ testId })
  return result.data
}

