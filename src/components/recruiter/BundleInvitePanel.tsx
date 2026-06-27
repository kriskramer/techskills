import { useMemo, useState } from 'react'
import { useInviteCooldown } from '../../hooks/useInviteCooldown'
import { isTestPreviewEnabled } from '../../lib/features'
import {
  buildAssessmentEntriesFromTests,
  buildAssessmentInviteEmailBody,
  buildInviteEmailBody,
} from '../../lib/inviteEmailBody'
import { sendAssessmentInvitation, sendInvitation } from '../../services/functions'
import type { AssessmentBundle } from '../../types/assessmentBundle'
import { TEST_TYPE_LABELS } from '../../types/assessmentBundle'
import type { TestDoc } from '../../types/test'
import { Card } from '../shared/Card'
import { TestPreviewModal } from './TestPreviewModal'

interface BundleInvitePanelProps {
  bundle: AssessmentBundle
  tests: TestDoc[]
  candidateId: string
  candidateName: string
  candidateEmail: string
  recruiterName: string
  recruiterCompany: string
  hiringCompany: string
}

function questionCount(test: TestDoc): number {
  if (test.testType === 'personality') {
    return test.personalityQuestions?.length ?? 0
  }
  return test.questions.length
}

export function BundleInvitePanel({
  bundle,
  tests,
  candidateId,
  candidateName,
  candidateEmail,
  recruiterName,
  recruiterCompany,
  hiringCompany,
}: BundleInvitePanelProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [previewTest, setPreviewTest] = useState<TestDoc | null>(null)

  const origin = window.location.origin
  const homeUrl = `${origin}/recruit/tests`

  const { canSend, isOnCooldown, isAtMaxSends, remainingLabel, lastSentLabel } = useInviteCooldown(
    bundle.lastInvitationSentAt,
    bundle.invitationSendCount ?? 0,
  )

  const sortedTests = useMemo(
    () => [...tests].sort((a, b) => a.testType.localeCompare(b.testType)),
    [tests],
  )

  const assessmentEntries = useMemo(
    () => buildAssessmentEntriesFromTests(sortedTests, origin),
    [sortedTests, origin],
  )

  const emailBody = buildAssessmentInviteEmailBody({
    candidateName,
    homeUrl,
    assessments: assessmentEntries,
    recruiterName,
    recruiterCompany,
    hiringCompany,
  })

  const subject = encodeURIComponent('Your Praxis assessments are ready')
  const mailto = `mailto:${candidateEmail}?subject=${subject}&body=${encodeURIComponent(emailBody)}`

  async function handleCopy(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  async function handleSendEmail() {
    if (!canSend || isSending) return
    setIsSending(true)
    setSendError(null)
    try {
      await sendAssessmentInvitation(candidateId, bundle.id, origin)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send email.')
    } finally {
      setIsSending(false)
    }
  }

  let sendButtonLabel = 'Send email to candidate'
  if (isSending) {
    sendButtonLabel = 'Sending…'
  } else if (isAtMaxSends) {
    sendButtonLabel = 'Send limit reached'
  } else if (isOnCooldown) {
    sendButtonLabel = `Resend in ${remainingLabel}`
  } else if (lastSentLabel) {
    sendButtonLabel = 'Resend email'
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Assessment invites</h3>
        <p className="mt-1 text-sm text-slate-400">
          Send one email with all assessment links, or copy individual links below.
        </p>
      </div>

      <div className="space-y-3">
        {sortedTests.map((test) => {
          const url = `${origin}/test/${test.id}`
          const timed = test.testType === 'technical'
          return (
            <div key={test.id} className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-white">{TEST_TYPE_LABELS[test.testType]}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {questionCount(test)} questions · ~{test.durationMinutes} min
                    {timed ? ' · timed' : ' · untimed'}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-400">
                  {test.status}
                </span>
              </div>
              <p className="mt-2 break-all text-xs text-cyan-200">{url}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopy(url, test.id)}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-300/60"
                >
                  {copiedKey === test.id ? 'Copied!' : 'Copy link'}
                </button>
                {isTestPreviewEnabled && test.testType === 'technical' && (
                  <button
                    type="button"
                    onClick={() => setPreviewTest(test)}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-300/60"
                  >
                    Preview
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recruit home page</p>
        <p className="mt-1 break-all text-sm text-cyan-200">{homeUrl}</p>
        <button
          type="button"
          onClick={() => void handleCopy(homeUrl, 'home')}
          className="mt-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-300/60"
        >
          {copiedKey === 'home' ? 'Copied!' : 'Copy home link'}
        </button>
      </div>

      {lastSentLabel && (
        <p className="text-sm text-slate-400">
          Last sent {lastSentLabel}
          {bundle.invitationSendCount != null && bundle.invitationSendCount > 0
            ? ` · ${bundle.invitationSendCount} email${bundle.invitationSendCount === 1 ? '' : 's'} sent`
            : ''}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleSendEmail()}
          disabled={!canSend || isSending}
          className="rounded-full border border-cyan-300 bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendButtonLabel}
        </button>
        <a
          href={mailto}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/60"
        >
          Open email draft
        </a>
      </div>

      {sendError && <p className="text-sm text-rose-300">{sendError}</p>}
      {isAtMaxSends && (
        <p className="text-sm text-amber-200">
          This bundle has reached the maximum number of invitation emails. Use copy link or open an email draft
          instead.
        </p>
      )}

      {isTestPreviewEnabled && previewTest && (
        <TestPreviewModal test={previewTest} onClose={() => setPreviewTest(null)} />
      )}
    </Card>
  )
}

/** Single-test fallback when no bundle exists (legacy tests). */
export function LegacyInviteLinkPanel({
  url,
  test,
  candidateId,
  candidateName,
  candidateEmail,
  recruiterName,
  recruiterCompany,
  hiringCompany,
}: {
  url: string
  test: TestDoc
  candidateId: string
  candidateName: string
  candidateEmail: string
  recruiterName: string
  recruiterCompany: string
  hiringCompany: string
}) {
  const [copied, setCopied] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const { canSend, isOnCooldown, isAtMaxSends, remainingLabel, lastSentLabel } = useInviteCooldown(
    test.lastInvitationSentAt,
    test.invitationSendCount ?? 0,
  )

  const subject = encodeURIComponent('Your Praxis assessment invite')
  const body = encodeURIComponent(
    buildInviteEmailBody({
      candidateName,
      inviteUrl: url,
      recruiterName,
      recruiterCompany,
      hiringCompany,
    }),
  )
  const mailto = `mailto:${candidateEmail}?subject=${subject}&body=${body}`

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSendEmail() {
    if (!canSend || isSending) return
    setIsSending(true)
    setSendError(null)
    try {
      await sendInvitation(candidateId, url)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send email.')
    } finally {
      setIsSending(false)
    }
  }

  let sendButtonLabel = 'Send email to candidate'
  if (isSending) {
    sendButtonLabel = 'Sending…'
  } else if (isAtMaxSends) {
    sendButtonLabel = 'Send limit reached'
  } else if (isOnCooldown) {
    sendButtonLabel = `Resend in ${remainingLabel}`
  } else if (lastSentLabel) {
    sendButtonLabel = 'Resend email'
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Invite link</h3>
      <p className="break-all rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-cyan-200">
        {url}
      </p>
      {lastSentLabel && (
        <p className="text-sm text-slate-400">
          Last sent {lastSentLabel}
          {test.invitationSendCount != null && test.invitationSendCount > 0
            ? ` · ${test.invitationSendCount} email${test.invitationSendCount === 1 ? '' : 's'} sent`
            : ''}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-cyan-300/60 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/10"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        <button
          type="button"
          onClick={() => void handleSendEmail()}
          disabled={!canSend || isSending}
          className="rounded-full border border-cyan-300 bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendButtonLabel}
        </button>
        <a
          href={mailto}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/60"
        >
          Open email draft
        </a>
        {isTestPreviewEnabled && test.testType === 'technical' && (
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-200"
          >
            View Test
          </button>
        )}
      </div>
      {sendError && <p className="text-sm text-rose-300">{sendError}</p>}
      {isTestPreviewEnabled && showPreview && (
        <TestPreviewModal test={test} onClose={() => setShowPreview(false)} />
      )}
    </Card>
  )
}
