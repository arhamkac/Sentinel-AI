import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, SeverityBadge, StatusBadge, Button } from '@/components/ui'
import { formatRelativeTime, truncate } from '@/lib/utils'
import type { Incident } from '@/types'

interface RecentIncidentsProps {
  incidents: Incident[]
  loading?: boolean
}

export function RecentIncidents({ incidents, loading }: RecentIncidentsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF4D6D]" />
            <CardTitle>Recent Incidents</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/incidents" className="flex items-center gap-1 text-xs text-[#00E5FF]">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-[#0c1828] animate-pulse" />
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#3d566e]">
            <AlertTriangle className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No incidents found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {incidents.slice(0, 5).map((incident, i) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/incidents/${incident.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#0c1828]/50 border border-transparent hover:border-[#162030] transition-colors group"
                >
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#E2E8F0] truncate group-hover:text-[#00E5FF] transition-colors">
                        {truncate(incident.title, 50)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge severity={incident.severity} />
                      <StatusBadge status={incident.status} />
                      <span className="text-xs text-[#3d566e] font-mono">
                        {incident.event_count} events · {formatRelativeTime(incident.created_at)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#3d566e] group-hover:text-[#00E5FF] shrink-0 mt-0.5 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
