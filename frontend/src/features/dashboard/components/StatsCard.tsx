import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color?: 'primary' | 'danger' | 'warning' | 'success'
  delay?: number
}

function useCounter(target: number, duration = 1200, delay = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf: number
    const start = performance.now() + delay
    const tick = (now: number) => {
      const elapsed = Math.max(0, now - start)
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(target * ease))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, delay])
  return val
}

export function StatsCard({
  title, value, change, changeLabel, icon, color = 'primary', delay = 0,
}: StatsCardProps) {
  const colorMap = {
    primary: {
      icon:   'text-[#00E5FF]',
      bg:     'bg-[#00E5FF]/10',
      border: 'border-[#00E5FF]/20',
      glow:   'rgba(0,229,255,0.25)',
      top:    '#00E5FF',
    },
    danger: {
      icon:   'text-[#FF4D6D]',
      bg:     'bg-[#FF4D6D]/10',
      border: 'border-[#FF4D6D]/20',
      glow:   'rgba(255,77,109,0.25)',
      top:    '#FF4D6D',
    },
    warning: {
      icon:   'text-[#F59E0B]',
      bg:     'bg-[#F59E0B]/10',
      border: 'border-[#F59E0B]/20',
      glow:   'rgba(245,158,11,0.25)',
      top:    '#F59E0B',
    },
    success: {
      icon:   'text-[#10D9A0]',
      bg:     'bg-[#10D9A0]/10',
      border: 'border-[#10D9A0]/20',
      glow:   'rgba(16,217,160,0.25)',
      top:    '#10D9A0',
    },
  }[color]

  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  // Animate numeric values
  const numericRaw = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value
  const isNumeric  = !isNaN(numericRaw as number)
  const suffix     = typeof value === 'string' ? value.replace(/[0-9.,]/g, '') : ''
  const animated   = useCounter(isNumeric ? (numericRaw as number) : 0, 1200, delay * 1000)
  const displayVal = isNumeric
    ? animated.toLocaleString() + suffix
    : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className="relative rounded-xl bg-[#071022] border border-[#162030] p-5 overflow-hidden group transition-all duration-300 hover:border-[#243650] cursor-default sweep-hover"
        style={{ borderTop: `1px solid ${colorMap.top}50` }}
      >
        {/* Corner glow */}
        <div
          className="absolute top-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"
          style={{ background: colorMap.top }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            {/* Icon with hex background */}
            <div className={cn('relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colorMap.bg, 'border', colorMap.border)}>
              {/* Pulsing glow behind icon */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-md"
                style={{ background: colorMap.glow }}
              />
              <span className={cn('relative z-10', colorMap.icon)} style={{ display: 'flex', width: 16, height: 16 }}>
                {icon}
              </span>
            </div>

            {/* Change badge */}
            {change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border',
                isPositive
                  ? 'text-[#FF4D6D] bg-[#FF4D6D]/8 border-[#FF4D6D]/20'
                  : isNegative
                  ? 'text-[#10D9A0] bg-[#10D9A0]/8 border-[#10D9A0]/20'
                  : 'text-[#3d566e] bg-[#162030] border-[#162030]'
              )}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {Math.abs(change)}%
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <div className="text-2xl font-black text-[#E2E8F0] tracking-tight tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {displayVal}
            </div>
            <div className="text-xs font-semibold text-[#8FA3BF]">{title}</div>
            {changeLabel && <div className="text-[10px] text-[#3d566e] font-mono">{changeLabel}</div>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
