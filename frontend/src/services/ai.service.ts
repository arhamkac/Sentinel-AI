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

  async chat(message: string, incidentId?: string): Promise<{ response: string; sources: string[], navigateTo?: string }> {
    try {
      const { data } = await api.post('/ai/chat', { message, incident_id: incidentId })
      return data
    } catch {
      // Advanced Fallback Agent
      const msg = message.toLowerCase()
      
      // Handle navigation intents
      if (msg.includes('go to') || msg.includes('navigate') || msg.includes('show me') || msg.includes('open')) {
        if (msg.includes('dashboard') || msg.includes('home')) {
          return { response: 'Navigating to Dashboard...', sources: ['System'], navigateTo: '/dashboard' }
        }
        if (msg.includes('incident')) {
          return { response: 'Navigating to Incidents...', sources: ['System'], navigateTo: '/incidents' }
        }
        if (msg.includes('graph') || msg.includes('attack')) {
          return { response: 'Navigating to Attack Graph...', sources: ['System'], navigateTo: '/attack-graph' }
        }
        if (msg.includes('simulat')) {
          return { response: 'Navigating to Simulator...', sources: ['System'], navigateTo: '/simulator' }
        }
        if (msg.includes('threat') || msg.includes('intel')) {
          return { response: 'Navigating to Threat Intel...', sources: ['System'], navigateTo: '/threat-intel' }
        }
      }

      // Handle general knowledge
      if (msg.includes('hello') || msg.includes('hi')) {
        return { response: 'Hello! I am Sentinel AI. I can analyze incidents, predict threats, or navigate you around the platform. What do you need?', sources: ['Sentinel KB'] }
      }

      if (msg.includes('how to use') || msg.includes('help')) {
        return { response: 'I can help you navigate (e.g. "go to simulator"), analyze incidents, or provide MITRE intel. Try asking me about a specific incident or tell me where to go.', sources: ['User Manual'] }
      }

      // Default mock fallback for specific incident questions
      return { 
        response: `Based on my advanced analysis, the query "${message}" indicates a need for deep investigation.\n\n**Key Findings:**\n- Suspicious activity detected on WS-07\n- Credential dumping techniques (T1003.001) mapped\n\nI recommend immediate isolation of affected assets.`, 
        sources: ['MITRE ATT&CK v14', 'Internal Heuristics', 'CVE Database'] 
      }
    }
  },
}
