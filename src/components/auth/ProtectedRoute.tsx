import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '../shared/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { isRecruiterAuthDisabled } from '../../lib/recruiterAuth'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (isRecruiterAuthDisabled) {
    return <Outlet />
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Checking sign-in…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/recruiter/login" replace />
  }

  return <Outlet />
}
