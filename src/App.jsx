import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import RoleSelect from './pages/RoleSelect'

// Heavy pages — loaded only when the route is visited
const ProfileForm   = lazy(() => import('./pages/ProfileForm'))
const Report        = lazy(() => import('./pages/Report'))
const WeeklyCheckin = lazy(() => import('./pages/WeeklyCheckin'))
const Progress      = lazy(() => import('./pages/Progress'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/select-role" element={<RequireAuth><RoleSelect /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><ProfileForm /></RequireAuth>} />
            <Route path="/report" element={<RequireAuth><Report /></RequireAuth>} />
            <Route path="/checkin" element={<RequireAuth><WeeklyCheckin /></RequireAuth>} />
            <Route path="/progress" element={<RequireAuth><Progress /></RequireAuth>} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
