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
        <InviteLinkPanel url={inviteUrl} candidateName={candidate.name} candidateEmail={candidate.email} />
      )}

      {test?.status === 'completed' && test.score && (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Results</h2>
          <p className="text-sm text-slate-300">
            Scored {test.score.correct} / {test.score.total}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {Object.entries(test.score.byCategory).map(([category, breakdown]) => (
              <div key={category} className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{category}</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {breakdown.correct} / {breakdown.total}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
