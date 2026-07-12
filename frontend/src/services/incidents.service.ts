import api from './api'
import type { Incident, PaginatedResponse, AttackGraph, IncidentReport } from '@/types'

export interface IncidentFilters {
  page?: number
  page_size?: number
  severity?: string
  status?: string
  search?: string
}

export interface RemediatePayload {
  action: string
  target: string
  reason?: string
}

export const incidentsService = {
  async list(filters: IncidentFilters = {}): Promise<PaginatedResponse<Incident>> {
    const { data } = await api.get<PaginatedResponse<Incident>>('/incidents', { params: filters })
    return data
  },

  async get(id: string): Promise<Incident> {
    const { data } = await api.get<Incident>(`/incidents/${id}`)
    return data
  },

  async updateStatus(id: string, status: string): Promise<Incident> {
    const { data } = await api.patch<Incident>(`/incidents/${id}/status`, { status })
    return data
  },

  async getAttackGraph(id: string): Promise<AttackGraph> {
    const { data } = await api.get<AttackGraph>(`/incidents/${id}/attack-graph`)
    return data
  },

  async generateNarrative(id: string): Promise<{ narrative: string }> {
    const { data } = await api.post<{ narrative: string }>(`/incidents/${id}/narrative`)
    return data
  },

  async generateReport(id: string): Promise<IncidentReport> {
    const { data } = await api.post<IncidentReport>(`/incidents/${id}/report`)
    return data
  },

  async getReport(id: string): Promise<IncidentReport> {
    const { data } = await api.get<IncidentReport>(`/incidents/${id}/report`)
    return data
  },

  async remediate(id: string, payload: RemediatePayload): Promise<{ status: string; message: string }> {
    const { data } = await api.post<{ status: string; message: string }>(`/incidents/${id}/remediate`, payload)
    return data
  },
}
