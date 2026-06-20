import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { CandidateLayout } from './components/layout/CandidateLayout'
import { AuthProvider } from './contexts/AuthProvider'
import { NotFoundPage } from './pages/NotFoundPage'
import { TestLandingPage } from './pages/candidate/TestLandingPage'
import { TestResultsPage } from './pages/candidate/TestResultsPage'
import { TestRunnerPage } from './pages/candidate/TestRunnerPage'
import { CandidateDetailPage } from './pages/recruiter/CandidateDetailPage'
import { NewCandidatePage } from './pages/recruiter/NewCandidatePage'
import { RecruiterDashboardPage } from './pages/recruiter/RecruiterDashboardPage'
import { RecruiterLoginPage } from './pages/recruiter/RecruiterLoginPage'
import { RecruiterSettingsPage } from './pages/recruiter/RecruiterSettingsPage'
import { WhatWeDoPage } from './pages/recruiter/WhatWeDoPage'
import { RecruitResultsPage } from './pages/recruit/RecruitResultsPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/recruiter" replace />} />

        <Route element={<AppLayout />}>
          <Route path="/recruiter/login" element={<RecruiterLoginPage />} />
          <Route path="/recruit/tests" element={<RecruitResultsPage />} />
          <Route path="/recruiter/what-we-do" element={<WhatWeDoPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/recruiter" element={<RecruiterDashboardPage />} />
            <Route path="/recruiter/new" element={<NewCandidatePage />} />
            <Route path="/recruiter/candidates/:id" element={<CandidateDetailPage />} />
            <Route path="/recruiter/settings" element={<RecruiterSettingsPage />} />
          </Route>
        </Route>

        <Route element={<CandidateLayout />}>
          <Route path="/test/:token" element={<TestLandingPage />} />
          <Route path="/test/:token/run" element={<TestRunnerPage />} />
          <Route path="/test/:token/results" element={<TestResultsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
