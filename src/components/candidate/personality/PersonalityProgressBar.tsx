interface PersonalityProgressBarProps {
  answeredCount: number
  totalCount: number
  pageIndex: number
  pageCount: number
}

export function PersonalityProgressBar({
  answeredCount,
  totalCount,
  pageIndex,
  pageCount,
}: PersonalityProgressBarProps) {
  const percent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>
          Page {pageIndex + 1} of {pageCount}
        </span>
        <span>
          {answeredCount} / {totalCount} answered
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-400/80 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
