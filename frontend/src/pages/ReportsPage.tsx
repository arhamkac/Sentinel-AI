import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Sparkles, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'

const MOCK_REPORTS = [
  {
    id: '1', incident_id: '1',
    title: 'Ransomware Deployment Attempt — Executive Summary',
    executive_summary: 'On July 7, 2026, a critical ransomware attack was detected targeting domain controller DC-01. The attacker gained initial access via phishing and proceeded through credential dumping and lateral movement before being detected prior to ransomware execution. The incident has been contained and recovery procedures are underway.',
    generated_at: new Date(Date.now() - 3600000).toISOString(),
    severity: 'critical' as const, status: 'investigating' as const, pages: 8,
  },
  {
    id: '2', incident_id: '2',
    title: 'Lateral Movement Campaign — Technical Report',
    executive_summary: 'A series of unusual RDP connections were detected between workstations, indicating an attacker performing lateral movement using compromised credentials. The campaign affected 3 workstations before being contained.',
    generated_at: new Date(Date.now() - 86400000).toISOString(),
    severity: 'high' as const, status: 'contained' as const, pages: 12,
  },
]

export function ReportsPage() {
  const [selected, setSelected] = useState(MOCK_REPORTS[0])

  const isCrit = selected.severity === 'critical';
  const isHigh = selected.severity === 'high';
  const sevColor = isCrit ? 'var(--danger)' : isHigh ? 'var(--warning)' : 'var(--primary)';
  const sevBg = isCrit ? 'var(--danger-bg)' : isHigh ? 'var(--warning-bg)' : 'var(--primary-bg)';
  const sevRing = isCrit ? 'var(--danger-ring)' : isHigh ? 'var(--warning-ring)' : 'var(--primary-ring)';

  return (
    <PageContainer className="flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Incident Reports</h1>
          <p className="text-[var(--text-muted)] mt-1">AI-generated executive summaries and technical incident reports.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--primary-ring)] bg-[var(--primary-bg)] text-sm font-medium text-[var(--primary)] hover:brightness-110 transition-colors">
          <Sparkles className="w-4 h-4" />
          Generate New
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* ── Report List (1/3) ── */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Generated Reports</h3>
          
          <div className="flex flex-col gap-3">
            {MOCK_REPORTS.map((r, i) => {
              const rCrit = r.severity === 'critical';
              const rHigh = r.severity === 'high';
              const rColor = rCrit ? 'var(--danger)' : rHigh ? 'var(--warning)' : 'var(--primary)';
              const isSelected = selected.id === r.id;

              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div
                    onClick={() => setSelected(r)}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-[var(--border-strong)] bg-[var(--bg-hover)]' 
                        : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                    }`}
                    style={{ borderLeft: isSelected ? `4px solid ${rColor}` : undefined }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{r.title}</p>
                      <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border"
                        style={{ 
                          color: rColor, 
                          backgroundColor: rCrit ? 'var(--danger-bg)' : rHigh ? 'var(--warning-bg)' : 'var(--primary-bg)', 
                          borderColor: rCrit ? 'var(--danger-ring)' : rHigh ? 'var(--warning-ring)' : 'var(--primary-ring)' 
                        }}
                      >
                        {r.severity}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">{r.pages} pages</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(r.generated_at, 'full')}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Report Viewer (2/3) ── */}
        <div className="xl:col-span-2">
          <Card className="h-full flex flex-col">
            
            {/* Viewer Header */}
            <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-[var(--primary)] shrink-0" />
                <CardTitle className="truncate text-lg">{selected.title}</CardTitle>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-inset)] hover:bg-[var(--bg-hover)] text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] transition-colors shrink-0">
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>
            </CardHeader>

            <CardContent className="flex flex-col gap-8 pt-6">
              
              {/* Meta */}
              <div className="flex items-center gap-4 border-b border-[var(--border)] pb-4">
                <span 
                  className="text-xs uppercase font-bold px-2.5 py-0.5 rounded border"
                  style={{ color: sevColor, backgroundColor: sevBg, borderColor: sevRing }}
                >
                  {selected.severity}
                </span>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatDate(selected.generated_at, 'full')}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{selected.pages} pages</span>
              </div>

              {/* Executive Summary */}
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
                  Executive Summary
                </h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {selected.executive_summary}
                </p>
              </section>

              {/* Business Impact */}
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
                  Business Impact
                </h2>
                <ul className="space-y-3">
                  {[
                    'Domain controller DC-01 targeted — critical risk to entire AD infrastructure',
                    'Potential access to 847 user accounts and all domain-joined systems',
                    'Business operations at risk of 24-72 hour disruption if ransomware had deployed',
                    'Estimated recovery cost avoided: ~$2.4M based on similar incidents',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Recommendations */}
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
                  Recommended Actions
                </h2>
                <ul className="space-y-3">
                  {[
                    'Reset all compromised credentials immediately (john.doe, admin, svc_backup)',
                    'Enable Windows Credential Guard on all domain controllers',
                    'Deploy EDR solution with behavior-based detection across all endpoints',
                    'Implement privileged access workstations (PAW) for admin accounts',
                    'Conduct mandatory phishing awareness training for all employees',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
