import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExpiredInvitePanel } from '../../components/recruiter/ExpiredInvitePanel'
import { InviteLinkPanel } from '../../components/recruiter/InviteLinkPanel'
import { PipelineActionsPanel } from '../../components/recruiter/PipelineActionsPanel'
import { ResumeFileUpload } from '../../components/recruiter/ResumeFileUpload'
import { ResumeTestComparisonPanel } from '../../components/recruiter/ResumeTestComparisonPanel'
import { SkillsProfileCard } from '../../components/recruiter/SkillsProfileCard'
import { SkillsProfileEditor } from '../../components/recruiter/SkillsProfileEditor'
import { TestCustomizationPanel } from '../../components/recruiter/TestCustomizationPanel'
import { TestHistoryPanel } from '../../components/recruiter/TestHistoryPanel'
import { Card } from '../../components/shared/Card'
import { Spinner } from '../../components/shared/Spinner'
import { isFirebaseConfigured } from '../../lib/firebase'
import { printAssessmentReport } from '../../lib/assessmentReport'
import {
  clearCandidateAnalysisError,
  markCandidateReviewed,
  subscribeToCandidate,
  updateCandidatePipeline,
  updateCandidateProfile,
  updateCandidateProfileMetadata,
  updateCandidateSkillsProfile,
} from '../../services/candidates'
import type { TestDifficultyPreset } from '../../lib/testDifficulty'
import { analyzeResume, generateTestProfile } from '../../services/functions'
import { markNotificationsReadForCandidate } from '../../services/notifications'
import { subscribeToTest, subscribeToTestsForCandidate } from '../../services/tests'
import { useAuth } from '../../hooks/useAuth'
import type { Candidate, PipelineStatus, SkillsProfile } from '../../types/candidate'
import type { TestDoc } from '../../types/test'

type DetailTab = 'overview' | 'history'

const RESUME_PREVIEW_LENGTH = 200

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { uid } = useAuth()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [test, setTest] = useState<TestDoc | null>(null)
  const [testHistory, setTestHistory] = useState<TestDoc[]>([])
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingSkills, setIsEditingSkills] = useState(false)
  const [isSavingSkills, setIsSavingSkills] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const [isMarkingReviewed, setIsMarkingReviewed] = useState(false)
  const [isUpdatingPipeline, setIsUpdatingPipeline] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editResumeText, setEditResumeText] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isResumeExpanded, setIsResumeExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsResumeExpanded(false)
  }, [id, candidate?.resumeText])

  useEffect(() => {
    if (!id || !isFirebaseConfigured) return
    return subscribeToCandidate(id, setCandidate)
  }, [id])

  useEffect(() => {
    if (!candidate?.testId || !isFirebaseConfigured) return
    return subscribeToTest(candidate.testId, setTest)
  }, [candidate?.testId])

  useEffect(() => {
    if (!id || !isFirebaseConfigured) return
    return subscribeToTestsForCandidate(id, setTestHistory)
  }, [id])

  function startEditing() {
    if (!candidate) return
    setEditName(candidate.name)
    setEditEmail(candidate.email)
    setEditResumeText(candidate.resumeText)
    setError(null)
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setError(null)
  }

  async function handleGenerateTest(
    categoryCounts?: Record<string, number>,
    difficulty: TestDifficultyPreset = 'medium',
  ) {
    if (!id) return

    const hasActiveTest =
      test != null &&
      (test.status === 'pending' || test.status === 'in-progress') &&
      (test.expiresAt == null || test.expiresAt.toDate() >= new Date())

    let forceRegenerate = false
    if (hasActiveTest) {
      const confirmed = window.confirm(
        'This candidate already has an active test invite. Generate a new test anyway? The current invite will remain in history but will no longer be the primary test.',
      )
      if (!confirmed) return
      forceRegenerate = true
    }

    setError(null)
    setIsGenerating(true)
    try {
      await generateTestProfile(id, categoryCounts, difficulty, forceRegenerate)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong generating the test.')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleRetryAnalysis() {
    if (!id) return
    setError(null)
    setIsReanalyzing(true)
    try {
      await clearCandidateAnalysisError(id)
      await analyzeResume(id, { force: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong re-analyzing this resume.')
    } finally {
      setIsReanalyzing(false)
    }
  }

  async function handleSaveSkills(profile: SkillsProfile) {
    if (!id) return
    setIsSavingSkills(true)
    setError(null)
    try {
      await updateCandidateSkillsProfile(id, profile)
      setIsEditingSkills(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong saving skills.')
    } finally {
      setIsSavingSkills(false)
    }
  }

  async function handleMarkReviewed() {
    if (!id || !uid) return
    setIsMarkingReviewed(true)
    setError(null)
    try {
      await markCandidateReviewed(id)
      await markNotificationsReadForCandidate(uid, id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong marking results as reviewed.')
    } finally {
      setIsMarkingReviewed(false)
    }
  }

  async function handlePipelineUpdate(status: PipelineStatus, note: string) {
    if (!id) return
    setIsUpdatingPipeline(true)
    setError(null)
    try {
      await updateCandidatePipeline(id, status, note)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong updating pipeline status.')
    } finally {
      setIsUpdatingPipeline(false)
    }
  }

  async function handleUpdateProfile() {
    if (!id || !candidate) return
    setError(null)
    setIsUpdating(true)
    try {
      const resumeChanged = editResumeText !== candidate.resumeText
      if (resumeChanged) {
        await updateCandidateProfile(id, {
          name: editName,
          email: editEmail,
          resumeText: editResumeText,
        })
        await analyzeResume(id)
      } else {
        await updateCandidateProfileMetadata(id, {
          name: editName,
          email: editEmail,
        })
      }
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong updating this profile.')
    } finally {
      setIsUpdating(false)
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
  const resultsNeedReview =
    candidate.status === 'completed' &&
    test?.status === 'completed' &&
    test.completedAt &&
    (!candidate.reviewedAt || test.completedAt.toMillis() > candidate.reviewedAt.toMillis())

  const inviteExpired =
    test != null &&
    test.status !== 'completed' &&
    test.expiresAt != null &&
    test.expiresAt.toDate() < new Date()

  const resumeText = candidate.resumeText
  const isResumeTruncated = resumeText.length > RESUME_PREVIEW_LENGTH
  const displayedResumeText =
    isResumeExpanded || !isResumeTruncated
      ? resumeText
      : resumeText.slice(0, RESUME_PREVIEW_LENGTH)

  return (
    <div className="space-y-6">
      <Link
        to="/recruiter"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-300"
      >
        <span aria-hidden="true">←</span>
        Back to dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">{candidate.name}</h1>
        <p className="mt-1 text-sm text-slate-400">{candidate.email}</p>
      </div>

      <div className="flex gap-1 border-b border-white/10">
        {(['overview', 'history'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? 'border-cyan-300 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'history' && testHistory.length > 0 ? `History (${testHistory.length})` : tab}
          </button>
        ))}
      </div>

      {activeTab === 'history' ? (
        <section className="space-y-4">
          <p className="text-sm text-slate-400">All test attempts for this candidate, newest first.</p>
          <TestHistoryPanel tests={testHistory} currentTestId={candidate.testId} candidateId={id} />
        </section>
      ) : (
        <>
      <PipelineActionsPanel
        candidate={{ ...candidate, pipelineStatus: candidate.pipelineStatus ?? 'active' }}
        onUpdate={handlePipelineUpdate}
        isSaving={isUpdatingPipeline}
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Resume</h2>
          {!isEditing && (
            <button
              type="button"
              onClick={startEditing}
              disabled={isUpdating}
              className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Update resume
            </button>
          )}
        </div>

        {isEditing ? (
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void handleUpdateProfile()
            }}
          >
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium text-slate-200">
                Name
              </label>
              <input
                id="edit-name"
                required
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-email" className="text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                id="edit-email"
                type="email"
                required
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-resume" className="text-sm font-medium text-slate-200">
                Resume text
              </label>
              <ResumeFileUpload onTextExtracted={setEditResumeText} disabled={isUpdating} />
              <textarea
                id="edit-resume"
                required
                rows={12}
                value={editResumeText}
                onChange={(event) => setEditResumeText(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? 'Regenerating skills overview…' : 'Save and regenerate skills overview'}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isUpdating}
                className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-slate-300 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {error && <p className="text-sm text-rose-300">{error}</p>}
          </form>
        ) : (
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">
            {displayedResumeText}
            {isResumeTruncated && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={() => setIsResumeExpanded((expanded) => !expanded)}
                  className="text-cyan-300 transition hover:text-cyan-200"
                >
                  {isResumeExpanded ? 'less...' : 'more...'}
                </button>
              </>
            )}
          </p>
        )}
      </Card>

      {candidate.skillsProfile ? (
        isEditingSkills ? (
          <SkillsProfileEditor
            profile={candidate.skillsProfile}
            onSave={handleSaveSkills}
            onCancel={() => setIsEditingSkills(false)}
            isSaving={isSavingSkills}
          />
        ) : (
          <div className="space-y-3">
            <SkillsProfileCard profile={candidate.skillsProfile} />
            {!test && (
              <button
                type="button"
                onClick={() => setIsEditingSkills(true)}
                className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200"
              >
                Edit skills
              </button>
            )}
          </div>
        )
      ) : candidate.analysisError ? (
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-rose-200">Analysis failed</h2>
            <p className="mt-2 text-sm text-slate-300">{candidate.analysisError}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleRetryAnalysis()}
            disabled={isReanalyzing}
            className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
          >
            {isReanalyzing ? 'Re-analyzing…' : 'Re-analyze resume'}
          </button>
          {error && <p className="text-sm text-rose-300">{error}</p>}
        </Card>
      ) : (
        <Card className="space-y-4">
          <Spinner label="Analyzing resume…" />
          <button
            type="button"
            onClick={() => void handleRetryAnalysis()}
            disabled={isReanalyzing}
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200 disabled:opacity-50"
          >
            {isReanalyzing ? 'Retrying…' : 'Retry analysis'}
          </button>
        </Card>
      )}

      {candidate.skillsProfile && !test && !isEditingSkills && (
        <TestCustomizationPanel
          profile={candidate.skillsProfile}
          onGenerate={handleGenerateTest}
          isGenerating={isGenerating}
        />
      )}

      {error && candidate.skillsProfile && !isEditingSkills && !test && (
        <p className="text-sm text-rose-300">{error}</p>
      )}

      {test && inviteUrl && (
        <>
          {inviteExpired ? (
            <ExpiredInvitePanel test={test} onUpdated={() => undefined} />
          ) : (
            <InviteLinkPanel
              url={inviteUrl}
              test={test}
              candidateId={id}
              candidateName={candidate.name}
              candidateEmail={candidate.email}
              recruiterName={candidate.recruiterName}
              recruiterCompany={candidate.recruiterCompany}
              hiringCompany={candidate.hiringCompany}
            />
          )}
        </>
      )}

      {test?.status === 'completed' && test.score && (
        <Card className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Results</h2>
            <div className="flex flex-wrap gap-2">
              {resultsNeedReview && (
                <button
                  type="button"
                  onClick={() => void handleMarkReviewed()}
                  disabled={isMarkingReviewed}
                  className="rounded-full border border-cyan-300/50 bg-cyan-300/10 px-4 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-cyan-300/20 disabled:opacity-50"
                >
                  {isMarkingReviewed ? 'Saving…' : 'Mark reviewed'}
                </button>
              )}
              <button
                type="button"
                onClick={() => printAssessmentReport(candidate, test)}
                className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200"
              >
                Export report
              </button>
              <button
                type="button"
                onClick={() => void handleGenerateTest()}
                disabled={isGenerating}
                className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? 'Generating…' : 'Re-run test'}
              </button>
            </div>
          </div>

          <div>
            <p className="text-3xl font-bold text-cyan-300">
              {test.score.total > 0 ? Math.round((test.score.correct / test.score.total) * 100) : 0}%
              <span className="ml-2 text-base font-normal text-slate-400">
                ({test.score.correct}/{test.score.total} correct)
              </span>
            </p>
          </div>

          {candidate.skillsProfile && (
            <ResumeTestComparisonPanel profile={candidate.skillsProfile} score={test.score} />
          )}

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
        </>
      )}
    </div>
  )
}
