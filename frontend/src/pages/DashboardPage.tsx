import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, AlertTriangle, Shield, CheckCircle2,
  RefreshCw, Terminal, Eye, Sliders, Zap
} from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'
import { useEventsStore } from '@/stores/events.store'
import { formatRelativeTime } from '@/lib/utils'

// ─── Phase Deviation Waveform Signature Component ───────────────────────────
function PhaseWaveform({ deviation }: { deviation: number }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    let animId: number
    const tick = () => {
      setPhase(p => (p + 0.08) % (Math.PI * 2))
      animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Draw nominal and anomalous sine paths
  const getSinePath = (amplitude: number, shift: number) => {
    let path = `M 0 50`
    for (let x = 0; x <= 300; x += 5) {
      const y = 50 + Math.sin((x / 20) + phase + shift) * amplitude
      path += ` L ${x} ${y}`
    }
    return path
  }

  const nominalPath = getSinePath(20, 0)
  const anomalousPath = getSinePath(22, deviation * 0.4)

  return (
    <div className="rounded-xl border border-[#162030] bg-[#071022] p-4 flex flex-col justify-between h-48 relative overflow-hidden">
      {/* Background Grid Lines */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <line x1="0" y1="25" x2="100" y2="25" stroke="#00E5FF" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#00E5FF" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#00E5FF" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="flex items-center justify-between z-10">
        <div>
          <span className="text-[10px] font-mono text-[#3d566e] tracking-widest uppercase">Grid Phasing Telemetry</span>
          <h4 className="text-sm font-bold font-mono text-[#E2E8F0] mt-0.5">Sub-02 Phase Angle Shift</h4>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1 text-[#8EDDBE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8EDDBE] animate-pulse" />
            NOMINAL
          </span>
          <span className="flex items-center gap-1 text-[#E75A43]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E75A43] animate-pulse" />
            OBSERVED
          </span>
        </div>
      </div>

      {/* Interactive SVG wave canvas */}
      <div className="relative flex items-center justify-center h-24 my-1">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
          {/* Nominal Reference Line */}
          <path d={nominalPath} fill="none" stroke="#8EDDBE" strokeWidth="1.5" strokeOpacity="0.4" />
          
          {/* Observed/Anomalous Line */}
          <path
            d={anomalousPath}
            fill="none"
            stroke={deviation > 0.3 ? '#E75A43' : '#FFB040'}
            strokeWidth="2"
            style={{
              filter: `drop-shadow(0 0 4px ${deviation > 0.3 ? 'rgba(231,90,67,0.5)' : 'rgba(255,176,64,0.3)'})`
            }}
          />
        </svg>
      </div>

      <div className="flex justify-between items-center z-10 border-t border-[#162030]/50 pt-2 text-[10px] font-mono text-[#3d566e]">
        <span>Observed Drift: <strong className="text-[#E2E8F0]">{(deviation * 15).toFixed(2)}°</strong></span>
        <span>Line Freq: <strong className="text-[#8EDDBE]">50.02 Hz</strong></span>
      </div>
    </div>
  )
}

// ─── Substation Grid Topology Component ─────────────────────────────────────
interface SubstationNode {
  id: string
  label: string
  status: 'nominal' | 'warning' | 'trip'
  x: string
  y: string
}

function SubstationTopology({ nodes, activeNodeId, onSelectNode }: {
  nodes: SubstationNode[]
  activeNodeId: string
  onSelectNode: (node: SubstationNode) => void
}) {
  const getStatusColor = (status: SubstationNode['status']) => {
    if (status === 'trip') return '#E75A43'
    if (status === 'warning') return '#FFB040'
    return '#8EDDBE'
  }

  const getStatusGlow = (status: SubstationNode['status']) => {
    if (status === 'trip') return 'rgba(231, 90, 67, 0.4)'
    if (status === 'warning') return 'rgba(255, 176, 64, 0.4)'
    return 'rgba(142, 221, 190, 0.2)'
  }

  return (
    <div className="rounded-xl border border-[#162030] bg-[#071022] p-5 flex flex-col h-[340px] relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[#162030]/60 pb-3 z-10">
        <div>
          <span className="text-[10px] font-mono text-[#3d566e] tracking-widest uppercase">Substation Topology Mesh</span>
          <h3 className="text-sm font-bold font-mono text-[#E2E8F0] mt-0.5">High-Voltage Bus Interface</h3>
        </div>
        <div className="text-[10px] font-mono text-[#3d566e]">
          ACTIVE NODES: <strong className="text-[#8EDDBE]">4 / 4</strong>
        </div>
      </div>

      {/* Grid Canvas Diagram */}
      <div className="flex-1 relative border border-[#162030]/30 rounded-lg bg-[#040d1a]/50 flex items-center justify-center p-4">
        {/* Grid lines background */}
        <div className="absolute inset-0 bg-[radial-gradient(#162030_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* Electrical Busbar lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Main Bus A link */}
          <line x1="25%" y1="35%" x2="75%" y2="35%" stroke="#243C5A" strokeWidth="2" />
          {/* Main Bus B link */}
          <line x1="25%" y1="65%" x2="75%" y2="65%" stroke="#243C5A" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Node linking paths */}
          <line x1="25%" y1="35%" x2="25%" y2="65%" stroke="#243C5A" strokeWidth="1.5" />
          <line x1="75%" y1="35%" x2="75%" y2="65%" stroke="#243C5A" strokeWidth="1.5" />
        </svg>

        {nodes.map(node => {
          const color = getStatusColor(node.status)
          const glow = getStatusGlow(node.status)
          const isSelected = activeNodeId === node.id

          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node)}
              className="absolute p-1 rounded-xl flex flex-col items-center gap-1.5 transition-all duration-300 focus:outline-none cursor-pointer group"
              style={{ left: node.x, top: node.y }}
            >
              {/* Outer Pulsing Ring */}
              <div className="relative flex items-center justify-center w-10 h-10">
                <div
                  className="absolute inset-0 rounded-full transition-transform duration-500 scale-95 group-hover:scale-110"
                  style={{
                    border: `1px solid ${color}40`,
                    boxShadow: `0 0 12px ${glow}`,
                    background: isSelected ? `${color}15` : 'transparent'
                  }}
                />
                
                {/* Core substation terminal contact node */}
                <div
                  className="w-4 h-4 rounded-full border transition-all"
                  style={{
                    backgroundColor: node.status === 'nominal' ? '#071022' : color,
                    borderColor: color,
                    boxShadow: node.status !== 'nominal' ? `0 0 8px ${color}` : undefined
                  }}
                />
              </div>

              {/* Node label */}
              <span
                className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border transition-colors"
                style={{
                  color: isSelected ? '#020814' : '#8FA3BF',
                  backgroundColor: isSelected ? color : 'transparent',
                  borderColor: isSelected ? color : '#162030'
                }}
              >
                {node.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Diagram schematic footer */}
      <div className="flex justify-between items-center mt-3 text-[9px] font-mono text-[#3d566e]">
        <span>MAIN BUSBARS: BUS-A (500KV) // BUS-B (STANDBY)</span>
        <span>SCADA PROTOCOL: DNP3 / IEC-61850</span>
      </div>
    </div>
  )
}

// ─── Dashboard Main Controller ──────────────────────────────────────────────
export function DashboardPage() {
  const { liveEvents } = useEventsStore()
  const [selectedSubstation, setSelectedSubstation] = useState<SubstationNode>({
    id: 'sub-02', label: 'SUBSTATION_02', status: 'warning', x: '68%', y: '22%'
  })

  // Simulated node state representing SCADA systems
  const [gridNodes, setGridNodes] = useState<SubstationNode[]>([
    { id: 'sub-01', label: 'SUBSTATION_01', status: 'nominal', x: '18%', y: '22%' },
    { id: 'sub-02', label: 'SUBSTATION_02', status: 'warning', x: '68%', y: '22%' },
    { id: 'sub-03', label: 'SUBSTATION_03', status: 'nominal', x: '18%', y: '52%' },
    { id: 'sub-04', label: 'SUBSTATION_04', status: 'nominal', x: '68%', y: '52%' },
  ])

  // Real-time grid phase drift simulation based on logs
  const [phasingDeviation, setPhasingDeviation] = useState(0.42)

  useEffect(() => {
    // If a critical event occurs in our log store, transition node to trip state
    const hasCritical = liveEvents.some(e => e.severity === 'critical')
    const hasHigh = liveEvents.some(e => e.severity === 'high')

    setGridNodes(prev => prev.map(node => {
      if (node.id === 'sub-02') {
        return {
          ...node,
          status: hasCritical ? 'trip' : hasHigh ? 'warning' : 'nominal'
        }
      }
      return node
    }))

    if (hasCritical) {
      setPhasingDeviation(0.85)
    } else if (hasHigh) {
      setPhasingDeviation(0.48)
    } else {
      setPhasingDeviation(0.12)
    }
  }, [liveEvents])

  const activeStatus = gridNodes.find(n => n.id === selectedSubstation.id)?.status ?? 'nominal'

  return (
    <PageContainer>
      {/* CNI Status Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border bg-surface relative overflow-hidden"
        style={{
          borderColor: activeStatus === 'trip' ? '#E75A43' : activeStatus === 'warning' ? '#FFB040' : '#8EDDBE',
          borderTopWidth: '2px'
        }}
      >
        <div className="flex items-center gap-3">
          {activeStatus === 'trip' ? (
            <div className="p-2 rounded-lg bg-[#E75A43]/15 text-[#E75A43] animate-[danger-pulse_2s_ease-in-out_infinite]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : activeStatus === 'warning' ? (
            <div className="p-2 rounded-lg bg-[#FFB040]/15 text-[#FFB040]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-[#8EDDBE]/15 text-[#8EDDBE]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#3d566e] tracking-widest uppercase">Grid Security Core</span>
              <span className="text-[9px] font-mono text-[#8FA3BF] px-1.5 py-0.5 rounded border border-border">SECURE_MODE: ON</span>
            </div>
            <h2 className="text-sm font-bold font-mono text-[#E2E8F0] uppercase mt-1 tracking-wider">
              {activeStatus === 'trip' ? '⚠ GRID OUTAGE HAZARD: SUB-02 TRIP BREAKER PREVENTED'
                : activeStatus === 'warning' ? '⚡ TRANSIENT FREQUENCY DRIFT REPORTED ON SUB-02'
                : '✓ ALL BUS TRANSMISSION NODES ONLINE AND ALIGNED'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#3d566e] ml-auto sm:ml-0">
          <span>THREATS: <strong style={{ color: activeStatus === 'trip' ? '#E75A43' : activeStatus === 'warning' ? '#FFB040' : '#8EDDBE' }}>{activeStatus === 'trip' ? 'CRITICAL' : activeStatus === 'warning' ? 'WARNING' : 'ZERO'}</strong></span>
          <span className="hidden md:inline">//</span>
          <span className="hidden md:inline">SYSTEM INTEGRITY: <strong className="text-[#8EDDBE]">99.78%</strong></span>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left Column: Grid Substation Map Topology */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          <SubstationTopology
            nodes={gridNodes}
            activeNodeId={selectedSubstation.id}
            onSelectNode={setSelectedSubstation}
          />

          {/* Anomaly Phase Waveform signature */}
          <PhaseWaveform deviation={phasingDeviation} />
        </div>

        {/* Right Column: AI Explainer & Recommended Mitigations */}
        <div className="flex flex-col gap-5">
          {/* Decision Trust explainer */}
          <div className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between relative overflow-hidden" style={{ borderTop: `1px solid ${activeStatus === 'trip' ? '#E75A43' : activeStatus === 'warning' ? '#FFB040' : '#8EDDBE'}80` }}>
            <div className="flex items-center gap-2 mb-4 border-b border-border/60 pb-3">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold font-mono text-[#E2E8F0] uppercase tracking-wider">Telemetry Assessment</h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-mono text-[#3d566e] uppercase tracking-wider block">Assessed Target</span>
                <strong className="text-sm font-mono text-primary mt-0.5">{selectedSubstation.label}</strong>
              </div>

              <div className="rounded-lg bg-bg-2/60 border border-border p-3 space-y-2">
                <span className="text-[10px] font-mono text-[#3d566e] uppercase tracking-widest block">AI Explanation</span>
                <p className="text-xs text-[#8FA3BF] leading-relaxed">
                  {activeStatus === 'trip'
                    ? 'Sub-02 Phase angle shift matches MITRE T0813 (DNP3 Command Poisoning). Attacker deletion of Shadow copies on domain systems preceded this grid frequency deviation, signaling a coordinated ransomware/utility sabotage attempt. Breaker isolation triggered autonomously.'
                    : activeStatus === 'warning'
                    ? 'Phase frequency deviation detected. Attacker initial access via spear-phishing on WS-07 was followed by remote service access to the SCADA system, causing transient command validation telemetry warnings.'
                    : 'System frequency, impedance, and telemetry are nominal. Substation bus connection checks indicate optimal line load alignment across all high-voltage terminals.'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#3d566e] uppercase tracking-widest block mb-2">Automated Protections</span>
                <div className="space-y-2">
                  {[
                    { label: 'Isolate Breaker #4 (Sub-02)', active: activeStatus === 'trip', color: '#E75A43' },
                    { label: 'Disable Compromised SCADA User', active: activeStatus === 'trip' || activeStatus === 'warning', color: '#FFB040' },
                    { label: 'DNP3 Session Encryption Force', active: true, color: '#8EDDBE' },
                  ].map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-bg-2/30 border border-border text-xs">
                      <span className="text-[#8FA3BF] font-mono text-[11px]">{act.label}</span>
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
                        style={{
                          color: act.active ? act.color : '#3d566e',
                          borderColor: act.active ? act.color + '40' : '#1a2942',
                          backgroundColor: act.active ? act.color + '0a' : 'transparent'
                        }}
                      >
                        {act.active ? 'ACTIVE' : 'READY'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Substation Log Stream */}
          <div className="rounded-xl border border-border bg-surface p-5 flex flex-col h-[230px] relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3 border-b border-border/60 pb-3">
              <Terminal className="w-4 h-4 text-warning" />
              <h3 className="text-sm font-bold font-mono text-[#E2E8F0] uppercase tracking-wider">SCADA DNP3 Frame Logs</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[10px] scrollbar-thin">
              {liveEvents.length === 0 ? (
                <div className="text-[#3d566e] py-8 text-center">Monitoring industrial sensor network...</div>
              ) : (
                liveEvents.slice(0, 8).map(event => (
                  <div key={event.id} className="flex items-start gap-1.5 py-1 px-1.5 rounded hover:bg-bg-2 text-[#8FA3BF] transition-colors">
                    <span className="text-[#3d566e] shrink-0">{formatRelativeTime(event.timestamp)}</span>
                    <span className="text-primary shrink-0 font-bold">[{selectedSubstation.id.toUpperCase()}]</span>
                    <span className="truncate">{event.description}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
