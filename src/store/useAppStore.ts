import { create } from 'zustand'

export type WorkflowStageId = 'resume' | 'assessment' | 'review' | 'reporting'
export type UserMode = 'recruiter' | 'candidate'

export const frontendStack = [
  {
    name: 'React 18 + TypeScript',
    reason: 'Mature Firebase SDK support and a large component ecosystem.',
  },
  {
    name: 'Vite',
    reason: 'Fast local development, HMR, and straightforward production builds.',
  },
  {
    name: 'Tailwind CSS',
    reason: 'Utility-first styling for rapid, consistent UI composition.',
  },
  {
    name: 'Zustand',
    reason: 'Simple shared state for workflow and session UX without Redux overhead.',
  },
] as const

export const backendServices = [
  {
    name: 'Firestore',
    summary: 'Persist users, candidates, tests, questions, and answers.',
  },
  {
    name: 'Cloud Functions',
    summary: 'Handle resume analysis, test generation, scoring, and orchestration.',
  },
  {
    name: 'Cloud Storage',
    summary: 'Store uploaded resumes and generated PDF reports.',
  },
  {
    name: 'Authentication',
    summary: 'Support sign up, login, and session management flows.',
  },
  {
    name: 'Hosting',
    summary: 'Deploy the React app behind HTTPS with global CDN delivery.',
  },
] as const

export const workflowStages = [
  {
    id: 'resume' as const,
    title: 'Resume intake',
    detail: 'Upload resumes to Cloud Storage and queue analysis in Cloud Functions.',
  },
  {
    id: 'assessment' as const,
    title: 'Assessment generation',
    detail: 'Generate role-based test questions and persist them in Firestore.',
  },
  {
    id: 'review' as const,
    title: 'Candidate review',
    detail: 'Track scores, reviewer notes, and hiring decisions in one workflow.',
  },
  {
    id: 'reporting' as const,
    title: 'PDF reporting',
    detail: 'Store generated reports for recruiters and candidates to download.',
  },
]

type AppState = {
  mode: UserMode
  activeStage: WorkflowStageId
  setMode: (mode: UserMode) => void
  setActiveStage: (stage: WorkflowStageId) => void
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'recruiter',
  activeStage: 'resume',
  setMode: (mode) => set({ mode }),
  setActiveStage: (activeStage) => set({ activeStage }),
}))
