import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}
