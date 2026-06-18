import { Link, NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-1.5 transition ${
    isActive ? 'bg-white/10 text-cyan-300' : 'text-slate-300 hover:text-cyan-300'
  }`

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/recruiter" className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Praxis
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <NavLink to="/recruiter" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/recruiter/what-we-do" className={navLinkClass}>
              What We Do
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
