import api from './api'
import type { PredictedStep, MitreTechnique, ThreatIndicator } from '@/types'

export const aiService = {
  async investigateIncident(incidentId: string): Promise<{
    narrative: string
    predicted_steps: PredictedStep[]
    confidence: number
    recommendations: string[]
  }> {
    const { data } = await api.post(`/ai/investigate/${incidentId}`)
    return data
  },

  async searchMitre(query: string): Promise<MitreTechnique[]> {
    const { data } = await api.get<MitreTechnique[]>('/ai/mitre/search', { params: { q: query } })
    return data
  },

  async getMitreTechniques(tactic?: string): Promise<MitreTechnique[]> {
    const { data } = await api.get<MitreTechnique[]>('/ai/mitre/techniques', { params: { tactic } })
    return data
  },

  async getThreatIntel(indicators: string[]): Promise<ThreatIndicator[]> {
    const { data } = await api.post<ThreatIndicator[]>('/ai/threat-intel/enrich', { indicators })
    return data
  },

  async chat(message: string, incidentId?: string): Promise<{ response: string; sources: string[] }> {
    const { data } = await api.post('/ai/chat', { message, incident_id: incidentId })
    return data
  },
}
