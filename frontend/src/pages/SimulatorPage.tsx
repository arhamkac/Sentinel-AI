import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Play, CheckCircle, Clock, AlertTriangle, Zap,
  Shield, Radio, Lock, Skull, Database, Globe, Key,
} from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { SeverityBadge } from '@/components/ui'
import { simulatorService } from '@/services/simulator.service'
import type { SimulationScenario, SimulationRun } from '@/types'
import { TwinControls } from '@/features/simulator/components/TwinControls'

const ATTACK_ICONS: Record<string, React.ElementType> = {
  Ransomware: Skull,
  APT: Shield,
  Exfiltration: Database,
  'Credential Attack': Key,
}

const MOCK_SCENARIOS: SimulationScenario[] = [
  { id:'s1', name:'Ransomware Kill Chain', description:'Simulates a complete ransomware attack from phishing email through encryption. Covers all major phases: initial access, execution, persistence, credential access, lateral movement, and impact.', attack_type:'Ransomware', severity:'critical', estimated_duration:'~3 minutes', techniques:['T1566','T1059','T1003','T1021','T1486'], target_profile:'Corporate Windows Environment' },
  { id:'s2', name:'APT Lateral Movement', description:'Advanced persistent threat performing stealthy lateral movement using valid credentials and living-off-the-land techniques.', attack_type:'APT', severity:'high', estimated_duration:'~2 minutes', techniques:['T1021','T1078','T1027','T1053'], target_profile:'Enterprise Active Directory' },
  { id:'s3', name:'Data Exfiltration via DNS', description:'Simulates slow, low-and-slow data exfiltration using DNS tunneling to bypass traditional network controls.', attack_type:'Exfiltration', severity:'medium', estimated_duration:'~90 seconds', techniques:['T1048','T1071','T1030'], target_profile:'Corporate Network with DNS monitoring' },
  { id:'s4', name:'Credential Stuffing Attack', description:'Automated credential stuffing attack against web application using breached credentials database.', attack_type:'Credential Attack', severity:'high', estimated_duration:'~60 seconds', techniques:['T1110','T1078','T1213'], target_profile:'Web Application' },
]

const MOCK_RUNS: SimulationRun[] = [
  { id:'r1', scenario_id:'s1', scenario_name:'Ransomware Kill Chain', status:'completed', events_generated:147, incident_id:'inc-sim-1', started_at: new Date(Date.now()-600000).toISOString(), completed_at: new Date(Date.now()-420000).toISOString() },
  { id:'r2', scenario_id:'s2', scenario_name:'APT Lateral Movement', status:'completed', events_generated:89, incident_id:'inc-sim-2', started_at: new Date(Date.now()-3600000).toISOString(), completed_at: new Date(Date.now()-3300000).toISOString() },
]

// Attack stages for the live run overlay
const ATTACK_STAGES = [
  { id: 1, label: 'Initial Access',       desc: 'Phishing email delivered — credential harvested', time: '09:12', done: true },
  { id: 2, label: 'Execution',            desc: 'PowerShell spawned by explorer.exe', time: '09:13', done: true },
  { id: 3, label: 'Credential Access',    desc: 'LSASS memory dumped — hashes extracted', time: '09:14', done: true },
  { id: 4, label: 'Lateral Movement',     desc: 'RDP from 192.168.1.45 → 3 workstations', time: '09:15', done: false },
  { id: 5, label: 'Privilege Escalation', desc: 'New administrator account created', time: '09:16', done: false },
  { id: 6, label: 'Impact',              desc: '1,247 files encrypted in 8 seconds', time: '09:18', done: false },
]

const SEV_COLORS: Record<string, string> = {
  critical: '#FF4D6D',
  high:     '#F59E0B',
  medium:   '#00E5FF',
  low:      '#10D9A0',
}
const SEV_BG: Record<string, string> = {
  critical: 'rgba(255,77,109,0.08)',
  high:     'rgba(245,158,11,0.08)',
  medium:   'rgba(0,229,255,0.08)',
  low:      'rgba(16,217,160,0.08)',
}

export function SimulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null)
  const [activeRun, setActiveRun] = useState<SimulationRun | null>(null)
  const [riskScore, setRiskScore] = useState(15)
  const [stagesDone, setStagesDone] = useState(0)

  const { data: scenarios = MOCK_SCENARIOS } = useQuery({
    queryKey: ['simulator-scenarios'],
    queryFn: simulatorService.getScenarios,
  })

  const { data: runs = MOCK_RUNS } = useQuery({
    queryKey: ['simulator-runs'],
    queryFn: simulatorService.getRuns,
  })

  const { mutate: runScenario, isPending } = useMutation({
    mutationFn: (scenarioId: string) => simulatorService.runScenario(scenarioId),
    onSuccess: run => setActiveRun(run),
    onError: () => {
      if (selectedScenario) {
        const run: SimulationRun = {
          id: 'mock-run-' + Date.now(),
          scenario_id: selectedScenario.id,
          scenario_name: selectedScenario.name,
          status: 'running',
          events_generated: 0,
          started_at: new Date().toISOString(),
        }
        setActiveRun(run)
        setRiskScore(15)
        setStagesDone(0)

        // Animate stages one by one
        let stage = 0
        const stageInterval = setInterval(() => {
          stage++
          setStagesDone(stage)
          setRiskScore(prev => Math.min(91, prev + 14))
          if (stage >= ATTACK_STAGES.length) {
            clearInterval(stageInterval)
            setTimeout(() => {
              setActiveRun(prev => prev ? { ...prev, status: 'completed', events_generated: 147 } : null)
            }, 1000)
          }
        }, 1500)
      }
    },
  })

  const riskColor = riskScore > 70 ? '#FF4D6D' : riskScore > 40 ? '#F59E0B' : '#10D9A0'

  return (
    <PageContainer>
      {/* Page header */}
      <div>
        <div className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: '#3d566e' }}>Adversary Emulation Engine</div>
        <h1 className="text-xl font-bold font-mono" style={{ color: '#E2E8F0' }}>Attack Simulator</h1>
        <p className="text-[11px] font-mono mt-0.5" style={{ color: '#8FA3BF' }}>Safely simulate real-world attack scenarios to test detection capabilities</p>
      </div>

      {/* Warning banner */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border text-[11px] font-mono" style={{ borderColor: '#FFB040' + '30', background: '#FFB040' + '08' }}>
        <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#FFB040' }} />
        <span className="font-bold uppercase tracking-widest" style={{ color: '#FFB040' }}>Safe Simulation Mode</span>
        <span style={{ color: '#8FA3BF', opacity: 0.7 }} className="ml-1">All events are synthetic and labeled as simulated. No real attacks are performed.</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* ── Scenario selection ── */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-mono font-semibold text-[#3d566e] uppercase tracking-[0.15em]">Attack Scenarios</h3>
            <span className="text-[10px] font-mono text-[#3d566e]">{scenarios.length} scenarios available</span>
          </div>

          {scenarios.map((scenario, i) => {
            const isSelected = selectedScenario?.id === scenario.id
            const Icon = ATTACK_ICONS[scenario.attack_type] ?? Activity
            const sevColor  = SEV_COLORS[scenario.severity] ?? '#8FA3BF'
            const sevBg     = SEV_BG[scenario.severity] ?? 'rgba(143,163,191,0.08)'

            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div
                  onClick={() => setSelectedScenario(isSelected ? null : scenario)}
                  className="relative rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden group"
                  style={{
                    background: isSelected ? sevBg : 'var(--color-surface)',
                    borderColor: isSelected ? sevColor + '50' : 'var(--color-border)',
                    borderTop: isSelected ? `1px solid ${sevColor}80` : '1px solid var(--color-border)',
                  }}
                >
                  {/* Sweep shimmer */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.015] transition-colors" />

                  {/* Background pattern */}
                  <div className="absolute right-0 top-0 bottom-0 w-40 opacity-5" style={{
                    background: `radial-gradient(ellipse at right, ${sevColor}, transparent 70%)`
                  }} />

                  <div className="relative p-4">
                    <div className="flex items-start gap-4">
                      {/* Attack type icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{ background: sevBg, borderColor: sevColor + '30' }}
                      >
                        <Icon style={{ width: 22, height: 22, color: sevColor }} />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-sm font-bold text-[#E2E8F0]">{scenario.name}</h3>
                          <SeverityBadge severity={scenario.severity} />
                        </div>
                        <p className="text-xs text-[#8FA3BF] line-clamp-2 leading-relaxed">{scenario.description}</p>
                        <div className="flex items-center gap-4 flex-wrap text-[10px] font-mono text-[#3d566e]">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />{scenario.estimated_duration}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3" />{(scenario.techniques || []).length} MITRE techniques
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Globe className="w-3 h-3" />{scenario.target_profile}
                          </span>
                        </div>

                        {/* MITRE technique tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(scenario.techniques || []).map(t => (
                            <span
                              key={t}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                              style={{ color: sevColor, background: sevBg, borderColor: sevColor + '25' }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Launch button */}
                      {isSelected && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={e => { e.stopPropagation(); runScenario(scenario.id) }}
                          disabled={isPending}
                          className="flex flex-col items-center gap-1.5 shrink-0 px-4 py-2.5 rounded-xl font-mono font-bold text-[11px] transition-all disabled:opacity-50 relative overflow-hidden cursor-pointer"
                          style={{
                            background: sevColor,
                            color: 'var(--color-bg)',
                            boxShadow: `0 0 20px ${sevColor}50`,
                          }}
                        >
                          {isPending ? (
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                          ) : (
                            <Play style={{ width: 18, height: 18 }} />
                          )}
                          <span>LAUNCH</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Right panel ── */}
        <div className="flex flex-col gap-4">
          {/* Active simulation */}
          <AnimatePresence>
            {activeRun && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{
                    background: activeRun.status === 'running' ? 'rgba(231,90,67,0.04)' : 'rgba(142,221,190,0.04)',
                    borderColor: activeRun.status === 'running' ? 'rgba(231,90,67,0.25)' : 'rgba(142,221,190,0.25)',
                    borderTop: activeRun.status === 'running' ? '1px solid rgba(231,90,67,0.5)' : '1px solid rgba(142,221,190,0.5)',
                  }}
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: activeRun.status === 'running' ? 'rgba(231,90,67,0.15)' : 'rgba(142,221,190,0.15)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Radio style={{ width: 14, height: 14 }} className={activeRun.status === 'running' ? 'text-danger animate-pulse' : 'text-success'} />
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest" style={{ color: activeRun.status === 'running' ? '#E75A43' : '#8EDDBE' }}>
                          {activeRun.status === 'running' ? 'Attack In Progress' : 'Simulation Complete'}
                        </span>
                      </div>
                      {activeRun.status === 'running' && (
                        <div className="text-[10px] font-mono font-bold" style={{ color: riskColor }}>
                          {riskScore}% RISK
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#8FA3BF]">{activeRun.scenario_name}</p>
                  </div>

                  <div className="p-4 flex flex-col gap-4">
                    {/* Risk progress bar */}
                    {activeRun.status === 'running' && (
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-[#3d566e] mb-1.5">
                          <span>Risk Score</span>
                          <span style={{ color: riskColor }}>{riskScore}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-border overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            animate={{ width: `${riskScore}%` }}
                            transition={{ duration: 0.5 }}
                            style={{ background: riskColor, boxShadow: `0 0 8px ${riskColor}` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Attack stages */}
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-mono text-[#3d566e] uppercase tracking-widest">Attack Stages</div>
                      {ATTACK_STAGES.map((stage, idx) => {
                        const isDone = idx < stagesDone
                        const isActive = idx === stagesDone && activeRun.status === 'running'
                        return (
                          <motion.div
                            key={stage.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isDone || isActive ? 1 : 0.3 }}
                            className="flex items-start gap-2.5"
                          >
                            <div
                              className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5"
                              style={{
                                borderColor: isDone ? '#8EDDBE' : isActive ? '#E75A43' : 'var(--color-border)',
                                background: isDone ? 'rgba(142,221,190,0.15)' : isActive ? 'rgba(231,90,67,0.15)' : 'transparent',
                              }}
                            >
                              {isDone ? (
                                <CheckCircle style={{ width: 12, height: 12, color: '#8EDDBE' }} />
                              ) : isActive ? (
                                <Activity style={{ width: 10, height: 10, color: '#E75A43' }} className="animate-pulse" />
                              ) : (
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-border)', display: 'block' }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold" style={{ color: isDone ? '#8EDDBE' : isActive ? '#E75A43' : '#3d566e' }}>
                                  {stage.label}
                                </span>
                                <span className="text-[9px] font-mono text-[#3d566e]">{stage.time}</span>
                              </div>
                              {(isDone || isActive) && (
                                <p className="text-[10px] text-[#8FA3BF] mt-0.5 font-mono leading-relaxed">{stage.desc}</p>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Completed result */}
                    {activeRun.status === 'completed' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-success/20 bg-success/5 p-3 flex flex-col gap-2"
                      >
                        <div className="text-[10px] font-mono font-bold text-success uppercase tracking-widest mb-2">
                          ✓ Attack Prevented
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="rounded-lg bg-surface border border-border p-2">
                            <div className="text-lg font-black text-success font-mono">₹2.8Cr</div>
                            <div className="text-[9px] font-mono text-[#3d566e] uppercase">Damage Prevented</div>
                          </div>
                          <div className="rounded-lg bg-surface border border-border p-2">
                            <div className="text-lg font-black text-primary font-mono">34s</div>
                            <div className="text-[9px] font-mono text-[#3d566e] uppercase">Time to Detect</div>
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-[#3d566e]">Events generated</span>
                          <span className="text-[#E2E8F0]">{activeRun.events_generated}</span>
                        </div>
                        {activeRun.incident_id && (
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-[#3d566e]">Incident ID</span>
                            <span className="text-primary">{activeRun.incident_id}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Digital Twin Controls */}
          <div className="rounded-xl bg-surface border border-border overflow-hidden p-4" style={{ borderTop: '2px solid var(--color-accent)' }}>
            <TwinControls onScenarioStart={run => setActiveRun(run)} />
          </div>

          {/* Previous runs */}
          <div className="rounded-xl bg-surface border border-border overflow-hidden" style={{ borderTop: '1px solid rgba(142,221,190,0.2)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <CheckCircle style={{ width: 14, height: 14 }} className="text-success" />
              <span className="text-sm font-semibold text-[#E2E8F0]">Previous Runs</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {runs.map(run => (
                <div key={run.id} className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#E2E8F0] truncate">{run.scenario_name}</p>
                    <p className="text-[10px] font-mono text-[#3d566e] mt-0.5">{run.events_generated} events · {run.incident_id}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    run.status === 'completed'
                      ? 'text-success bg-success/8 border-success/20'
                      : 'text-warning bg-warning/8 border-warning/20'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: run.status === 'completed' ? '#8EDDBE' : '#FFB040' }} />
                    {run.status.toUpperCase()}
                  </div>
                </div>
              ))}
              {runs.length === 0 && (
                <p className="text-xs font-mono text-[#3d566e] text-center py-4">No previous runs</p>
              )}
            </div>
          </div>

          {/* Info card */}
          <div className="rounded-xl bg-surface border border-border p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Lock style={{ width: 13, height: 13 }} className="text-primary" />
              <span className="text-[10px] font-mono text-[#3d566e] uppercase tracking-widest">Safe Mode Active</span>
            </div>
            <p className="text-[11px] text-[#8FA3BF] leading-relaxed">
              Simulations generate synthetic events only. No real network traffic, malware, or system changes occur.
            </p>
            <div className="text-[10px] font-mono text-[#3d566e]">
              Data tagged: <span className="text-warning">SIMULATION=TRUE</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
