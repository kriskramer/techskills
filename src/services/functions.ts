import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'
import type { SkillsProfile } from '../types/candidate'

function requireFunctions() {
  if (!functions) {
    throw new Error('Firebase Functions is not configured. Set VITE_FIREBASE_* env vars in .env.local.')
  }
  return functions
}

interface AnalyzeResumeResponse {
  skillsProfile: SkillsProfile
}

export async function analyzeResume(candidateId: string): Promise<SkillsProfile> {
  const callable = httpsCallable<{ candidateId: string }, AnalyzeResumeResponse>(requireFunctions(), 'analyzeResume')
  const result = await callable({ candidateId })
  return result.data.skillsProfile
}

interface GenerateTestProfileResponse {
  token: string
}

export async function generateTestProfile(candidateId: string): Promise<string> {
  const callable = httpsCallable<{ candidateId: string }, GenerateTestProfileResponse>(
    requireFunctions(),
    'generateTestProfile',
  )
  const result = await callable({ candidateId })
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

