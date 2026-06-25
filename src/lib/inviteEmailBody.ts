interface InviteEmailContext {
  candidateName: string
  inviteUrl: string
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
    return `${name} at ${recruiterCo} has invited you to complete a skills assessment for ${hiringCo}.`
  }
  if (name && companyForRole) {
    return `${name} at ${companyForRole} has invited you to complete a skills assessment.`
  }
  if (name) {
    return `${name} has invited you to complete a skills assessment.`
  }
  if (companyForRole) {
    return `You've been invited to complete a skills assessment for ${companyForRole}.`
  }
  return "You've been invited to complete a skills assessment."
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
