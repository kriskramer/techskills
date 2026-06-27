import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/shared/Card'
import { Spinner } from '../../components/shared/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { isFirebaseConfigured } from '../../lib/firebase'
import { ROLE_ARCHETYPES } from '../../lib/personalityRoleArchetypes'
import { updateUserProfile } from '../../services/auth'
import type { RoleArchetypeId } from '../../types/personality'

export function RecruiterSettingsPage() {
  const { user, profile, loading } = useAuth()
  const [displayNameDraft, setDisplayNameDraft] = useState<string | null>(null)
  const [defaultCompanyDraft, setDefaultCompanyDraft] = useState<string | null>(null)
  const [defaultRoleArchetypeDraft, setDefaultRoleArchetypeDraft] = useState<RoleArchetypeId | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName = displayNameDraft ?? profile?.displayName ?? ''
  const defaultCompany = defaultCompanyDraft ?? profile?.defaultCompany ?? ''
  const defaultRoleArchetype = defaultRoleArchetypeDraft ?? profile?.defaultRoleArchetype ?? 'general'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setError(null)
    setSaved(false)
    setIsSaving(true)

    try {
      await updateUserProfile(user.uid, { displayName, defaultCompany, defaultRoleArchetype })
      setDisplayNameDraft(null)
      setDefaultCompanyDraft(null)
      setDefaultRoleArchetypeDraft(null)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong saving your profile.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        Firebase isn't configured yet — copy .env.example to .env.local and add your project's values.
      </p>
    )
  }

  if (loading || !profile) {
    return <Spinner label="Loading profile…" />
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          to="/recruiter"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-300"
        >
          <span aria-hidden="true">←</span>
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your profile pre-fills the submission form and identifies you on candidate records.
        </p>
      </div>

      {!profile.defaultCompany && (
        <p className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
          Add your default company so new submissions are faster to fill out.
        </p>
      )}

      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="settings-email" className="text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="settings-email"
              readOnly
              value={profile.email}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-slate-400 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="settings-name" className="text-sm font-medium text-slate-200">
              Display name
            </label>
            <input
              id="settings-name"
              required
              value={displayName}
              onChange={(event) => setDisplayNameDraft(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="settings-company" className="text-sm font-medium text-slate-200">
              Default company
            </label>
            <input
              id="settings-company"
              value={defaultCompany}
              onChange={(event) => setDefaultCompanyDraft(event.target.value)}
              placeholder="Used when submitting new candidates"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300 placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="settings-role-archetype" className="text-sm font-medium text-slate-200">
              Default role context
            </label>
            <select
              id="settings-role-archetype"
              value={defaultRoleArchetype}
              onChange={(event) => setDefaultRoleArchetypeDraft(event.target.value as RoleArchetypeId)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
            >
              {ROLE_ARCHETYPES.map((archetype) => (
                <option key={archetype.id} value={archetype.id}>
                  {archetype.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              Pre-selects role context on personality reports for new candidates until you change it per candidate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save profile'}
            </button>
            {saved && <span className="text-sm text-emerald-300">Saved</span>}
            {error && <span className="text-sm text-rose-300">{error}</span>}
          </div>
        </form>
      </Card>
    </div>
  )
}
