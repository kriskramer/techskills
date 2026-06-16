import { Outlet } from 'react-router-dom'

export function CandidateLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Outlet />
      </main>
    </div>
  )
}
