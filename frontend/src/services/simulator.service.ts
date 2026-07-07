import api from './api'
import type { SimulationScenario, SimulationRun } from '@/types'

export const simulatorService = {
  async getScenarios(): Promise<SimulationScenario[]> {
    const { data } = await api.get<SimulationScenario[]>('/simulator/scenarios')
    return data
  },

  async runScenario(scenarioId: string): Promise<SimulationRun> {
    const { data } = await api.post<SimulationRun>('/simulator/run', { scenario_id: scenarioId })
    return data
  },

  async getRuns(): Promise<SimulationRun[]> {
    const { data } = await api.get<SimulationRun[]>('/simulator/runs')
    return data
  },

  async getRun(id: string): Promise<SimulationRun> {
    const { data } = await api.get<SimulationRun>(`/simulator/runs/${id}`)
    return data
  },
}
