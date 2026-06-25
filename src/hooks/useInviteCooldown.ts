import { useEffect, useState } from 'react'
import type { Timestamp } from 'firebase/firestore'

export const INVITE_COOLDOWN_MS = 5 * 60 * 1000
export const MAX_INVITES_PER_TEST = 5

export function formatCooldownRemaining(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return `${seconds}s`
}

export function useInviteCooldown(lastSentAt: Timestamp | null | undefined, sendCount = 0) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!lastSentAt) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [lastSentAt])

  const sentMs = lastSentAt?.toMillis() ?? 0
  const remainingMs = lastSentAt ? Math.max(0, INVITE_COOLDOWN_MS - (now - sentMs)) : 0
  const isOnCooldown = remainingMs > 0
  const isAtMaxSends = sendCount >= MAX_INVITES_PER_TEST
  const canSend = !isOnCooldown && !isAtMaxSends

  return {
    canSend,
    isOnCooldown,
    isAtMaxSends,
    remainingMs,
    remainingLabel: formatCooldownRemaining(remainingMs),
    lastSentLabel: lastSentAt
      ? lastSentAt.toDate().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
      : null,
  }
}
