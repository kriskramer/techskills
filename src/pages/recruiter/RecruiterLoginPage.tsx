import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Card } from '../../components/shared/Card'
import { Spinner } from '../../components/shared/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { isFirebaseConfigured } from '../../lib/firebase'
import { isRecruiterAuthDisabled } from '../../lib/recruiterAuth'
import { signInWithGoogle } from '../../services/auth'

export function RecruiterLoginPage() {
  const { isAuthenticated, loading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isRecruiterAuthDisabled) {
    return <Navigate to="/recruiter" replace />
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading…" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/recruiter" replace />
  }

  async function handleSignIn() {
    setError(null)
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.')
      setIsSigningIn(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white">Recruiter sign-in</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in with Google to manage your candidate portfolio and send skills assessments.
        </p>
      </div>

      {!isFirebaseConfigured && (
        <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          Firebase isn't configured yet — copy .env.example to .env.local and add your project's values to sign in.
        </p>
      )}

      <Card className="space-y-5 text-center">
        <button
          type="button"
          onClick={() => void handleSignIn()}
          disabled={isSigningIn || !isFirebaseConfigured}
          className="w-full rounded-full border border-cyan-300 bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSigningIn ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && <p className="text-sm text-rose-300">{error}</p>}

        <p className="text-xs text-slate-500">
          New here?{' '}
          <Link to="/recruiter/what-we-do" className="text-cyan-300 hover:text-cyan-200">
            Learn what Praxis does
          </Link>
        </p>
      </Card>
    </div>
  )
}
