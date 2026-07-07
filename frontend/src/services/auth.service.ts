import api from './api'
import type { User, AuthTokens } from '@/types'

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string; organization: string }

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens }> {
    const form = new URLSearchParams()
    form.append('username', payload.email)
    form.append('password', payload.password)
    const { data } = await api.post<AuthTokens>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    const user = await authService.me()
    return { user, tokens: data }
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>('/auth/register', payload)
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  async logout(): Promise<void> {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  async refreshToken(): Promise<AuthTokens> {
    const refresh_token = localStorage.getItem('refresh_token')
    const { data } = await api.post<AuthTokens>('/auth/refresh', { refresh_token })
    localStorage.setItem('access_token', data.access_token)
    return data
  },
}
