import { motion } from 'framer-motion'
import { Shield, TrendingUp } from 'lucide-react'

interface RiskMeterProps {
  score: number
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
}

const riskConfig = {
  critical: { label: 'Critical Risk', color: '#FF4D6D', glow: 'rgba(255,77,109,0.5)', bg: 'rgba(255,77,109,0.08)' },
  high:     { label: 'High Risk',     color: '#F97316', glow: 'rgba(249,115,22,0.5)',  bg: 'rgba(249,115,22,0.08)'  },
  medium:   { label: 'Medium Risk',   color: '#F59E0B', glow: 'rgba(245,158,11,0.5)',  bg: 'rgba(245,158,11,0.08)'  },
  low:      { label: 'Low Risk',      color: '#10D9A0', glow: 'rgba(16,217,160,0.5)',  bg: 'rgba(16,217,160,0.08)'  },
}

export function RiskMeter({ score, riskLevel }: RiskMeterProps) {
  const config = riskConfig[riskLevel]
  const circumference = 2 * Math.PI * 52
  const dashOffset = circumference * (1 - score / 100)

  return (
    <div className="rounded-xl bg-[#071022] border border-[#162030] overflow-hidden h-full" style={{ borderTop: '1px solid rgba(0,229,255,0.2)' }}>
      <div className="flex flex-col gap-1 p-5 pb-0">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-semibold text-[#E2E8F0]">Security Score</h3>
        </div>
      </div>
      <div className="p-5 pt-4">
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Orbital gauge */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Glow background */}
            <motion.div
              className="absolute w-32 h-32 rounded-full"
              animate={{ boxShadow: [`0 0 20px ${config.glow}`, `0 0 50px ${config.glow}`, `0 0 20px ${config.glow}`] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ background: config.bg }}
            />

            {/* Orbital rings */}
            <div className="absolute w-44 h-44 rounded-full border border-[#162030] orbit" style={{ animationDuration: '20s' }} />
            <div className="absolute w-36 h-36 rounded-full border border-[#243650]/60 orbit-reverse" style={{ animationDuration: '15s' }} />

            {/* Moving dot on orbit */}
            <div className="absolute w-44 h-44 orbit" style={{ animationDuration: '8s' }}>
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                style={{ background: config.color, boxShadow: `0 0 10px ${config.glow}` }}
              />
            </div>

            {/* SVG gauge */}
            <svg className="absolute w-40 h-40 -rotate-90" viewBox="0 0 120 120">
              {/* Track */}
              <circle cx="60" cy="60" r="52" fill="none" stroke="#162030" strokeWidth="8" />
              {/* Score arc */}
              <motion.circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke={config.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                style={{ filter: `drop-shadow(0 0 8px ${config.glow})` }}
              />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-4xl font-black tabular-nums"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                style={{ color: config.color }}
              >
                {score}
              </motion.span>
              <span className="text-[10px] text-[#3d566e] font-mono uppercase tracking-widest">/ 100</span>
            </div>
          </div>

          {/* Risk label */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
              style={{
                background: config.bg,
                borderColor: config.color + '40',
                color: config.color,
              }}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-sm font-bold">{config.label}</span>
            </motion.div>
            <p className="text-xs text-[#3d566e] mt-2 font-mono">Based on active incidents & anomalies</p>
          </div>

          {/* Risk scale bars */}
          <div className="w-full mt-1 space-y-2">
            <div className="text-[10px] font-mono text-[#3d566e] uppercase tracking-widest mb-2">Risk Breakdown</div>
            {(['critical', 'high', 'medium', 'low'] as const).map(level => {
              const isActive = level === riskLevel
              const levelConfig = riskConfig[level]
              const barWidth = isActive ? `${score}%` : level === 'critical' ? '15%' : level === 'high' ? '35%' : level === 'medium' ? '60%' : '80%'
              return (
                <div key={level} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: levelConfig.color, boxShadow: isActive ? `0 0 6px ${levelConfig.color}` : undefined }} />
                  <div className="flex-1 h-1.5 rounded-full bg-[#162030] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: barWidth }}
                      transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      style={{
                        background: isActive ? levelConfig.color : levelConfig.color + '40',
                        boxShadow: isActive ? `0 0 4px ${levelConfig.color}` : undefined,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[#3d566e] w-14 text-right capitalize font-mono">{level}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
