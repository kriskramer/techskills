import { useState } from 'react'
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
}

export function InviteLinkPanel({ url, test, candidateId, candidateName, candidateEmail }: InviteLinkPanelProps) {
  const [copied, setCopied] = useState(false)
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [sendError, setSendError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const subject = encodeURIComponent('Your Praxis assessment invite')
  const body = encodeURIComponent(
    `Hi ${candidateName},\n\nThanks for your time — please complete this short skills assessment:\n\n${url}\n\nEach question is timed, so set aside about 30 minutes in a quiet spot. Good luck!`,
  )
  const mailto = `mailto:${candidateEmail}?subject=${subject}&body=${body}`

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSendEmail() {
    setSendState('sending')
    setSendError(null)
    try {
      await sendInvitation(candidateId, url)
      setSendState('sent')
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send email.')
      setSendState('error')
    }
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Invite link</h3>
      <p className="break-all rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-cyan-200">
        {url}
      </p>
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
          onClick={handleSendEmail}
          disabled={sendState === 'sending' || sendState === 'sent'}
          className="rounded-full border border-cyan-300 bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendState === 'sending' ? 'Sending…' : sendState === 'sent' ? 'Email sent!' : 'Send email to candidate'}
        </button>
        <a
          href={mailto}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/60"
        >
          Open email draft
        </a>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-200"
        >
          View Test
        </button>
      </div>
      {sendState === 'error' && sendError && <p className="text-sm text-rose-300">{sendError}</p>}
      {showPreview && <TestPreviewModal test={test} onClose={() => setShowPreview(false)} />}
    </Card>
  )
}

