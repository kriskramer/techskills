import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-100">
      <h1 className="text-3xl font-semibold text-white">Page not found</h1>
      <p className="text-sm text-slate-400">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="inline-block rounded-full border border-cyan-300 px-5 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/10"
      >
        Back to home
      </Link>
    </div>
  )
}
