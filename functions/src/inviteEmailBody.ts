import type { TestType } from './data/personalityQuestionBank'

interface InviteEmailContext {
  candidateName: string
  inviteUrl: string
  recruiterName?: string
  recruiterCompany?: string
  hiringCompany?: string
}

export interface AssessmentInviteEntry {
  testType: TestType
  label: string
  durationMinutes: number
  timed: boolean
  questionCount: number
  url: string
}

interface AssessmentInviteEmailContext {
  candidateName: string
  homeUrl: string
  assessments: AssessmentInviteEntry[]
  recruiterName?: string
  recruiterCompany?: string
  hiringCompany?: string
}

function buildInviteIntro(
  recruiterName?: string,
  recruiterCompany?: string,
  hiringCompany?: string,
): string {
  const name = recruiterName?.trim() ?? ''
  const recruiterCo = recruiterCompany?.trim() ?? ''
  const hiringCo = hiringCompany?.trim() ?? ''
  const companyForRole = hiringCo || recruiterCo

  if (name && recruiterCo && hiringCo && hiringCo !== recruiterCo) {
    return `${name} at ${recruiterCo} has invited you to complete assessments for ${hiringCo}.`
  }
  if (name && companyForRole) {
    return `${name} at ${companyForRole} has invited you to complete assessments.`
  }
  if (name) {
    return `${name} has invited you to complete assessments.`
  }
  if (companyForRole) {
    return `You've been invited to complete assessments for ${companyForRole}.`
  }
  return "You've been invited to complete assessments."
}

export function buildInviteEmailBody({
  candidateName,
  inviteUrl,
  recruiterName,
  recruiterCompany,
  hiringCompany,
}: InviteEmailContext): string {
  return [
    `Hi ${candidateName},`,
    '',
    buildInviteIntro(recruiterName, recruiterCompany, hiringCompany),
    '',
    "Thanks for your time — please complete this short technical skills assessment when you're ready:",
    '',
    inviteUrl,
    '',
    'Each question is timed, so set aside about 30 minutes in a quiet spot. Good luck!',
  ].join('\n')
}

export function buildAssessmentInviteEmailBody({
  candidateName,
  homeUrl,
  assessments,
  recruiterName,
  recruiterCompany,
  hiringCompany,
}: AssessmentInviteEmailContext): string {
  const assessmentLines = assessments.flatMap((assessment, index) => {
    const timing = assessment.timed ? 'timed' : 'untimed, go at your own pace'
    return [
      `${index + 1}. ${assessment.label} (~${assessment.durationMinutes} min, ${assessment.questionCount} questions, ${timing})`,
      `   ${assessment.url}`,
      '',
    ]
  })

  return [
    `Hi ${candidateName},`,
    '',
    buildInviteIntro(recruiterName, recruiterCompany, hiringCompany),
    '',
    'Please complete the following assessments:',
    '',
    ...assessmentLines,
    `View all your pending assessments: ${homeUrl}`,
    '',
    'Good luck!',
  ].join('\n')
}

export const TEST_TYPE_EMAIL_LABELS: Record<TestType, string> = {
  technical: 'Technical Skills Assessment',
  personality: 'Work Style & Personality',
  cognitive: 'Cognitive Ability Assessment',
}
