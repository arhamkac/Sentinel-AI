import { create } from 'zustand'
import type { SecurityEvent } from '@/types'

const MAX_LIVE_EVENTS = 200

interface EventsState {
  liveEvents: SecurityEvent[]
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  addEvent: (event: SecurityEvent) => void
  setConnected: (status: EventsState['connectionStatus']) => void
  clearEvents: () => void
}

export const useEventsStore = create<EventsState>((set) => ({
  liveEvents: [],
  isConnected: false,
  connectionStatus: 'disconnected',

  addEvent: (event) =>
    set((state) => ({
      liveEvents: [event, ...state.liveEvents].slice(0, MAX_LIVE_EVENTS),
    })),

  setConnected: (connectionStatus) =>
    set({ connectionStatus, isConnected: connectionStatus === 'connected' }),

  clearEvents: () => set({ liveEvents: [] }),
}))
