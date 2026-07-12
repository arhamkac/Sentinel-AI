/**
 * TwinControls — Task B9
 * Digital twin simulation launcher with scenario selection and delay slider.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Play, StopCircle, Sliders, Zap, Server, Clock } from 'lucide-react'
import { simulatorService } from '@/services/simulator.service'
import type { SimulationRun } from '@/types'

interface TwinControlsProps {
  onScenarioStart?: (run: SimulationRun) => void
}

const SCENARIOS = [
  {
    id         : 'ransomware',
    label      : 'Ransomware Attack Chain',
    description: 'Spear-phishing → PowerShell dropper → Credential dump → Lateral movement → File encryption',
    icon       : Zap,
    color      : 'var(--danger)',
    steps      : 5,
  },
  {
    id         : 'ot_sabotage',
    label      : 'OT Grid Sabotage',
    description: 'IT compromise → RDP to SCADA → DNP3 command injection → Breaker trip / grid disruption',
    icon       : Server,
    color      : 'var(--warn)',
    steps      : 5,
  },
]

export function TwinControls({ onScenarioStart }: TwinControlsProps) {
  const [selected,  setSelected]  = useState<string>('ransomware')
  const [delayMs,   setDelayMs]   = useState<number>(2000)

  const { data: history } = useQuery({
    queryKey: ['simulator-history'],
    queryFn: () => simulatorService.getHistory(),
    refetchInterval: 5000,
  })

  const { mutate: startSim, isPending } = useMutation({
    mutationFn: () => simulatorService.run({ scenario_id: selected, delay_ms: delayMs }),
    onSuccess: (run) => {
      onScenarioStart?.(run)
    },
  })

  const lastRun    = history?.runs?.[0]
  const isRunning  = lastRun?.status === 'running'
  const scenario   = SCENARIOS.find(s => s.id === selected)!

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--accent-bg)', border: '1px solid var(--accent-ring)',
        }}>
          <Sliders style={{ width: 13, height: 13, color: 'var(--accent)' }} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-high)', lineHeight: 1.2 }}>
            Digital Twin Controls
          </p>
          <p style={{ fontSize: 10, color: 'var(--tx-low)' }}>Red team scenario launcher</p>
        </div>
      </div>

      {/* Scenario selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SCENARIOS.map(sc => {
          const Icon     = sc.icon
          const isActive = selected === sc.id
          return (
            <motion.button
              key={sc.id}
              onClick={() => setSelected(sc.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                padding: '12px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                background: isActive ? `${sc.color}12` : 'var(--bg-inset)',
                border: `1px solid ${isActive ? sc.color + '50' : 'var(--bd-hairline)'}`,
                outline: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${sc.color}18`,
                }}>
                  <Icon style={{ width: 13, height: 13, color: sc.color }} />
                </div>
                <div>
                  <p style={{
                    fontSize: 12, fontWeight: 600,
                    color: isActive ? sc.color : 'var(--tx-high)',
                    fontFamily: 'var(--font-mono)', marginBottom: 4,
                  }}>
                    {sc.label}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--tx-low)', lineHeight: 1.5 }}>
                    {sc.description}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <span style={{
                      fontSize: 9, fontFamily: 'var(--font-mono)',
                      color: sc.color, padding: '2px 7px', borderRadius: 4,
                      background: `${sc.color}15`, border: `1px solid ${sc.color}30`,
                    }}>
                      {sc.steps} steps
                    </span>
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: `2px solid ${isActive ? sc.color : 'var(--bd-strong)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isActive && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.color }} />
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Delay slider */}
      <div style={{
        padding: '14px', borderRadius: 12,
        background: 'var(--bg-inset)', border: '1px solid var(--bd-hairline)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock style={{ width: 12, height: 12, color: 'var(--tx-low)' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--tx-mid)' }}>
              Event Delay
            </span>
          </div>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
            {delayMs >= 1000 ? `${(delayMs / 1000).toFixed(1)}s` : `${delayMs}ms`}
          </span>
        </div>
        <input
          type="range"
          min={200}
          max={10000}
          step={200}
          value={delayMs}
          onChange={e => setDelayMs(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--tx-disabled)' }}>Fast (0.2s)</span>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--tx-disabled)' }}>Realistic (10s)</span>
        </div>
      </div>

      {/* Launch button */}
      <motion.button
        onClick={() => !isRunning && !isPending && startSim()}
        disabled={isRunning || isPending}
        whileHover={{ scale: isRunning ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%', padding: '13px', borderRadius: 12, cursor: isRunning ? 'not-allowed' : 'pointer',
          background: isRunning ? 'var(--bg-inset)' : `${scenario.color}20`,
          border: `1px solid ${isRunning ? 'var(--bd-hairline)' : scenario.color + '50'}`,
          color: isRunning ? 'var(--tx-low)' : scenario.color,
          fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          outline: 'none',
        }}
      >
        {isRunning ? (
          <>
            <StopCircle style={{ width: 16, height: 16 }} />
            Simulation Running...
          </>
        ) : isPending ? (
          'Starting...'
        ) : (
          <>
            <Play style={{ width: 16, height: 16 }} />
            Launch {scenario.label}
          </>
        )}
      </motion.button>

      {/* Last run status */}
      {lastRun && (
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'var(--bg-inset)', border: '1px solid var(--bd-hairline)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--tx-low)' }}>Last run</p>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--tx-high)', marginTop: 2 }}>
              {lastRun.scenario_id}
            </p>
          </div>
          <span style={{
            fontSize: 9, fontFamily: 'var(--font-mono)', padding: '3px 8px', borderRadius: 5,
            color: lastRun.status === 'completed' ? 'var(--success)' : lastRun.status === 'running' ? 'var(--accent)' : 'var(--tx-low)',
            background: lastRun.status === 'completed' ? 'var(--success-bg)' : lastRun.status === 'running' ? 'var(--accent-bg)' : 'transparent',
            border: `1px solid ${lastRun.status === 'completed' ? 'rgba(34,197,94,0.3)' : lastRun.status === 'running' ? 'var(--accent-ring)' : 'var(--bd-hairline)'}`,
          }}>
            {lastRun.status?.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}
