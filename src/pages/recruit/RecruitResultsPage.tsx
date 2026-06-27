import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SkillsProfileCard } from '../../components/recruiter/SkillsProfileCard'
import { Card } from '../../components/shared/Card'
import { Spinner } from '../../components/shared/Spinner'
import { isFirebaseConfigured } from '../../lib/firebase'
import {
  HEXACO_DIMENSION_LABELS,
  TRAIT_BAND_LABELS,
} from '../../lib/personalityLabels'
import { getStoredRecruitEmail, setStoredRecruitEmail } from '../../lib/recruitSession'
import { subscribeToCandidatesByEmail } from '../../services/candidates'
import { subscribeToTestsForCandidate } from '../../services/tests'
import { TEST_TYPE_LABELS } from '../../types/assessmentBundle'
import type { Candidate } from '../../types/candidate'
import type { TestDoc, TestScore } from '../../types/test'

const STATUS_LABEL: Record<TestDoc['status'], string> = {
  pending: 'Invite sent',
  'in-progress': 'In progress',
  completed: 'Completed',
  expired: 'Expired',
}

function formatTimestamp(value: TestDoc['createdAt'] | TestDoc['completedAt']): string | null {
  if (!value) return null
  return value.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function scorePercent(score: TestScore): number {
  return score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
}

function isTestExpired(test: TestDoc): boolean {
  return test.status !== 'completed' && test.expiresAt != null && test.expiresAt.toDate() < new Date()
}

function testActionHref(test: TestDoc): string {
  if (test.status === 'completed') return `/test/${test.id}/results`
  if (test.status === 'in-progress') return `/test/${test.id}/run`
  return `/test/${test.id}`
}

function testActionLabel(test: TestDoc): string {
  if (test.status === 'completed') return 'View results'
  if (test.status === 'in-progress') return 'Continue assessment'
  return 'Start assessment'
}

function questionCount(test: TestDoc): number {
  if (test.testType === 'personality') {
    return test.personalityQuestions?.length ?? 0
  }
  return test.questions.length
}

function testMetaLine(test: TestDoc): string {
  const timed = test.testType === 'technical' ? ' · timed' : ' · untimed'
  return `${questionCount(test)} questions · ~${test.durationMinutes} min${timed}`
}

interface TestWithContext extends TestDoc {
  hiringCompany: string
}

function TestRow({ test }: { test: TestWithContext }) {
  const expired = isTestExpired(test)
  const dateLabel = formatTimestamp(test.completedAt ?? test.createdAt)
  const canTake = !expired && (test.status === 'pending' || test.status === 'in-progress')

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-white">{TEST_TYPE_LABELS[test.testType]}</p>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
            {test.hiringCompany}
          </span>
        </div>
        <p className="text-sm text-slate-400">
          {testMetaLine(test)}
          {dateLabel && <span className="text-slate-500"> · {dateLabel}</span>}
        </p>
        {test.status === 'completed' && test.testType === 'technical' && test.score && (
          <p className="text-sm text-cyan-300">
            {scorePercent(test.score)}% ({test.score.correct}/{test.score.total} correct)
          </p>
        )}
        {test.status === 'completed' && test.testType === 'personality' && test.personalityScore && (
          <p className="text-sm text-cyan-300">
            Conscientiousness: {TRAIT_BAND_LABELS[test.personalityScore.dimensions.conscientiousness.band]} ·{' '}
            {HEXACO_DIMENSION_LABELS.honestyHumility}:{' '}
            {TRAIT_BAND_LABELS[test.personalityScore.dimensions.honestyHumility.band]}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${
            expired
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
              : test.status === 'completed'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-white/10 bg-slate-900/70 text-slate-300'
          }`}
        >
          {expired ? 'Expired' : STATUS_LABEL[test.status]}
        </span>
        {canTake || test.status === 'completed' ? (
          <Link
            to={testActionHref(test)}
            className="rounded-full border border-cyan-300 bg-cyan-300 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            {testActionLabel(test)}
          </Link>
        ) : expired ? (
          <span className="text-xs text-slate-500">Contact your recruiter for a new link</span>
        ) : null}
      </div>
    </Card>
  )
}

interface BundleGroup {
  bundleId: string | null
  tests: TestWithContext[]
  completedCount: number
}

function BundleGroupSection({ group }: { group: BundleGroup }) {
  const activeTests = group.tests.filter(
    (test) => (test.status === 'pending' || test.status === 'in-progress') && !isTestExpired(test),
  )

  if (activeTests.length === 0) return null

  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      {group.bundleId && group.tests.length > 1 && (
        <p className="text-xs text-slate-500">
          Assessment bundle · {group.completedCount} of {group.tests.length} complete
        </p>
      )}
      <div className="space-y-3">
        {activeTests.map((test) => (
          <TestRow key={test.id} test={test} />
        ))}
      </div>
    </div>
  )
}

export function RecruitResultsPage() {
  const [emailInput, setEmailInput] = useState(getStoredRecruitEmail)
  const [lookupEmail, setLookupEmail] = useState(getStoredRecruitEmail)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [testsByCandidate, setTestsByCandidate] = useState<Record<string, TestDoc[]>>({})
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(() => Boolean(getStoredRecruitEmail()))

  useEffect(() => {
    if (!lookupEmail || !isFirebaseConfigured) return

    return subscribeToCandidatesByEmail(lookupEmail, (nextCandidates) => {
      setCandidates(nextCandidates)
      setIsLoadingCandidates(false)
    })
  }, [lookupEmail])

  useEffect(() => {
    if (!isFirebaseConfigured || candidates.length === 0) return

    const unsubscribes = candidates.map((candidate) =>
      subscribeToTestsForCandidate(candidate.id, (tests) => {
        setTestsByCandidate((current) => ({ ...current, [candidate.id]: tests }))
      }),
    )

    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe()
    }
  }, [candidates])

  const candidateById = useMemo(() => new Map(candidates.map((candidate) => [candidate.id, candidate])), [candidates])
  const activeCandidateIds = useMemo(() => new Set(candidates.map((candidate) => candidate.id)), [candidates])

  const allTests = useMemo((): TestWithContext[] => {
    const tests: TestWithContext[] = []
    for (const [candidateId, candidateTests] of Object.entries(testsByCandidate)) {
      if (!activeCandidateIds.has(candidateId)) continue
      const candidate = candidateById.get(candidateId)
      if (!candidate) continue
      for (const test of candidateTests) {
        tests.push({ ...test, hiringCompany: candidate.hiringCompany || candidate.recruiterCompany })
      }
    }
    return tests.sort((a, b) => {
      const aTime = (a.completedAt ?? a.createdAt)?.toMillis() ?? 0
      const bTime = (b.completedAt ?? b.createdAt)?.toMillis() ?? 0
      return bTime - aTime
    })
  }, [testsByCandidate, candidateById, activeCandidateIds])

  const activeInvites = allTests.filter(
    (test) => (test.status === 'pending' || test.status === 'in-progress') && !isTestExpired(test),
  )

  const bundleGroups = useMemo((): BundleGroup[] => {
    const groups = new Map<string, TestWithContext[]>()
    for (const test of activeInvites) {
      const key = test.bundleId ?? `legacy-${test.id}`
      const list = groups.get(key) ?? []
      list.push(test)
      groups.set(key, list)
    }

    return [...groups.entries()].map(([bundleId, tests]) => ({
      bundleId: bundleId.startsWith('legacy-') ? null : bundleId,
      tests,
      completedCount: tests.filter((test) => test.status === 'completed').length,
    }))
  }, [activeInvites])

  const previousResults = allTests.filter(
    (test) =>
      test.status === 'completed' &&
      ((test.testType === 'personality' && test.personalityScore) || (test.testType !== 'personality' && test.score)),
  )

  const skillsProfile = candidates.find((candidate) => candidate.skillsProfile)?.skillsProfile ?? null

  function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = emailInput.trim()
    setStoredRecruitEmail(trimmed)
    setCandidates([])
    setTestsByCandidate({})
    setIsLoadingCandidates(true)
    setLookupEmail(trimmed)
  }

  if (!isFirebaseConfigured) {
    return (
      <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        Firebase isn't configured yet — copy .env.example to .env.local and add your project's values to load your
        results.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Your assessments</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          View your skills profile, open assessment invites, and review past results. Use the same email address your
          recruiter used when they submitted your resume.
        </p>
      </div>

      <Card className="space-y-4">
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleLookup}>
          <div className="min-w-[220px] flex-1 space-y-2">
            <label htmlFor="recruit-email" className="text-sm font-medium text-slate-200">
              Your email
            </label>
            <input
              id="recruit-email"
              type="email"
              required
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
            />
          </div>
          <button
            type="submit"
            className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Load my assessments
          </button>
        </form>
      </Card>

      {!lookupEmail && (
        <Card className="text-center">
          <p className="text-sm text-slate-400">Enter your email above to see your skills profile and assessments.</p>
        </Card>
      )}

      {lookupEmail && isLoadingCandidates && candidates.length === 0 && <Spinner label="Looking up your profile…" />}

      {lookupEmail && !isLoadingCandidates && candidates.length === 0 && (
        <Card className="space-y-2 text-center">
          <p className="text-sm text-slate-300">No submissions found for {lookupEmail}.</p>
          <p className="text-sm text-slate-500">
            Double-check the email your recruiter used, or ask them to send you an assessment invite.
          </p>
        </Card>
      )}

      {candidates.length > 0 && (
        <>
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Skills profile</h2>
              <p className="mt-1 text-sm text-slate-400">Skills extracted from your most recent resume submission.</p>
            </div>
            {skillsProfile ? (
              <SkillsProfileCard profile={skillsProfile} />
            ) : (
              <Card>
                <Spinner label="Your skills profile is still being analyzed…" />
              </Card>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Pending assessments</h2>
              <p className="mt-1 text-sm text-slate-400">Active assessments waiting for you to start or finish.</p>
            </div>
            {activeInvites.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-400">No active invites right now. Check back when a recruiter sends one.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {bundleGroups.map((group) => (
                  <BundleGroupSection key={group.bundleId ?? group.tests[0]?.id} group={group} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Previous results</h2>
              <p className="mt-1 text-sm text-slate-400">Completed assessments and how you scored.</p>
            </div>
            {previousResults.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-400">No completed assessments yet.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {previousResults.map((test) => (
                  <TestRow key={test.id} test={test} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
