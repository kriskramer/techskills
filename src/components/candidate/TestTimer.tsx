import { useEffect, useRef, useState } from 'react'

interface TestTimerProps {
  seconds: number
  onExpire: () => void
}

export function TestTimer({ seconds, onExpire }: TestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const hasExpiredRef = useRef(false)

  useEffect(() => {
    if (remaining <= 0) {
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true
        onExpire()
      }
      return
    }
    const interval = setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [remaining, onExpire])

  const isLow = remaining <= 5

  return (
    <div
      className={`rounded-full border px-4 py-1 text-sm font-semibold tabular-nums ${
        isLow ? 'border-rose-400/60 text-rose-300' : 'border-cyan-300/40 text-cyan-200'
      }`}
    >
      {remaining}s
    </div>
  )
}
