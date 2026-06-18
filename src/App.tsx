import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { CandidateLayout } from './components/layout/CandidateLayout'
import { NotFoundPage } from './pages/NotFoundPage'
import { TestLandingPage } from './pages/candidate/TestLandingPage'
import { TestResultsPage } from './pages/candidate/TestResultsPage'
import { TestRunnerPage } from './pages/candidate/TestRunnerPage'
import { CandidateDetailPage } from './pages/recruiter/CandidateDetailPage'
import { NewCandidatePage } from './pages/recruiter/NewCandidatePage'
import { RecruiterDashboardPage } from './pages/recruiter/RecruiterDashboardPage'
import { WhatWeDoPage } from './pages/recruiter/WhatWeDoPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/recruiter" replace />} />

      <Route element={<AppLayout />}>
        <Route path="/recruiter" element={<RecruiterDashboardPage />} />
        <Route path="/recruiter/new" element={<NewCandidatePage />} />
        <Route path="/recruiter/what-we-do" element={<WhatWeDoPage />} />
        <Route path="/recruiter/candidates/:id" element={<CandidateDetailPage />} />
      </Route>

      <Route element={<CandidateLayout />}>
        <Route path="/test/:token" element={<TestLandingPage />} />
        <Route path="/test/:token/run" element={<TestRunnerPage />} />
        <Route path="/test/:token/results" element={<TestResultsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
