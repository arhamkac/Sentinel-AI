import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

// Lazy loaded pages (named exports extraction)
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/components/RegisterPage').then(m => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const IncidentsPage = lazy(() => import('@/pages/IncidentsPage').then(m => ({ default: m.IncidentsPage })))
const IncidentDetailPage = lazy(() => import('@/pages/IncidentDetailPage').then(m => ({ default: m.IncidentDetailPage })))
const AttackGraphPage = lazy(() => import('@/pages/AttackGraphPage').then(m => ({ default: m.AttackGraphPage })))
const AIInvestigationPage = lazy(() => import('@/pages/AIInvestigationPage').then(m => ({ default: m.AIInvestigationPage })))
const MitrePage = lazy(() => import('@/pages/MitrePage').then(m => ({ default: m.MitrePage })))
const ThreatIntelPage = lazy(() => import('@/pages/ThreatIntelPage').then(m => ({ default: m.ThreatIntelPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.ReportsPage })))
const SimulatorPage = lazy(() => import('@/pages/SimulatorPage').then(m => ({ default: m.SimulatorPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

// Simple loading indicator fallback
function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
    </div>
  )
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Triggers the auth check on mount
  useAuth()
  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/incidents" element={<IncidentsPage />} />
                <Route path="/incidents/:id" element={<IncidentDetailPage />} />
                <Route path="/attack-graph" element={<AttackGraphPage />} />
                <Route path="/attack-graph/:incidentId" element={<AttackGraphPage />} />
                <Route path="/ai-investigation" element={<AIInvestigationPage />} />
                <Route path="/ai-investigation/:incidentId" element={<AIInvestigationPage />} />
                <Route path="/mitre" element={<MitrePage />} />
                <Route path="/threat-intel" element={<ThreatIntelPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/simulator" element={<SimulatorPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthInitializer>
    </BrowserRouter>
  )
}
