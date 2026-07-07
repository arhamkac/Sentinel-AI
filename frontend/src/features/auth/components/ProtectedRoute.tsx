import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { FullPageSpinner } from '@/components/ui'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return <FullPageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
