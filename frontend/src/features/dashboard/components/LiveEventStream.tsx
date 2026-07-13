/**
 * LiveEventStream — Task B3
 * High-performance scrolling log view with IT/OT type filters.
 * Auto-pauses scroll on user interaction.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, PauseCircle, PlayCircle, Filter } from 'lucide-react'
import { useEventsStore } from '@/stores/events.store'

type EventType = 'all' | 'endpoint' | 'network' | 'scada' | 'auth'

interface LogEntry {
  id: string
  timestamp: string
  type: string
  severity: string
  hostname: string
  description: string
  mitre?: string
  is_simulated?: boolean
}

const SEV_COLOR: Record<string, string> = {
  critical : 'var(--danger)',
  high     : 'var(--warn)',
  medium   : 'var(--accent)',
  low      : 'var(--tx-low)',
}

const TYPE_COLOR: Record<string, string> = {
  endpoint : '#60A5FA',
  network  : '#00E5FF',
  scada    : '#F59E0B',
  auth     : '#A78BFA',
  dns      : '#34D399',
}

const TYPE_LABEL: Record<string, string> = {
  endpoint : 'IT',
  network  : 'NET',
  scada    : 'OT',
  auth     : 'AUTH',
  dns      : 'DNS',
}

const SEED_LOGS: LogEntry[] = [
  { id:'s1', timestamp: new Date(Date.now()-60000).toISOString(), type:'scada',    severity:'critical', hostname:'SCADA-WS-02', description:'Sub-02 Phase angle shift — breaker isolation triggered', mitre:'T0814' },
  { id:'s2', timestamp: new Date(Date.now()-55000).toISOString(), type:'endpoint', severity:'high',     hostname:'WS-07',       description:'vssadmin.exe delete shadows /all — shadow copy deletion', mitre:'T1490' },
  { id:'s3', timestamp: new Date(Date.now()-50000).toISOString(), type:'network',  severity:'high',     hostname:'WS-07',       description:'Outbound C2 connection to 185.220.101.4:443', mitre:'T1059.001' },
  { id:'s4', timestamp: new Date(Date.now()-44000).toISOString(), type:'endpoint', severity:'medium',   hostname:'WS-07',       description:'Spear-phishing attachment macro execution — Q4_Report.xlsm', mitre:'T1566.001' },
  { id:'s5', timestamp: new Date(Date.now()-38000).toISOString(), type:'scada',    severity:'high',     hostname:'SCADA-WS-02', description:'DNP3 invalid function code injection (0x05 Force Trip)', mitre:'T0855' },
  { id:'s6', timestamp: new Date(Date.now()-30000).toISOString(), type:'network',  severity:'low',      hostname:'WS-07',       description:'SMB lateral movement → FileServer-01 (10.0.4.10)', mitre:'T1021.002' },
  { id:'s7', timestamp: new Date(Date.now()-22000).toISOString(), type:'auth',     severity:'medium',   hostname:'DC-01',       description:'Failed admin login attempt — account r.sharma (3/5)', mitre:'T1110' },
  { id:'s8', timestamp: new Date(Date.now()-10000).toISOString(), type:'endpoint', severity:'critical', hostname:'FileServer-01', description:'Mass file encryption detected — 14,500 files renamed .locked', mitre:'T1486' },
]

export function LiveEventStream() {
  const { liveEvents } = useEventsStore()
  const [filter, setFilter]   = useState<EventType>('all')
  const [paused, setPaused]   = useState(false)
  const [logs, setLogs]       = useState<LogEntry[]>(SEED_LOGS)
  const containerRef          = useRef<HTMLDivElement>(null)
  const prevLenRef            = useRef(0)

  // Map live websocket events into log entries
  useEffect(() => {
    if (liveEvents.length === prevLenRef.current) return
    prevLenRef.current = liveEvents.length
    const ev = liveEvents[0]
    const entry: LogEntry = {
      id          : ev.id ?? `live-${Date.now()}`,
      timestamp   : ev.timestamp ?? new Date().toISOString(),
      type        : ev.event_type ?? 'endpoint',
      severity    : ev.severity ?? 'low',
      hostname    : ev.hostname ?? 'SYSTEM',
      description : ev.description ?? '',
      mitre       : ev.mitre_technique_id,
      is_simulated: ev.is_simulated,
    }
    setLogs(prev => [...prev.slice(-200), entry])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveEvents.length])

  // Auto-scroll when not paused
  useEffect(() => {
    if (!paused && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs, paused])

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const nearBottom = scrollHeight - scrollTop - clientHeight < 80
    if (!nearBottom) setPaused(true)
    else setPaused(false)
  }, [])

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter)

  const filters: EventType[] = ['all', 'endpoint', 'network', 'scada', 'auth']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--bd-hairline)',
        background: 'var(--bg-card)',
        flexShrink: 0, flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Radio style={{ width: 13, height: 13, color: 'var(--danger)' }} />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--tx-high)', fontWeight: 600 }}>
            Live Event Stream
          </span>
          <span style={{
            fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 6px',
            borderRadius: 4, background: 'var(--danger-bg)', border: '1px solid var(--danger-ring)',
            color: 'var(--danger)', letterSpacing: '0.08em',
          }}>
            LIVE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Filter style={{ width: 11, height: 11, color: 'var(--tx-low)' }} />
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: 9, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
                background: filter === f ? (f === 'scada' ? `${TYPE_COLOR.scada}20` : 'var(--accent-bg)') : 'transparent',
                border: `1px solid ${filter === f ? (f === 'scada' ? TYPE_COLOR.scada + '40' : 'var(--accent-ring)') : 'var(--bd-hairline)'}`,
                color: filter === f ? (f === 'scada' ? TYPE_COLOR.scada : 'var(--accent)') : 'var(--tx-low)',
                letterSpacing: '0.08em',
              }}
            >
              {f === 'all' ? 'ALL' : TYPE_LABEL[f] ?? f}
            </button>
          ))}
        </div>
      </div>

      {/* Pause banner */}
      <AnimatePresence>
        {paused && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 28, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'var(--warn-bg)', borderBottom: '1px solid var(--warn-ring)',
              fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--warn)',
              cursor: 'pointer', flexShrink: 0, overflow: 'hidden',
            }}
            onClick={() => {
              setPaused(false)
              if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
            }}
          >
            <PauseCircle style={{ width: 12, height: 12 }} />
            Log stream paused — click to resume
            <PlayCircle style={{ width: 12, height: 12 }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log entries */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          flex: 1, overflowY: 'auto', padding: '6px 4px',
          fontFamily: 'var(--font-mono)', fontSize: 11,
        }}
      >
        {filtered.map((log, i) => {
          const sc  = SEV_COLOR[log.severity] ?? 'var(--tx-low)'
          const tc  = TYPE_COLOR[log.type] ?? 'var(--tx-low)'
          const tl  = TYPE_LABEL[log.type] ?? log.type.toUpperCase()
          const ts  = new Date(log.timestamp).toLocaleTimeString('en-GB', { hour12: false })

          return (
            <div
              key={log.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '4px 8px', borderRadius: 4,
                borderLeft: `2px solid ${sc}`,
                marginBottom: 2,
                background: i === filtered.length - 1 ? `${sc}06` : 'transparent',
              }}
            >
              <span style={{ color: 'var(--tx-disabled)', fontSize: 10, flexShrink: 0, marginTop: 1 }}>
                {ts}
              </span>
              <span style={{
                fontSize: 8, padding: '2px 5px', borderRadius: 3, flexShrink: 0,
                background: `${tc}18`, border: `1px solid ${tc}35`,
                color: tc, letterSpacing: '0.06em', fontWeight: 700, marginTop: 1,
              }}>
                {tl}
              </span>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: sc,
                flexShrink: 0, marginTop: 4,
                boxShadow: log.severity === 'critical' ? `0 0 5px ${sc}` : 'none',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: 'var(--tx-mid)', marginRight: 6 }}>{log.hostname}</span>
                <span style={{ color: 'var(--tx-high)' }}>{log.description}</span>
                {log.mitre && (
                  <span style={{ marginLeft: 8, color: 'var(--accent)', fontSize: 9, opacity: 0.7 }}>
                    [{log.mitre}]
                  </span>
                )}
                {log.is_simulated && (
                  <span style={{ marginLeft: 6, fontSize: 8, color: 'var(--warn)', opacity: 0.6 }}>
                    [SIM]
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 16px',
        borderTop: '1px solid var(--bd-hairline)',
        background: 'var(--bg-inset)',
        fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--tx-disabled)',
        flexShrink: 0,
      }}>
        <span>{filtered.length} EVENTS</span>
        <span>WEBSOCKET // UTF-8</span>
      </div>
    </div>
  )
}
