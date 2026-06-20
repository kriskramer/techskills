import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResumeFileUpload } from './ResumeFileUpload'
import { Card } from '../shared/Card'
import { useAuth } from '../../hooks/useAuth'
import { isFirebaseConfigured } from '../../lib/firebase'
import { createCandidate } from '../../services/candidates'
import { analyzeResume } from '../../services/functions'

export function NewSubmissionPanel() {
  const navigate = useNavigate()
  const { user, profile, uid } = useAuth()
  const recruiterNameDefault = profile?.displayName ?? user?.displayName ?? ''
  const recruiterEmailDefault = profile?.email ?? user?.email ?? ''
  const recruiterCompanyDefault = profile?.defaultCompany ?? ''
  const [recruiterNameDraft, setRecruiterNameDraft] = useState<string | null>(null)
  const [recruiterEmailDraft, setRecruiterEmailDraft] = useState<string | null>(null)
  const [recruiterCompanyDraft, setRecruiterCompanyDraft] = useState<string | null>(null)
  const recruiterName = recruiterNameDraft ?? recruiterNameDefault
  const recruiterEmail = recruiterEmailDraft ?? recruiterEmailDefault
  const recruiterCompany = recruiterCompanyDraft ?? recruiterCompanyDefault
  const [differentHiringCompany, setDifferentHiringCompany] = useState(false)
  const [hiringCompany, setHiringCompany] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!uid) {
      setError('Sign in to submit a candidate.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const candidateId = await createCandidate({
        name,
        email,
        resumeText,
        recruiterName,
        recruiterEmail,
        recruiterCompany,
        hiringCompany: differentHiringCompany ? hiringCompany : recruiterCompany,
        createdBy: uid,
      })
      await analyzeResume(candidateId)
      navigate(`/recruiter/candidates/${candidateId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong analyzing this resume.')
      setIsSubmitting(false)
    }
  }

  return (
    <Card id="new-submission" variant="accent" className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">New submission</h2>
        <p className="mt-1 text-sm text-slate-400">
          Add a candidate and we'll generate a skills overview before you send a test invite.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Your info</h3>

          <div className="space-y-2">
            <label htmlFor="recruiter-name" className="text-sm font-medium text-slate-200">
              Your name
            </label>
            <input
              id="recruiter-name"
              required
              value={recruiterName}
              onChange={(event) => setRecruiterNameDraft(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="recruiter-email" className="text-sm font-medium text-slate-200">
              Your email
            </label>
            <input
              id="recruiter-email"
              type="email"
              required
              value={recruiterEmail}
              onChange={(event) => setRecruiterEmailDraft(event.target.value)}
              placeholder="Results notifications will go here"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300 placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="recruiter-company" className="text-sm font-medium text-slate-200">
              Your company
            </label>
            <input
              id="recruiter-company"
              required
              value={recruiterCompany}
              onChange={(event) => setRecruiterCompanyDraft(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={differentHiringCompany}
              onChange={(event) => setDifferentHiringCompany(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-slate-950/60 accent-cyan-300"
            />
            <span className="text-sm text-slate-300">Hiring company is different from my company</span>
          </label>

          {differentHiringCompany && (
            <div className="space-y-2">
              <label htmlFor="hiring-company" className="text-sm font-medium text-slate-200">
                Hiring company
              </label>
              <input
                id="hiring-company"
                required
                value={hiringCompany}
                onChange={(event) => setHiringCompany(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
              />
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Candidate info</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-200">
                Name
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="resume" className="text-sm font-medium text-slate-200">
                Resume text
              </label>
              <ResumeFileUpload onTextExtracted={setResumeText} disabled={isSubmitting} />
              <textarea
                id="resume"
                required
                rows={8}
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
                placeholder="Paste the candidate's resume here…"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
              />
            </div>

            {error && <p className="text-sm text-rose-300">{error}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isFirebaseConfigured}
          className="w-full rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Generating skills overview…' : 'Submit and analyze resume'}
        </button>
      </form>
    </Card>
  )
}
