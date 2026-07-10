import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Sparkles, Clock, AlertTriangle } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { formatDate } from '@/lib/utils'

const PRIMARY = '#00D9B4'
const WARN    = '#FFB040'
const DANGER  = '#E75A43'
const DIM     = '#3d566e'
const MUTED   = '#8FA3BF'
const BRIGHT  = '#E2E8F0'
const SURFACE = '#071022'
const BORDER  = '#162030'

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

function severityColor(s: string) {
  return s === 'critical' ? DANGER : s === 'high' ? WARN : s === 'medium' ? '#7C3AED' : DIM
}

export function ReportsPage() {
  const [selected, setSelected] = useState(MOCK_REPORTS[0])

  return (
    <PageContainer>
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: DIM }}>Intelligence Reporting Suite</div>
          <h1 className="text-xl font-bold font-mono" style={{ color: BRIGHT }}>Incident Reports</h1>
          <p className="text-[11px] font-mono mt-0.5" style={{ color: MUTED }}>AI-generated executive summaries and technical incident reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-widest transition-all hover:brightness-110"
          style={{ borderColor: PRIMARY + '40', background: PRIMARY + '10', color: PRIMARY }}>
          <Sparkles className="w-3.5 h-3.5" />
          Generate New
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Report list */}
        <div className="space-y-3">
          <div className="text-[9px] font-mono uppercase tracking-widest px-1" style={{ color: DIM }}>Generated Reports</div>
          {MOCK_REPORTS.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div
                className="px-4 py-3.5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden"
                style={{
                  background: selected.id === r.id ? severityColor(r.severity) + '08' : SURFACE,
                  borderColor: selected.id === r.id ? severityColor(r.severity) + '50' : BORDER,
                  borderLeftWidth: 2,
                  borderLeftColor: severityColor(r.severity),
                }}
                onClick={() => setSelected(r)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[12px] font-bold font-mono leading-snug" style={{ color: BRIGHT }}>{r.title}</p>
                  <FileText style={{ width: 14, height: 14, color: DIM, flexShrink: 0 }} />
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border font-bold uppercase"
                    style={{ color: severityColor(r.severity), borderColor: severityColor(r.severity) + '40', background: severityColor(r.severity) + '10' }}>
                    {r.severity}
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: DIM }}>{r.pages} pages</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono" style={{ color: DIM }}>
                  <Clock style={{ width: 10, height: 10 }} />
                  {formatDate(r.generated_at, 'full')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Report viewer */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl border overflow-hidden" style={{ background: SURFACE, borderColor: BORDER }}>
            {/* Viewer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-2 min-w-0">
                <FileText style={{ width: 15, height: 15, color: PRIMARY, flexShrink: 0 }} />
                <span className="text-[13px] font-bold font-mono truncate" style={{ color: BRIGHT }}>{selected.title}</span>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold uppercase shrink-0 transition-all hover:brightness-110"
                style={{ borderColor: BORDER, color: MUTED }}>
                <Download style={{ width: 11, height: 11 }} />
                Export PDF
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Meta */}
              <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: BORDER }}>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded border font-bold uppercase"
                  style={{ color: severityColor(selected.severity), borderColor: severityColor(selected.severity) + '40', background: severityColor(selected.severity) + '10' }}>
                  {selected.severity}
                </span>
                <span className="text-[9px] font-mono" style={{ color: DIM }}>
                  <Clock style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />
                  {formatDate(selected.generated_at, 'full')}
                </span>
                <span className="text-[9px] font-mono" style={{ color: DIM }}>{selected.pages} pages</span>
              </div>

              {/* Executive Summary */}
              <section>
                <h2 className="text-[11px] font-bold font-mono uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: BRIGHT }}>
                  <AlertTriangle style={{ width: 13, height: 13, color: DANGER }} />
                  Executive Summary
                </h2>
                <p className="text-[12px] leading-relaxed" style={{ color: MUTED }}>{selected.executive_summary}</p>
              </section>

              {/* Business Impact */}
              <section>
                <h2 className="text-[11px] font-bold font-mono uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: BRIGHT }}>
                  <AlertTriangle style={{ width: 13, height: 13, color: WARN }} />
                  Business Impact
                </h2>
                <ul className="space-y-2">
                  {[
                    'Domain controller DC-01 targeted — critical risk to entire AD infrastructure',
                    'Potential access to 847 user accounts and all domain-joined systems',
                    'Business operations at risk of 24-72 hour disruption if ransomware had deployed',
                    'Estimated recovery cost avoided: ~$2.4M based on similar incidents',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color: MUTED }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: PRIMARY }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Recommendations */}
              <section>
                <h2 className="text-[11px] font-bold font-mono uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: BRIGHT }}>
                  <Sparkles style={{ width: 13, height: 13, color: PRIMARY }} />
                  Recommended Actions
                </h2>
                <ul className="space-y-2">
                  {[
                    'Reset all compromised credentials immediately (john.doe, admin, svc_backup)',
                    'Enable Windows Credential Guard on all domain controllers',
                    'Deploy EDR solution with behavior-based detection across all endpoints',
                    'Implement privileged access workstations (PAW) for admin accounts',
                    'Conduct mandatory phishing awareness training for all employees',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color: MUTED }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: PRIMARY }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
