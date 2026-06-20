import { useMemo } from 'react'
import type { SkillsProfile } from '../../types/candidate'
import type { TestScore } from '../../types/test'
import { compareResumeToTest, mismatchCount } from '../../lib/resumeTestComparison'

const VERDICT_STYLE = {
  aligned: 'border-white/10 bg-slate-950/40 text-slate-300',
  underperform: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
  overperform: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  untested: 'border-white/5 bg-slate-950/20 text-slate-500',
} as const

interface ResumeTestComparisonPanelProps {
  profile: SkillsProfile
  score: TestScore
}

export function ResumeTestComparisonPanel({ profile, score }: ResumeTestComparisonPanelProps) {
  const rows = useMemo(() => compareResumeToTest(profile, score), [profile, score])
  const mismatches = mismatchCount(rows)

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Resume vs test</h3>
        <p className="mt-1 text-sm text-slate-400">
          {mismatches > 0
            ? `${mismatches} skill${mismatches === 1 ? '' : 's'} where resume claims exceed test performance.`
            : 'No significant mismatches between resume claims and test scores.'}
        </p>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.skill.name}
            className={`rounded-xl border px-4 py-3 text-sm ${VERDICT_STYLE[row.verdict]}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">
                {row.skill.name} · {row.skill.level}
              </span>
              {row.testScorePercent != null && (
                <span>
                  {row.testScorePercent}% on test ({row.questionsAsked} question
                  {row.questionsAsked === 1 ? '' : 's'})
                </span>
              )}
            </div>
            <p className="mt-1 text-xs opacity-90">{row.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
