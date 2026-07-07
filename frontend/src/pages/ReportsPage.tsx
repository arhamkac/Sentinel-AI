import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Sparkles, Clock, AlertTriangle } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, SeverityBadge } from '@/components/ui'
import { formatDate } from '@/lib/utils'

const MOCK_REPORTS = [
  {
    id: '1',
    incident_id: '1',
    title: 'Ransomware Deployment Attempt — Executive Summary',
    executive_summary: 'On July 7, 2026, a critical ransomware attack was detected targeting domain controller DC-01. The attacker gained initial access via phishing and proceeded through credential dumping and lateral movement before being detected prior to ransomware execution. The incident has been contained and recovery procedures are underway.',
    generated_at: new Date(Date.now() - 3600000).toISOString(),
    severity: 'critical' as const,
    status: 'investigating' as const,
    pages: 8,
  },
  {
    id: '2',
    incident_id: '2',
    title: 'Lateral Movement Campaign — Technical Report',
    executive_summary: 'A series of unusual RDP connections were detected between workstations, indicating an attacker performing lateral movement using compromised credentials. The campaign affected 3 workstations before being contained.',
    generated_at: new Date(Date.now() - 86400000).toISOString(),
    severity: 'high' as const,
    status: 'contained' as const,
    pages: 12,
  },
]

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(MOCK_REPORTS[0])

  return (
    <PageContainer
      title="Reports"
      description="AI-generated executive summaries and technical incident reports"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Reports list */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#3d566e] uppercase tracking-wider">Generated Reports</h3>
          {MOCK_REPORTS.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                hover
                className={`cursor-pointer ${selectedReport.id === report.id ? 'border-[#00E5FF]/30' : ''}`}
                onClick={() => setSelectedReport(report)}
              >
                <CardContent className="py-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-[#E2E8F0] leading-snug">{report.title}</p>
                      <FileText className="w-4 h-4 text-[#3d566e] shrink-0" />
                    </div>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={report.severity} />
                      <span className="text-[11px] text-[#3d566e]">{report.pages} pages</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#3d566e] font-mono">
                      <Clock className="w-3 h-3" />
                      {formatDate(report.generated_at, 'full')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Button variant="outline" className="w-full" size="sm">
            <Sparkles className="w-4 h-4" />
            Generate New Report
          </Button>
        </div>

        {/* Report viewer */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00E5FF]" />
                  <CardTitle>{selectedReport.title}</CardTitle>
                </div>
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Meta */}
                <div className="flex items-center gap-3 pb-4 border-b border-[#162030]">
                  <SeverityBadge severity={selectedReport.severity} />
                  <Badge variant="default">
                    <Clock className="w-3 h-3" />
                    {formatDate(selectedReport.generated_at, 'full')}
                  </Badge>
                  <Badge variant="default">{selectedReport.pages} pages</Badge>
                </div>

                {/* Executive Summary */}
                <section>
                  <h2 className="text-sm font-semibold text-[#E2E8F0] mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF4D6D]" />
                    Executive Summary
                  </h2>
                  <p className="text-sm text-[#8FA3BF] leading-relaxed">
                    {selectedReport.executive_summary}
                  </p>
                </section>

                {/* Sections */}
                {[
                  {
                    title: 'Business Impact',
                    icon: <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />,
                    content: [
                      'Domain controller DC-01 was targeted, posing critical risk to entire AD infrastructure',
                      'Potential access to 847 user accounts and all domain-joined systems',
                      'Business operations at risk of 24-72 hour disruption if ransomware had deployed',
                      'Estimated recovery cost avoided: ~$2.4M based on similar incidents',
                    ],
                  },
                  {
                    title: 'Recommended Actions',
                    icon: <Sparkles className="w-4 h-4 text-[#00E5FF]" />,
                    content: [
                      'Reset all compromised credentials immediately (john.doe, admin, svc_backup)',
                      'Enable Windows Credential Guard on all domain controllers',
                      'Deploy EDR solution with behavior-based detection across all endpoints',
                      'Implement privileged access workstations (PAW) for admin accounts',
                      'Conduct mandatory phishing awareness training for all employees',
                    ],
                  },
                ].map(({ title, icon, content }) => (
                  <section key={title}>
                    <h2 className="text-sm font-semibold text-[#E2E8F0] mb-3 flex items-center gap-2">
                      {icon}
                      {title}
                    </h2>
                    <ul className="space-y-2">
                      {content.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#8FA3BF]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
