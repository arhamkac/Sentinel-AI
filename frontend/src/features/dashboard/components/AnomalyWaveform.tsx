/**
 * AnomalyWaveform — Task B4
 * SVG sine-wave visualizer: baseline (flat) vs observed (dynamic amplitude).
 * Wave amplitude and color scale with anomaly/risk score.
 */
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface AnomalyWaveformProps {
  /** 0.0 → 1.0  risk level */
  riskScore: number
  /** Optional event rate (events/min) to scale frequency */
  eventRate?: number
  height?: number
  label?: string
}

const W = 520
const H = 100
const BASELINE_Y = H / 2

function buildWavePath(score: number, t: number, eventRate: number): string {
  const amp    = Math.max(4, score * (H * 0.45))      // amplitude scales with risk
  const freq   = 0.018 + (eventRate / 1000) * 0.012   // frequency scales with event rate
  const phase  = t * 0.04
  const points: string[] = []

  for (let x = 0; x <= W; x += 2) {
    const noise  = Math.sin(x * freq * 3.1 + phase * 1.7) * amp * 0.25
    const y      = BASELINE_Y + Math.sin(x * freq + phase) * amp + noise
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return 'M' + points.join(' L')
}

function buildBaselinePath(): string {
  return `M0,${BASELINE_Y} L${W},${BASELINE_Y}`
}

function riskColor(score: number): string {
  if (score > 0.75) return 'var(--danger)'
  if (score > 0.40) return 'var(--warn)'
  return 'var(--accent)'
}

function riskLabel(score: number): string {
  if (score > 0.75) return 'HIGH RISK'
  if (score > 0.40) return 'ELEVATED'
  return 'NOMINAL'
}

export function AnomalyWaveform({
  riskScore,
  eventRate = 30,
  height = 120,
  label = 'Anomaly Waveform',
}: AnomalyWaveformProps) {
  const pathRef      = useRef<SVGPathElement>(null)
  const fillRef      = useRef<SVGPathElement>(null)
  const frameRef     = useRef<number>(0)
  const tickRef      = useRef<number>(0)
  const scoreRef     = useRef(riskScore)
  const rateRef      = useRef(eventRate)

  useEffect(() => {
    scoreRef.current = riskScore
    rateRef.current  = eventRate
  }, [riskScore, eventRate])

  useEffect(() => {
    const animate = () => {
      tickRef.current += 1
      const path = buildWavePath(scoreRef.current, tickRef.current, rateRef.current)
      const fillPath = path + ` L${W},${BASELINE_Y} L0,${BASELINE_Y} Z`

      if (pathRef.current) pathRef.current.setAttribute('d', path)
      if (fillRef.current) fillRef.current.setAttribute('d', fillPath)

      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  const color    = riskColor(riskScore)
  const rlabel   = riskLabel(riskScore)
  const pct      = Math.round(riskScore * 100)

  return (
    <div
      style={{
        background   : 'var(--bg-inset)',
        border       : `1px solid ${color}22`,
        borderTop    : `2px solid ${color}`,
        borderRadius : 'var(--r-lg)',
        padding      : '16px 20px',
        position     : 'relative',
        overflow     : 'hidden',
        height,
      }}
    >
      {/* Grid bg */}
      <div
        aria-hidden
        style={{
          position       : 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: [`linear-gradient(${color}08 1px,transparent 1px)`,
                            `linear-gradient(90deg,${color}08 1px,transparent 1px)`].join(','),
          backgroundSize : '28px 28px',
          opacity        : 0.6,
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--tx-low)' }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color, letterSpacing: '0.12em' }}>{rlabel}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color }}>{pct}%</span>
        </div>
      </div>

      {/* SVG waveform */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 28, zIndex: 0 }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Baseline */}
          <path
            d={buildBaselinePath()}
            stroke={color}
            strokeWidth={0.5}
            strokeDasharray="6 8"
            fill="none"
            opacity={0.25}
          />

          {/* Fill under wave */}
          <path ref={fillRef} fill="url(#wave-fill)" opacity={riskScore > 0.7 ? 0.85 : 0.6} />

          {/* Observed wave */}
          <path
            ref={pathRef}
            fill="none"
            stroke={color}
            strokeWidth={riskScore > 0.7 ? 2.0 : 1.5}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 ${Math.round(riskScore * 8)}px ${color})` }}
          />
        </svg>
      </div>

      {/* Risk bar at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--bd-hairline)' }}>
        <motion.div
          style={{ height: '100%', background: color, boxShadow: `0 0 6px ${color}` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
