import { useEffect, useRef, useCallback } from 'react'
import { WS_BASE_URL, WS_RECONNECT_DELAY, WS_MAX_RECONNECT } from '@/lib/constants'
import { useEventsStore } from '@/stores/events.store'
import type { SecurityEvent } from '@/types'

export function useEventStream() {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCount = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { addEvent, setConnected } = useEventsStore()
  const connectRef = useRef<() => void>(() => {})

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    setConnected('connecting')

    try {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/events?token=${token}`)
      wsRef.current = ws

      ws.onopen = () => {
        reconnectCount.current = 0
        setConnected('connected')
      }

      ws.onmessage = (e) => {
        try {
          const event: SecurityEvent = JSON.parse(e.data)
          addEvent(event)
        } catch (err) {
          console.warn("WebSocket parse error:", err)
        }
      }

      ws.onclose = () => {
        setConnected('disconnected')
        if (reconnectCount.current < WS_MAX_RECONNECT) {
          reconnectCount.current++
          reconnectTimer.current = setTimeout(() => {
            connectRef.current()
          }, WS_RECONNECT_DELAY)
        } else {
          setConnected('error')
        }
      }

      ws.onerror = () => {
        setConnected('error')
        ws.close()
      }
    } catch (err) {
      console.warn("WebSocket setup error:", err)
      setConnected('error')
    }
  }, [addEvent, setConnected])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }
    wsRef.current?.close()
    wsRef.current = null
    setConnected('disconnected')
  }, [setConnected])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { connect, disconnect }
}
