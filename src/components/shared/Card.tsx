import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  variant?: 'default' | 'accent'
}

const VARIANT_CLASS: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'border-white/10 bg-white/5',
  accent:
    'border-cyan-400/50 border-l-4 border-l-cyan-300 bg-cyan-950/30 ring-1 ring-cyan-300/25 shadow-lg shadow-cyan-500/15',
}

export function Card({ children, className = '', variant = 'default', ...props }: CardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${VARIANT_CLASS[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}
