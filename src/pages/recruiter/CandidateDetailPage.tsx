import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { InviteLinkPanel } from '../../components/recruiter/InviteLinkPanel'
import { SkillsProfileCard } from '../../components/recruiter/SkillsProfileCard'
import { Card } from '../../components/shared/Card'
import { Spinner } from '../../components/shared/Spinner'
import { isFirebaseConfigured } from '../../lib/firebase'
import { subscribeToCandidate } from '../../services/candidates'
import { generateTestProfile } from '../../services/functions'
import { subscribeToTest } from '../../services/tests'
import type { Candidate } from '../../types/candidate'
import type { TestDoc } from '../../types/test'

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [test, setTest] = useState<TestDoc | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !isFirebaseConfigured) return
    return subscribeToCandidate(id, setCandidate)
  }, [id])

  useEffect(() => {
    if (!candidate?.testId || !isFirebaseConfigured) return
    return subscribeToTest(candidate.testId, setTest)
  }, [candidate?.testId])

  async function handleGenerateTest() {
    if (!id) return
    setError(null)
    setIsGenerating(true)
    try {
      await generateTestProfile(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong generating the test.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        Firebase isn't configured yet — copy .env.example to .env.local and add your project's values to load this
        candidate.
      </p>
    )
  }

  if (!id) {
    return null
  }

  if (!candidate) {
    return <Spinner label="Loading candidate…" />
  }

  const inviteUrl = test ? `${window.location.origin}/test/${test.id}` : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{candidate.name}</h1>
        <p className="mt-1 text-sm text-slate-400">{candidate.email}</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-white">Resume</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{candidate.resumeText}</p>
      </Card>

      {candidate.skillsProfile ? (
        <SkillsProfileCard profile={candidate.skillsProfile} />
      ) : (
        <Card>
          <Spinner label="Analyzing resume…" />
        </Card>
      )}

      {candidate.skillsProfile && !test && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGenerateTest}
            disabled={isGenerating}
            className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? 'Generating test…' : 'Generate test'}
          </button>
          {error && <p className="text-sm text-rose-300">{error}</p>}
        </div>
      )}

      {test && inviteUrl && (
        <InviteLinkPanel url={inviteUrl} candidateId={id} candidateName={candidate.name} candidateEmail={candidate.email} />
      )}

      {test?.status === 'completed' && test.score && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Results</h2>
            <button
              type="button"
              onClick={handleGenerateTest}
              disabled={isGenerating}
              className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? 'Generating…' : 'Re-run test'}
            </button>
          </div>

          <div>
            <p className="text-3xl font-bold text-cyan-300">
              {test.score.total > 0 ? Math.round((test.score.correct / test.score.total) * 100) : 0}%
              <span className="ml-2 text-base font-normal text-slate-400">
                ({test.score.correct}/{test.score.total} correct)
              </span>
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(test.score.byCategory).map(([category, breakdown]) => {
              const pct = breakdown.total > 0 ? Math.round((breakdown.correct / breakdown.total) * 100) : 0
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-200">{category}</span>
                    <span className="text-slate-400">
                      {breakdown.correct}/{breakdown.total} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {test.score.bySkill && Object.keys(test.score.bySkill).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">By skill</h3>
              {Object.entries(test.score.bySkill)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([skill, breakdown]) => {
                  const pct = breakdown.total > 0 ? Math.round((breakdown.correct / breakdown.total) * 100) : 0
                  return (
                    <div key={skill} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-200">{skill}</span>
                        <span className="text-slate-400">
                          {breakdown.correct}/{breakdown.total} · {pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-violet-400 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {test.questionBreakdown && test.questionBreakdown.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Per-question breakdown</h3>
              {test.questionBreakdown.map((result, i) => (
                <div
                  key={result.questionId}
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    result.isCorrect ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'
                  }`}
                >
                  <p className="font-medium text-slate-200">
                    <span className="mr-2 text-slate-500">Q{i + 1}.</span>
                    {result.prompt}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                    <span className="text-slate-400">
                      Candidate:{' '}
                      <span className={result.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                        {result.candidateAnswer || <em>no answer</em>}
                      </span>
                    </span>
                    <span className="text-slate-400">
                      Correct: <span className="text-emerald-300">{result.correctAnswer}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
