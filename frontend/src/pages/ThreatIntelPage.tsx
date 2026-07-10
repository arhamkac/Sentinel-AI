import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Globe, Hash, Link, Mail, AlertTriangle, Zap } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { formatDate } from '@/lib/utils'
import type { ThreatIndicator } from '@/types'

const PRIMARY = '#00D9B4'
const WARN    = '#FFB040'
const DANGER  = '#E75A43'
const DIM     = '#3d566e'
const MUTED   = '#8FA3BF'
const BRIGHT  = '#E2E8F0'
const SURFACE = '#071022'
const BORDER  = '#162030'

const MOCK_INDICATORS: ThreatIndicator[] = [
  { id:'1', type:'ip',     value:'185.220.101.47',                           severity:'critical', confidence:0.98, tags:['TOR exit node','C2','Ransomware'],         source:'Threat Intel Feed', description:'Known Tor exit node used by ransomware groups for C2 communications.', first_seen:'2024-01-15T10:00:00Z', last_seen: new Date().toISOString() },
  { id:'2', type:'domain', value:'update-microsoft-secure[.]com',             severity:'high',     confidence:0.94, tags:['Phishing','Typosquatting','Initial Access'], source:'VirusTotal',        description:'Typosquatting domain mimicking Microsoft update service.', first_seen:'2024-03-22T08:00:00Z', last_seen: new Date().toISOString() },
  { id:'3', type:'hash',   value:'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',         severity:'high',     confidence:0.89, tags:['Malware','Dropper','LockBit'],                  source:'CrowdStrike',       description:'SHA256 hash of LockBit 3.0 dropper binary.', first_seen:'2024-02-10T14:00:00Z', last_seen: new Date(Date.now() - 86400000).toISOString() },
  { id:'4', type:'url',    value:'https://dl.dropboxusercontent.com/s/payload', severity:'medium',   confidence:0.72, tags:['Payload delivery','Dropbox abuse'],          source:'URLhaus',           description:'Malicious payload hosted on compromised Dropbox link.', first_seen:'2024-04-01T09:00:00Z', last_seen: new Date(Date.now() - 3600000).toISOString() },
  { id:'5', type:'cve',    value:'CVE-2024-21762',                            severity:'critical', confidence:1.0,  tags:['FortiOS','RCE','Zero-day'],                    source:'NVD',               description:'Critical authentication bypass vulnerability in FortiOS. CVSS 9.8. Actively exploited.', first_seen:'2024-02-08T00:00:00Z', last_seen: new Date().toISOString() },
]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  ip:     <Globe className="w-3.5 h-3.5" />,
  domain: <Link  className="w-3.5 h-3.5" />,
  hash:   <Hash  className="w-3.5 h-3.5" />,
  url:    <Link  className="w-3.5 h-3.5" />,
  email:  <Mail  className="w-3.5 h-3.5" />,
  cve:    <AlertTriangle className="w-3.5 h-3.5" />,
}

function severityColor(s: string) {
  return s === 'critical' ? DANGER : s === 'high' ? WARN : s === 'medium' ? '#7C3AED' : DIM
}

export function ThreatIntelPage() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const filtered = MOCK_INDICATORS.filter(i =>
    (selectedType === '' || i.type === selectedType) &&
    (search === '' || i.value.toLowerCase().includes(search.toLowerCase()) || i.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  )

  const stats = [
    { label: 'Total IOCs', value: MOCK_INDICATORS.length, color: PRIMARY },
    { label: 'Critical',   value: MOCK_INDICATORS.filter(i => i.severity === 'critical').length, color: DANGER },
    { label: 'IPs',        value: MOCK_INDICATORS.filter(i => i.type === 'ip').length,     color: MUTED },
    { label: 'Domains',    value: MOCK_INDICATORS.filter(i => i.type === 'domain').length,  color: MUTED },
    { label: 'Hashes',     value: MOCK_INDICATORS.filter(i => i.type === 'hash').length,    color: MUTED },
    { label: 'CVEs',       value: MOCK_INDICATORS.filter(i => i.type === 'cve').length,     color: WARN  },
  ]

  return (
    <PageContainer>
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: DIM }}>Threat Intelligence Platform</div>
          <h1 className="text-xl font-bold font-mono" style={{ color: BRIGHT }}>Threat Intel Feed</h1>
          <p className="text-[11px] font-mono mt-0.5" style={{ color: MUTED }}>Known threat indicators and adversary infrastructure</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap style={{ width: 12, height: 12, color: DANGER }} />
          <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: MUTED }}>Live Feed Active</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="px-4 py-3 rounded-2xl border text-center" style={{ background: SURFACE, borderColor: BORDER }}>
            <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[9px] font-mono uppercase tracking-wider mt-0.5" style={{ color: DIM }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl border" style={{ background: SURFACE, borderColor: BORDER }}>
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Search style={{ width: 13, height: 13, color: DIM }} />
          <input
            className="bg-transparent flex-1 text-[11px] font-mono outline-none"
            style={{ color: BRIGHT }}
            placeholder="Search IOCs, tags, values..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['', 'ip', 'domain', 'hash', 'url', 'cve'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer"
              style={{
                background: selectedType === t ? PRIMARY + '15' : 'transparent',
                borderColor: selectedType === t ? PRIMARY + '50' : BORDER,
                color: selectedType === t ? PRIMARY : MUTED,
              }}
            >
              {t || 'ALL'}
            </button>
          ))}
        </div>
      </div>

      {/* Indicator list */}
      <div className="space-y-3">
        {filtered.map((ind, i) => (
          <motion.div key={ind.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <div className="flex items-start gap-4 px-5 py-4 rounded-2xl border"
              style={{ background: SURFACE, borderColor: BORDER, borderLeftWidth: 2, borderLeftColor: severityColor(ind.severity) }}>

              {/* Type icon */}
              <div className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                style={{ background: '#040d1a', borderColor: BORDER, color: MUTED }}>
                {TYPE_ICONS[ind.type]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <code className="text-[12px] font-mono break-all" style={{ color: PRIMARY }}>{ind.value}</code>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded border font-bold uppercase"
                      style={{ color: severityColor(ind.severity), borderColor: severityColor(ind.severity) + '40', background: severityColor(ind.severity) + '12' }}>
                      {ind.severity}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded border uppercase"
                      style={{ color: MUTED, borderColor: BORDER }}>
                      {ind.type}
                    </span>
                  </div>
                </div>
                {ind.description && <p className="text-[11px] mb-2" style={{ color: MUTED }}>{ind.description}</p>}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {ind.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded border"
                      style={{ borderColor: BORDER, color: MUTED }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono" style={{ color: DIM }}>
                  <span>SOURCE: <span style={{ color: MUTED }}>{ind.source}</span></span>
                  <span>CONFIDENCE: <span style={{ color: PRIMARY }}>{Math.round(ind.confidence * 100)}%</span></span>
                  <span className="ml-auto">LAST SEEN: <span style={{ color: MUTED }}>{formatDate(ind.last_seen, 'short')}</span></span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  )
}
