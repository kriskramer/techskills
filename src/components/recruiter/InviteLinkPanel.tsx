import { useState } from 'react'
import { Card } from '../shared/Card'

interface InviteLinkPanelProps {
  url: string
  candidateName: string
  candidateEmail: string
}

export function InviteLinkPanel({ url, candidateName, candidateEmail }: InviteLinkPanelProps) {
  const [copied, setCopied] = useState(false)

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
        <a
          href={mailto}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/60"
        >
          Open email draft
        </a>
      </div>
    </Card>
  )
}
