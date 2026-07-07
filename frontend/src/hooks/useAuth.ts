import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    if (token === 'mock_demo_token') {
      setUser({
        id: 'demo-user',
        name: 'Demo Analyst',
        email: 'demo@sentinel.ai',
        role: 'admin',
        organization_id: 'demo-org',
        created_at: new Date().toISOString()
      })
      setLoading(false)
      return
    }
    authService.me()
      .then(setUser)
      .catch(() => {
        logout()
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { user, isAuthenticated, isLoading, logout }
}
