import { Link, NavLink, Outlet } from 'react-router-dom'
import { NotificationBell } from '../recruiter/NotificationBell'
import { useAuth } from '../../hooks/useAuth'
import { isRecruiterAuthDisabled } from '../../lib/recruiterAuth'
import { signOutRecruiter } from '../../services/auth'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-1.5 transition ${
    isActive ? 'bg-white/10 text-cyan-300' : 'text-slate-300 hover:text-cyan-300'
  }`

export function AppLayout() {
  const { user, profile, isAuthenticated } = useAuth()

  async function handleSignOut() {
    if (isRecruiterAuthDisabled) return
    await signOutRecruiter()
  }

  const displayName = profile?.displayName || user?.displayName || user?.email || 'Recruiter'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {isRecruiterAuthDisabled && (
        <div className="border-b border-amber-400/30 bg-amber-400/10 px-6 py-2 text-center text-sm text-amber-100">
          Auth disabled — development mode only
        </div>
      )}

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/recruiter" className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Praxis
          </Link>

          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {isAuthenticated && (
              <>
                <NavLink to="/recruiter" end className={navLinkClass}>
                  Recruiter Dashboard
                </NavLink>
                <NavLink to="/recruiter/what-we-do" className={navLinkClass}>
                  What We Do
                </NavLink>
                <NavLink to="/recruiter/settings" className={navLinkClass}>
                  Settings
                </NavLink>
              </>
            )}
            <NavLink to="/recruit/tests" className={navLinkClass}>
              Your Results
            </NavLink>
          </nav>

          {isAuthenticated && (
            <div className="flex items-center gap-3 text-sm">
              <NotificationBell />
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="h-8 w-8 rounded-full border border-white/10" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-xs font-semibold text-cyan-300">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="hidden text-slate-300 sm:inline">{displayName}</span>
              {!isRecruiterAuthDisabled && (
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-white/40 hover:text-white"
                >
                  Sign out
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
