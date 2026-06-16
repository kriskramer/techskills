import { Link, Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/recruiter" className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Praxis
          </Link>
          <nav className="text-sm text-slate-300">
            <Link to="/recruiter" className="hover:text-cyan-300">
              Recruiter workspace
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
