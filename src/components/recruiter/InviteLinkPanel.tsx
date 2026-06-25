import { useState } from 'react'
import { useInviteCooldown } from '../../hooks/useInviteCooldown'
import { isTestPreviewEnabled } from '../../lib/features'
import { buildInviteEmailBody } from '../../lib/inviteEmailBody'
import { sendInvitation } from '../../services/functions'
import type { TestDoc } from '../../types/test'
import { Card } from '../shared/Card'
import { TestPreviewModal } from './TestPreviewModal'

interface InviteLinkPanelProps {
  url: string
  test: TestDoc
  candidateId: string
  candidateName: string
  candidateEmail: string
  recruiterName: string
  recruiterCompany: string
  hiringCompany: string
}

export function InviteLinkPanel({
  url,
  test,
  candidateId,
  candidateName,
  candidateEmail,
  recruiterName,
  recruiterCompany,
  hiringCompany,
}: InviteLinkPanelProps) {
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
        {isTestPreviewEnabled && (
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
      {isAtMaxSends && (
        <p className="text-sm text-amber-200">
          This test has reached the maximum number of invitation emails. Use copy link or open an email draft instead.
        </p>
      )}
      {isTestPreviewEnabled && showPreview && (
        <TestPreviewModal test={test} onClose={() => setShowPreview(false)} />
      )}
    </Card>
  )
}
