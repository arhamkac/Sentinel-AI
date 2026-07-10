import React, { useRef, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, ShieldAlert } from 'lucide-react'
import { SeverityBadge } from '@/components/ui'
import { useEventsStore } from '@/stores/events.store'
import { formatRelativeTime } from '@/lib/utils'

const SEV_COLOR: Record<string, string> = {
  critical: '#FF4D6D',
  high:     '#F59E0B',
  medium:   '#00E5FF',
  low:      '#10D9A0',
  info:     '#8FA3BF',
}

export function LiveEventStream() {
  const { liveEvents, connectionStatus } = useEventsStore()
  const [filter, setFilter] = useState<'all' | 'it' | 'ot' | 'correlated'>('all')
  const [isFrozen, setIsFrozen] = useState(false)
  const [scrollTop, setScrollTop] = useState(0)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollTopRef = useRef<number>(0)

  // ─── Filter Events ───────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    return liveEvents.filter(event => {
      if (filter === 'all') return true
      if (filter === 'it') {
        return event.event_type === 'endpoint' || event.event_type === 'network'
      }
      if (filter === 'ot') {
        return event.event_type === 'scada'
      }
      if (filter === 'correlated') {
        return event.severity === 'critical' || event.severity === 'high' || event.event_type === 'correlation'
      }
      return true
    })
  }, [liveEvents, filter])

  // ─── Auto Scroll / Scroll Freeze ──────────────────────────────────
  useEffect(() => {
    // If not frozen, auto-scroll to the top (newest events are added at index 0)
    if (!isFrozen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [liveEvents.length, isFrozen])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    setScrollTop(target.scrollTop)

    // Detect user scrolling down/up. Since items are prepended, index 0 is top.
    // If the user scrolls down (i.e. scrollTop > 0), they are looking at older logs.
    // Freeze scroll to let them read/copy.
    if (target.scrollTop > 5) {
      if (!isFrozen) {
        setIsFrozen(true)
      }
    } else {
      if (isFrozen && target.scrollTop <= 5) {
        setIsFrozen(false)
      }
    }
    lastScrollTopRef.current = target.scrollTop
  }

  const handleResume = () => {
    setIsFrozen(false)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ─── Custom Lightweight Virtualization ────────────────────────────
  const viewportHeight = 260
  const rowHeight = 32
  
  const totalHeight = filteredEvents.length * rowHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2)
  const endIndex = Math.min(filteredEvents.length, Math.ceil((scrollTop + viewportHeight) / rowHeight) + 2)

  const visibleItems = useMemo(() => {
    return filteredEvents.slice(startIndex, endIndex).map((item, index) => ({
      item,
      top: (startIndex + index) * rowHeight,
    }))
  }, [filteredEvents, startIndex, endIndex])

  return (
    <div className="rounded-xl bg-[#040d1a] border border-[#162030] overflow-hidden terminal-screen flex flex-col h-[340px]" style={{ borderTop: '1px solid rgba(0,229,255,0.2)' }}>
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#162030] bg-[#071022] shrink-0">
        <div className="flex items-center gap-3">
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

        {/* Filter Toolbar */}
        <div className="flex items-center gap-1.5 border border-[#162030] rounded bg-[#030914] p-0.5 font-mono text-[9px]">
          {(['all', 'it', 'ot', 'correlated'] as const).map(type => (
            <button
              key={type}
              onClick={() => {
                setFilter(type)
                setIsFrozen(false)
                if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
              }}
              className={`px-2 py-0.5 rounded uppercase tracking-wider transition-colors cursor-pointer ${
                filter === type
                  ? 'bg-[#00E5FF]/15 text-[#00E5FF] font-bold border border-[#00E5FF]/20'
                  : 'text-[#5b738c] hover:text-[#8FA3BF]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#3d566e] border border-[#162030] rounded px-1.5 py-0.5 bg-[#071022]">
            {filteredEvents.length} events
          </span>
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

      {/* Warning Freeze Banner */}
      <AnimatePresence>
        {isFrozen && (
          <motion.button
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '24px' }}
            exit={{ opacity: 0, height: 0 }}
            onClick={handleResume}
            className="w-full bg-[#F59E0B] text-black font-mono text-[10px] font-bold py-1 flex items-center justify-center gap-2 cursor-pointer border-b border-[#F59E0B]/30 hover:bg-[#F59E0B]/90 transition-colors shrink-0"
          >
            <ShieldAlert className="w-3 h-3 animate-pulse" />
            <span>Log stream paused. Click to resume</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Terminal body */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 font-mono text-[11px] relative scrollbar-thin"
        style={{ background: '#040d1a' }}
      >
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#3d566e]">
            <Terminal className="w-6 h-6 mb-2 opacity-30 animate-pulse" />
            <p className="text-[10px] font-mono">No telemetry matching query...</p>
          </div>
        ) : (
          <div className="relative w-full" style={{ height: totalHeight }}>
            {visibleItems.map(({ item: event, top }) => {
              // Categorize and style logs
              const isOT = event.event_type === 'scada'
              const isIT = event.event_type === 'endpoint' || event.event_type === 'network'
              const isCorrelated = event.severity === 'critical' || event.severity === 'high'

              let rowClass = "text-[#8FA3BF]"
              let typeLabel = "[SYS]"
              let typeColor = "text-[#8FA3BF]"

              if (isOT) {
                rowClass = "text-[#F59E0B] bg-[#F59E0B]/[0.02]"
                typeLabel = "[OT-SCADA]"
                typeColor = "text-[#F59E0B] font-semibold"
              } else if (isIT) {
                rowClass = "text-[#00E5FF] bg-[#00E5FF]/[0.01]"
                typeLabel = event.event_type === 'network' ? "[IT-NET]" : "[IT-END]"
                typeColor = "text-[#00E5FF] font-semibold"
              }

              if (isCorrelated) {
                rowClass += " border-l-2 border-[#FF4D6D] pl-1.5"
              }

              return (
                <div
                  key={event.id}
                  className={`absolute left-0 right-0 flex items-center gap-2 px-2 rounded hover:bg-[#071022]/80 transition-colors cursor-default group`}
                  style={{ top, height: rowHeight }}
                >
                  {/* Timestamp */}
                  <span className="text-[#3d566e] shrink-0 tabular-nums w-14">
                    {formatRelativeTime(event.timestamp)}
                  </span>

                  {/* Severity dot */}
                  <span
                    className="shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{
                      background: SEV_COLOR[event.severity] ?? '#8FA3BF',
                      boxShadow: `0 0 4px ${SEV_COLOR[event.severity] ?? '#8FA3BF'}`,
                    }}
                  />

                  {/* Customized label based on IT vs OT */}
                  <span className={`shrink-0 text-[10px] w-20 ${typeColor}`}>
                    {typeLabel}
                  </span>

                  {/* Description */}
                  <span className={`truncate flex-1 ${rowClass} group-hover:text-white transition-colors`}>
                    {event.description}
                  </span>

                  {/* Hostname */}
                  {event.hostname && (
                    <span className="text-[#3d566e] shrink-0 text-[10px] font-semibold bg-[#162030]/30 px-1 rounded">
                      {event.hostname}
                    </span>
                  )}

                  {/* Severity badge on right */}
                  <SeverityBadge severity={event.severity} className="shrink-0 ml-auto scale-90" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
export default LiveEventStream;
