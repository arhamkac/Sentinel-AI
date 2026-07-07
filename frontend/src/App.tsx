import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { RegisterPage } from '@/features/auth/components/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { IncidentsPage } from '@/pages/IncidentsPage'
import { IncidentDetailPage } from '@/pages/IncidentDetailPage'
import { AttackGraphPage } from '@/pages/AttackGraphPage'
import { AIInvestigationPage } from '@/pages/AIInvestigationPage'
import { MitrePage } from '@/pages/MitrePage'
import { ThreatIntelPage } from '@/pages/ThreatIntelPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { SimulatorPage } from '@/pages/SimulatorPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useAuth } from '@/hooks/useAuth'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Triggers the auth check on mount
  useAuth()
  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
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
      </AuthInitializer>
    </BrowserRouter>
  )
}
