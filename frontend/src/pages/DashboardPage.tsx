import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Terminal, Globe, Activity, Zap,
  TrendingUp, TrendingDown, Minus,
  Cpu, ShieldOff, Eye,
} from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { useEventsStore } from '@/stores/events.store'
import { AnomalyWaveform } from '@/features/dashboard/components/AnomalyWaveform'
import { LiveEventStream } from '@/features/dashboard/components/LiveEventStream'

/* ─── shared token shorthands ─────────────────────────────────── */
const T = {
  accent  : 'var(--accent)',
  danger  : 'var(--danger)',
  warn    : 'var(--warn)',
  success : 'var(--success)',
  info    : 'var(--info)',
  txHigh  : 'var(--tx-high)',
  txMid   : 'var(--tx-mid)',
  txLow   : 'var(--tx-low)',
  card    : 'var(--bg-card)',
  inset   : 'var(--bg-inset)',
  bdDef   : 'var(--bd-default)',
  bdHair  : 'var(--bd-hairline)',
  mono    : 'var(--font-mono)',
}

/* ─── types ───────────────────────────────────────────────────── */
interface SubNode { id: string; label: string; status: 'ok'|'warn'|'err'; cx: number; cy: number }
interface LogLine  { text: string; color: string }

const nodeCol = (s: SubNode['status']) =>
  s === 'err' ? T.danger : s === 'warn' ? T.warn : T.accent

const DEFAULT_LOGS: LogLine[] = [
  { text: '[14:02:31.442] OUTSTATION_04 → MASTER :: RESP_DIRECT_OPERATE (Obj 12, Var 1, Index 4)', color: T.accent },
  { text: '[14:02:31.458] Frame Validation: CRC OK // Seq: 14 // Length: 28 bytes',                  color: T.txLow  },
  { text: '[14:02:32.001] AI_AGENT :: Analyzing Sub-02 Phase Angle Shift (+0.04 deg)',               color: T.warn   },
  { text: '[14:02:33.211] MASTER → ALL_NODES :: CLASS_POLL_0_1_2_3',                                 color: T.txLow  },
  { text: '[14:02:33.225] NODE_01 :: ACK :: Data received successfully',                             color: T.txLow  },
  { text: '[14:02:33.231] NODE_02 :: ACK :: Data received successfully',                             color: T.txLow  },
  { text: '[14:02:33.245] NODE_04 :: ALERT :: Breaker trip detected in Sub-02-B4',                  color: T.danger },
  { text: '[14:02:33.400] AI_RESPONSE :: Automated protection routine triggered.',                   color: T.warn   },
  { text: '[14:02:34.002] Logs rotation... syncing with central audit.',                             color: T.txLow  },
]

/* ─── TopologyMap ─────────────────────────────────────────────── */
function TopologyMap({ nodes, selected, onSelect }: {
  nodes: SubNode[]; selected: string; onSelect: (id: string) => void
}) {
  /* SVG coordinate space: 520 × 240 */
  const busY1 = 70, busY2 = 170
  const cols  = [86, 260, 434]

  return (
    <div className="relative w-full" style={{ height: 270 }}>
      {/* dot-grid bg */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius   : 10,
          backgroundImage: 'radial-gradient(rgba(0,217,180,0.09) 1px, transparent 1px)',
          backgroundSize : '24px 24px',
        }}
      />

      <svg
        width="100%" height="100%"
        viewBox="0 0 520 240"
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        {/* bus A – solid */}
        <line x1={cols[0]} y1={busY1} x2={cols[2]} y2={busY1}
          stroke="rgba(0,217,180,0.22)" strokeWidth={1.5} />
        {/* bus B – dashed */}
        <line x1={cols[0]} y1={busY2} x2={cols[2]} y2={busY2}
          stroke="rgba(0,217,180,0.13)" strokeWidth={1.5} strokeDasharray="8 6" />
        {/* column verticals */}
        {cols.map(x => (
          <line key={x} x1={x} y1={busY1} x2={x} y2={busY2}
            stroke="rgba(0,217,180,0.11)" strokeWidth={1} />
        ))}
        {/* mid horizontal */}
        <line x1={cols[0]} y1={120} x2={cols[2]} y2={120}
          stroke="rgba(0,217,180,0.07)" strokeWidth={1} strokeDasharray="4 8" />

        {nodes.map(n => {
          const c = nodeCol(n.status)
          const a = n.id === selected
          return (
            <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(n.id)}>
              {/* outermost halo (active only) */}
              {a && <circle cx={n.cx} cy={n.cy} r={24} fill="none" stroke={c} strokeWidth={1} opacity={0.12} />}
              {/* selection ring */}
              <circle cx={n.cx} cy={n.cy} r={a ? 14 : 9}
                fill="none" stroke={c} strokeWidth={a ? 1.5 : 1} opacity={a ? 0.65 : 0.38} />
              {/* soft glow blob for non-ok */}
              {n.status !== 'ok' && <circle cx={n.cx} cy={n.cy} r={8} fill={c} opacity={0.10} />}
              {/* core */}
              <circle cx={n.cx} cy={n.cy} r={n.status === 'err' ? 5.5 : 4}
                fill={n.status === 'ok' ? T.inset : c} stroke={c} strokeWidth={1.5} />
              {/* label pill */}
              <rect x={n.cx - 52} y={n.cy + 18} width={104} height={17} rx={3}
                fill={a ? `${c}16` : 'rgba(9,18,32,0.80)'}
                stroke={a ? `${c}40` : 'rgba(30,53,80,0.70)'}
                strokeWidth={0.8} />
              <text x={n.cx} y={n.cy + 30}
                textAnchor="middle"
                fontSize={7.5} fontFamily="JetBrains Mono, monospace"
                fontWeight="600" letterSpacing="0.07em"
                fill={a ? c : T.txLow}>
                {n.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* footer strip */}
      <div
        className="absolute bottom-0 left-0 right-0 flex justify-between items-center"
        style={{
          padding    : '6px 16px',
          borderTop  : `1px solid ${T.bdHair}`,
          fontFamily : T.mono,
          fontSize   : 9,
          color      : T.txLow,
        }}
      >
        <span>MAIN BUSBARS: BUS-A (500KV) // BUS-B (STANDBY)</span>
        <span>SCADA PROTOCOL: DNP3 / IEC-61850</span>
      </div>
    </div>
  )
}

/* ─── ScadaLogs ───────────────────────────────────────────────── */
function ScadaLogs({ lines }: { lines: LogLine[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [lines])
  return (
    <div ref={ref} className="overflow-y-auto h-full" style={{ fontFamily: T.mono, fontSize: 11, lineHeight: 1.75 }}>
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.color, padding: '0 4px', borderRadius: 3 }}
          className="transition-colors hover:bg-white/[0.02]">{l.text}</div>
      ))}
    </div>
  )
}

/* ─── ThreatMap ───────────────────────────────────────────────── */
function ThreatMap() {
  const pts = [
    { x: '13%', y: '33%', c: T.danger }, { x: '83%', y: '26%', c: T.accent },
    { x: '55%', y: '43%', c: T.accent }, { x: '68%', y: '28%', c: T.warn   },
    { x: '30%', y: '51%', c: T.accent }, { x: '91%', y: '57%', c: T.accent },
    { x: '44%', y: '22%', c: T.accent }, { x: '72%', y: '62%', c: T.accent },
    { x: '20%', y: '64%', c: T.accent },
  ]
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
        <path d="M55 38 Q78 18 122 28 Q142 42 132 78 Q112 98 82 88 Q48 78 55 38Z" fill="#0b1f35" />
        <path d="M88 108 Q112 98 122 130 Q117 172 97 177 Q74 167 78 142 Q80 120 88 108Z" fill="#0b1f35" />
        <path d="M174 28 Q200 18 215 40 Q221 62 200 70 Q183 65 174 50 Q168 40 174 28Z" fill="#0b1f35" />
        <path d="M178 78 Q206 73 217 110 Q212 154 196 162 Q173 157 167 122 Q166 94 178 78Z" fill="#0b1f35" />
        <path d="M220 22 Q282 13 342 33 Q372 50 362 82 Q332 102 280 90 Q238 75 223 54 Q213 38 220 22Z" fill="#0b1f35" />
        <path d="M308 132 Q340 122 357 142 Q362 167 341 174 Q313 174 303 152 Q300 138 308 132Z" fill="#0b1f35" />
      </svg>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: ['linear-gradient(rgba(0,217,180,0.055) 1px,transparent 1px)', 'linear-gradient(90deg,rgba(0,217,180,0.055) 1px,transparent 1px)'].join(','),
        backgroundSize : '26px 26px',
      }} />
      {pts.map((d, i) => (
        <div key={i} className="absolute" style={{ left: d.x, top: d.y, transform: 'translate(-50%,-50%)' }}>
          <div className="relative flex items-center justify-center" style={{ width: 16, height: 16 }}>
            <div className="absolute rounded-full animate-ping"
              style={{ width: 14, height: 14, background: d.c, opacity: 0.22 }} />
            <div className="relative rounded-full z-10"
              style={{ width: 6, height: 6, background: d.c, boxShadow: `0 0 6px ${d.c}` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── MetricCard ──────────────────────────────────────────────── */
function SummaryCard({ title, value, detail, accent }: { title: string; value: string; detail: string; accent: string }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.bdDef}`,
      borderRadius: 20,
      padding: '24px',
      boxShadow: 'var(--sh-md)',
      minHeight: 120,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.txLow, textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: T.mono }}>{title}</span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}` }} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: T.txHigh, fontFamily: T.mono, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.txMid, lineHeight: 1.5 }}>{detail}</div>
    </div>
  )
}

function MetricCard({ label, value, unit, trend, trendLabel, icon, accent }: {
  label: string; value: string; unit?: string
  trend?: 'up'|'down'|'flat'; trendLabel?: string
  icon: React.ReactNode; accent: string
}) {
  const TI = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const tc = trend === 'up' ? T.danger : trend === 'down' ? T.success : T.txLow
  return (
    <div style={{
      background  : T.card,
      border      : `1px solid ${T.bdDef}`,
      borderTop   : `2px solid ${accent}`,
      borderRadius: 18,
      padding     : 20,
      display     : 'flex',
      flexDirection:'column',
      gap         : 12,
      boxShadow   : 'var(--sh-md)',
      height      : '100%',
      minHeight   : 148,
      justifyContent: 'flex-start',
    }}>
      {/* label row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: T.txMid }}>{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          display:'flex', alignItems:'center', justifyContent:'center',
          background: `${accent}12`, border: `1px solid ${accent}28`,
        }}>
          <span style={{ color: accent, display:'flex' }}>{icon}</span>
        </div>
      </div>
      {/* value */}
      <div style={{ display:'flex', alignItems:'baseline', gap: 6 }}>
        <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, color: T.txHigh, fontFamily: T.mono }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: T.txLow, fontFamily: T.mono }}>{unit}</span>}
      </div>
      {/* trend */}
      {trendLabel && (
        <div style={{ display:'flex', alignItems:'center', gap: 5 }}>
          <TI style={{ width: 12, height: 12, color: tc }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: tc }}>{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

/* ─── ProtectionRow ───────────────────────────────────────────── */
function ProtectionRow({ label, active, accent }: { label:string; active:boolean; accent:string }) {
  return (
    <div style={{
      display       : 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap           : 10,
      padding       : '12px 14px',
      borderRadius  : 12,
      background    : T.inset,
      border        : `1px solid ${active ? `${accent}30` : T.bdHair}`,
    }}>
      <span style={{ fontSize: 12, color: T.txMid }}>{label}</span>
      <span style={{
        fontSize    : 9, fontWeight: 700, letterSpacing: '0.08em',
        padding     : '3px 8px', borderRadius: 5,
        fontFamily  : T.mono,
        color       : active ? accent : T.txLow,
        background  : active ? `${accent}14` : 'transparent',
        border      : `1px solid ${active ? `${accent}40` : T.bdHair}`,
      }}>
        {active ? 'ACTIVE' : 'READY'}
      </span>
    </div>
  )
}

/* ─── Section card wrapper ────────────────────────────────────── */
const cardStyle = {
  background  : T.card,
  border      : `1px solid ${T.bdDef}`,
  borderRadius: 24,
  boxShadow   : 'var(--sh-md)',
  overflow    : 'hidden' as const,
}
const cardHeaderStyle = {
  display      : 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap          : 12,
  flexWrap     : 'wrap' as const,
  padding      : '24px 24px',
  borderBottom : `1px solid var(--bd-hairline)`,
}

/* ─── DashboardPage ───────────────────────────────────────────── */
export function DashboardPage() {
  const { liveEvents } = useEventsStore()
  const hasCritical = liveEvents.some(e => e.severity === 'critical')
  const hasHigh     = liveEvents.some(e => e.severity === 'high')
  const alert       = hasCritical ? 'trip' : hasHigh ? 'warn' : 'ok'
  const sc          = alert === 'trip' ? T.danger : alert === 'warn' ? T.warn : T.accent

  const [sel, setSel] = useState('sub-02')

  const nodes: SubNode[] = useMemo(() => [
    { id:'sub-01', label:'SUBSTATION_01',   status:'ok',   cx: 86, cy: 70  },
    { id:'sub-02', label:'SUBSTATION_02',   status: alert==='trip'?'err': alert==='warn'?'warn':'ok', cx:260, cy:70  },
    { id:'sub-03', label:'SUBSTATION_03',   status:'ok',   cx:434, cy: 70  },
    { id:'sub-04', label:'SUBSTATION_04',   status:'ok',   cx: 86, cy:170  },
    { id:'sub-05', label:'SUBSTATION_05',   status:'ok',   cx:260, cy:170  },
    { id:'sub-06', label:'SUBSTATION_06',   status:'ok',   cx:434, cy:170  },
    { id:'brk',    label:'BREAKER_X_ERR',   status:'err',  cx:160, cy:120  },
    { id:'trf',    label:'TRANSFORMER_SEC', status:'ok',   cx:358, cy:120  },
  ] as SubNode[], [alert])

  const okCount = nodes.filter(n => n.status === 'ok').length
  const selNode = nodes.find(n => n.id === sel)

  const [logLines, setLogLines] = useState<LogLine[]>(DEFAULT_LOGS)
  const prevLen = useRef(0)
  useEffect(() => {
    if (!liveEvents.length || liveEvents.length === prevLen.current) return
    prevLen.current = liveEvents.length
    const ev = liveEvents[0]
    const ts = new Date(ev.timestamp).toLocaleTimeString('en-GB', { hour12: false })
    const col = ev.severity==='critical'?T.danger: ev.severity==='high'?T.warn: ev.severity==='medium'?T.accent: T.txLow
    setLogLines(p => [...p, { text:`[${ts}.000] ${ev.hostname??'SYSTEM'} :: ${ev.description}`, color:col }].slice(-40))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveEvents.length])

  const aiText = alert === 'trip'
    ? 'Sub-02 phase angle shift matches MITRE T0813 (DNP3 Command Poisoning). Shadow copy deletion preceded grid frequency deviation. Breaker isolation triggered autonomously.'
    : alert === 'warn'
    ? 'Phase frequency deviation on Sub-02. Spear-phishing on WS-07 preceded remote SCADA access, causing transient DNP3 command validation warnings.'
    : 'System frequency, impedance, and telemetry are nominal. Bus connection checks confirm optimal line load alignment. Minimal harmonic distortion in the DNP3 frame layer.'

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl border px-4 py-3 sm:px-6 sm:py-4"
        style={{
          background    : `${sc}0A`,
          border        : `1px solid ${sc}30`,
          borderLeft    : `3px solid ${sc}`,
          boxShadow     : `0 0 28px ${sc}0E`,
        }}
      >
        <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none', background:`linear-gradient(90deg,${sc}07 0%,transparent 55%)` }} />

        <div className="relative flex min-w-0 flex-wrap items-center gap-3">
          <span className="status-dot" style={{ background: sc, boxShadow:`0 0 8px ${sc}` }} />
          <span className="max-w-[min(100%,42rem)] overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: 12, fontWeight: 600, color: sc, fontFamily: T.mono, textTransform:'uppercase', letterSpacing:'0.04em' }}>
            {alert==='trip' ? 'GRID OUTAGE HAZARD — SUB-02 TRIP BREAKER PREVENTED'
            : alert==='warn'? 'TRANSIENT FREQUENCY DRIFT DETECTED ON SUB-02'
            : 'ALL BUS TRANSMISSION NODES ONLINE AND ALIGNED'}
          </span>
          <span style={{ flexShrink:0, fontSize:9, padding:'3px 8px', borderRadius:5, color:T.txLow, background:T.inset, border:`1px solid ${T.bdHair}`, fontFamily:T.mono, letterSpacing:'0.08em' }}>
            SECURE_MODE: ON
          </span>
        </div>

        <div className="relative hidden flex-wrap items-center gap-4 md:flex" style={{ fontFamily:T.mono, fontSize:11 }}>
          <span style={{ color:T.txLow }}>THREATS: <strong style={{ color:sc }}>{alert==='trip'?'CRITICAL': alert==='warn'?'WARNING':'ZERO'}</strong></span>
          <span style={{ color:T.bdDef }}>|</span>
          <span style={{ color:T.txLow }}>INTEGRITY: <strong style={{ color:T.accent }}>99.78%</strong></span>
        </div>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard title="Active Incidents" value="09" detail="3 require immediate analyst attention" accent={T.danger} />
        <SummaryCard title="Analyst Confidence" value="97%" detail="Narrative confidence above baseline" accent={T.accent} />
        <SummaryCard title="Threat Propagation" value="14" detail="Nodes linked to the current campaign" accent={T.warn} />
      </div>

      {/* ── Anomaly Waveform (Task B4) ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnomalyWaveform
          riskScore={alert === 'trip' ? 0.91 : alert === 'warn' ? 0.58 : 0.12}
          eventRate={liveEvents.length * 2 + 25}
          label="IT/OT Risk Waveform"
          height={130}
        />
        <div style={{
          background: T.card, border: `1px solid ${T.bdDef}`, borderRadius: 20,
          overflow: 'hidden', height: 130, boxShadow: 'var(--sh-md)',
        }}>
          <LiveEventStream />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.3,delay:0.06 }} style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <p style={{ fontSize:10, fontFamily:T.mono, textTransform:'uppercase', letterSpacing:'0.18em', color:T.txLow, marginBottom:4 }}>Investigation Context</p>
                <h2 style={{ fontSize:18, fontWeight:600, color:T.txHigh, lineHeight:1.2 }}>Attack path traced across the substation mesh</h2>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:10, fontFamily:T.mono, textTransform:'uppercase', letterSpacing:'0.14em', color:T.txLow, marginBottom:4 }}>Aligned Nodes</p>
                <p style={{ fontSize:15, fontWeight:700, fontFamily:T.mono, color:T.accent }}>
                  {okCount} / {nodes.length}
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-5 lg:p-6">
              <TopologyMap nodes={nodes} selected={sel} onSelect={setSel} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.3,delay:0.1 }}
            className="terminal-overlay scan-line flex min-h-70 flex-col"
            style={{ ...cardStyle, minHeight: 280 }}>
            <div style={cardHeaderStyle}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--warn-bg)', border:'1px solid var(--warn-ring)' }}>
                  <Terminal style={{ width:15, height:15, color:T.warn }} />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:T.txHigh, lineHeight:1.2 }}>AI Evidence Chain</p>
                  <p style={{ fontSize:10, color:T.txLow, marginTop:2 }}>Machine-generated investigation narrative</p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:T.accent, boxShadow:`0 0 5px ${T.accent}`, animation:'pulse-dot 2s ease-in-out infinite', display:'block' }} />
                <span style={{ fontSize:10, fontFamily:T.mono, color:T.txLow }}>LIVE</span>
              </div>
            </div>
            <div className="flex-1 min-h-0 px-5 py-4 sm:px-6 sm:py-5">
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ borderRadius:12, padding:'12px 14px', background:T.inset, border:`1px solid ${T.bdHair}`, display:'flex', flexDirection:'column', gap:6 }}>
                  <span style={{ fontSize:10, fontFamily:T.mono, textTransform:'uppercase', letterSpacing:'0.14em', color:T.txLow }}>Observed sequence</span>
                  <p style={{ fontSize:12, color:T.txMid, lineHeight:1.65 }}>{aiText}</p>
                </div>
                <div style={{ display:'grid', gap:8, gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))' }}>
                  <div style={{ borderRadius:12, padding:'12px 14px', background:'rgba(255,255,255,0.02)', border:`1px solid ${T.bdHair}` }}>
                    <div style={{ fontSize:10, fontFamily:T.mono, textTransform:'uppercase', letterSpacing:'0.14em', color:T.txLow, marginBottom:4 }}>Likelihood</div>
                    <div style={{ fontSize:16, fontWeight:700, color:T.txHigh, fontFamily:T.mono }}>High</div>
                  </div>
                  <div style={{ borderRadius:12, padding:'12px 14px', background:'rgba(255,255,255,0.02)', border:`1px solid ${T.bdHair}` }}>
                    <div style={{ fontSize:10, fontFamily:T.mono, textTransform:'uppercase', letterSpacing:'0.14em', color:T.txLow, marginBottom:4 }}>Origin</div>
                    <div style={{ fontSize:16, fontWeight:700, color:T.txHigh, fontFamily:T.mono }}>Internal</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.3,delay:0.12 }} style={cardStyle}>
            <div style={{ padding:'18px 20px 12px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--accent-bg)', border:'1px solid var(--accent-ring)' }}>
                <Globe style={{ width:15, height:15, color:T.accent }} />
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:T.txHigh, lineHeight:1.2 }}>Threat Propagation</p>
                <p style={{ fontSize:10, color:T.txLow, marginTop:2 }}>Cross-domain spread visualization</p>
              </div>
            </div>
            <div style={{ margin:'0 20px 20px', borderRadius:16, overflow:'hidden', minHeight:176 }}>
              <ThreatMap />
            </div>
            <div style={{ padding:'12px 24px 20px', borderTop:`1px solid ${T.bdHair}`, display:'flex', flexDirection:'column', gap:8 }}>
              {[{ c:T.danger, label:'1 latent anomaly (RU)' }, { c:T.accent, label:'4.2k secure nodes' }].map(({ c, label }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:8, fontSize:11 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:c, boxShadow:`0 0 5px ${c}`, flexShrink:0 }} />
                  <span style={{ color:T.txMid }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.3,delay:0.17 }}
            style={{ ...cardStyle, borderTop:`2px solid ${sc}`, boxShadow:`var(--sh-md), 0 0 0 1px ${sc}08 inset` }}>
            <div style={{ ...cardHeaderStyle, borderBottom:`1px solid ${T.bdHair}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--accent-bg)', border:'1px solid var(--accent-ring)' }}>
                  <Activity style={{ width:15, height:15, color:T.accent }} />
                </div>
                <p style={{ fontSize:13, fontWeight:600, color:T.txHigh }}>Recommended Response</p>
              </div>
            </div>

            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <p style={{ fontSize:10, fontFamily:T.mono, textTransform:'uppercase', letterSpacing:'0.14em', color:T.txLow, marginBottom:5 }}>Assessed Target</p>
                <p style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:T.accent }}>{selNode?.label ?? 'SUBSTATION_02'}</p>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <p style={{ fontSize:10, fontFamily:T.mono, textTransform:'uppercase', letterSpacing:'0.14em', color:T.txLow }}>Automated Protections</p>
                <ProtectionRow label="Isolate Breaker #4 (Sub-02)"   active={alert==='trip'}              accent={T.danger} />
                <ProtectionRow label="Disable Compromised SCADA User" active={alert==='trip'||alert==='warn'} accent={T.warn}   />
                <ProtectionRow label="DNP3 Session Encryption Force"  active={true}                       accent={T.accent} />
              </div>

              <button
                className="transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                style={{
                  width        : '100%', padding: '12px 0',
                  borderRadius : 12,
                  background   : T.accent,
                  color        : '#020912',
                  fontSize     : 12, fontWeight: 700,
                  fontFamily   : T.mono,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  border       : 'none', cursor: 'pointer',
                  boxShadow    : '0 4px 20px rgba(0,229,255,0.24)',
                }}
              >
                Execute Countermeasures [6]
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.3,delay:0.22 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Load Balance"       value="74.2"  unit="%"     trend="up"   trendLabel="+2.1% vs last hour" icon={<TrendingUp  style={{ width:15,height:15 }} />} accent={T.accent} />
        <MetricCard label="Packet Drop"        value="0.001" unit="%"     trend="flat" trendLabel="Nominal"            icon={<Cpu         style={{ width:15,height:15 }} />} accent={T.success} />
        <MetricCard label="Encryption Entropy" value="7.99"  unit="/ 8.0"             trendLabel="Near-perfect"       icon={<ShieldOff   style={{ width:15,height:15 }} />} accent={T.info} />
        <MetricCard label="Active Watchdogs"   value="1,024"                           trendLabel="Running"           icon={<Eye         style={{ width:15,height:15 }} />} accent={T.warn} />
      </motion.div>
    </PageContainer>
  )
}
