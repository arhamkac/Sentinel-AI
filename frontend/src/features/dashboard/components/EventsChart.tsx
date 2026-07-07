import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { TrendingUp } from 'lucide-react'

interface EventsChartProps {
  data: { hour: string; count: number }[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#071022] border border-[#162030] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-[#3d566e] mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#00E5FF]">{payload[0].value} events</p>
    </div>
  )
}

export function EventsChart({ data }: EventsChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
          <CardTitle>Events (24h)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="eventsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00E5FF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#162030" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fill: '#3d566e', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fill: '#3d566e', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#162030' }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#00E5FF"
              strokeWidth={2}
              fill="url(#eventsGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#00E5FF', stroke: '#020814', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
