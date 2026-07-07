import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from 'lucide-react'
import { SeverityBadge } from '@/components/ui'
import { useEventsStore } from '@/stores/events.store'
import { formatRelativeTime, capitalize } from '@/lib/utils'

const SEV_COLOR: Record<string, string> = {
  critical: '#FF4D6D',
  high:     '#F59E0B',
  medium:   '#00E5FF',
  low:      '#10D9A0',
  info:     '#8FA3BF',
}

export function LiveEventStream() {
  const { liveEvents, connectionStatus } = useEventsStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [liveEvents.length])

  return (
    <div className="rounded-xl bg-[#040d1a] border border-[#162030] overflow-hidden terminal-screen" style={{ borderTop: '1px solid rgba(0,229,255,0.2)' }}>
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#162030] bg-[#071022]">
        <div className="flex items-center gap-3">
          {/* Window dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D]/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#10D9A0]/70" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-[11px] font-mono font-semibold text-[#8FA3BF] uppercase tracking-widest">
              Event Stream
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Event count */}
          <span className="text-[10px] font-mono text-[#3d566e] border border-[#162030] rounded px-1.5 py-0.5 bg-[#071022]">
            {liveEvents.length} events
          </span>
          {/* Live indicator */}
          <div className={`flex items-center gap-1.5 text-[10px] font-mono font-semibold ${
            connectionStatus === 'connected' ? 'text-[#10D9A0]' : 'text-[#3d566e]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-[#10D9A0] shadow-[0_0_6px_#10D9A0] animate-pulse'
                : 'bg-[#3d566e]'
            }`} />
            {connectionStatus === 'connected' ? 'LIVE' : connectionStatus.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto p-2 space-y-0.5 font-mono text-[11px] relative"
      >
        {/* Prompt line at top */}
        <div className="flex items-center gap-2 px-2 py-1 text-[#3d566e] select-none">
          <span className="text-[#00E5FF]">sentinel</span>
          <span>@</span>
          <span className="text-[#7C3AED]">cyberops</span>
          <span>:~$</span>
          <span className="text-[#8FA3BF]">tail -f /var/log/sentinel/events.log</span>
          <span className="cursor-blink" />
        </div>

        {liveEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#3d566e]">
            <Terminal className="w-6 h-6 mb-2 opacity-30" />
            <p className="text-[10px] font-mono">Waiting for events…</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {liveEvents.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12, backgroundColor: 'rgba(0,229,255,0.06)' }}
                animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-2 py-1 px-2 rounded hover:bg-[#071022]/60 transition-colors cursor-default group"
              >
                {/* Timestamp */}
                <span className="text-[#3d566e] shrink-0 tabular-nums w-14">
                  {formatRelativeTime(event.timestamp)}
                </span>

                {/* Severity dot */}
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                  style={{ background: SEV_COLOR[event.severity] ?? '#8FA3BF', boxShadow: `0 0 4px ${SEV_COLOR[event.severity] ?? '#8FA3BF'}` }}
                />

                {/* Type */}
                <span className="text-[#3d566e] shrink-0 w-14 truncate">[{capitalize(event.event_type)}]</span>

                {/* Description */}
                <span className="text-[#8FA3BF] truncate group-hover:text-[#E2E8F0] transition-colors">{event.description}</span>

                {/* Hostname on hover */}
                {event.hostname && (
                  <span className="text-[#3d566e] shrink-0 hidden group-hover:inline">
                    [{event.hostname}]
                  </span>
                )}

                {/* Severity badge on right */}
                <SeverityBadge severity={event.severity} className="shrink-0 ml-auto hidden group-hover:flex" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
