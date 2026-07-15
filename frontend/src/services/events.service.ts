import api from './api'
import type { SecurityEvent, PaginatedResponse, DashboardStats } from '@/types'

export interface EventFilters {
  page?: number
  page_size?: number
  severity?: string
  event_type?: string
  search?: string
  from_time?: string
  to_time?: string
  incident_id?: string
}

export const eventsService = {
  async list(filters: EventFilters = {}): Promise<PaginatedResponse<SecurityEvent>> {
    const { data } = await api.get<PaginatedResponse<SecurityEvent>>('/events', { params: filters })
    return data
  },

  async get(id: string): Promise<SecurityEvent> {
    const { data } = await api.get<SecurityEvent>(`/events/${id}`)
    return data
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>('/events/stats/dashboard')
    return data
  },
}
