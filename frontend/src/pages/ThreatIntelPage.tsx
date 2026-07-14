import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Globe, Hash, Link, Mail, AlertTriangle, Zap, Activity } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import type { ThreatIndicator } from '@/types'

const MOCK_INDICATORS: ThreatIndicator[] = [
  { id:'1', type:'ip',     value:'185.220.101.47',                           severity:'critical', confidence:0.98, tags:['TOR exit node','C2','Ransomware'],         source:'Threat Intel Feed', description:'Known Tor exit node used by ransomware groups for C2 communications.', first_seen:'2024-01-15T10:00:00Z', last_seen: new Date().toISOString() },
  { id:'2', type:'domain', value:'update-microsoft-secure[.]com',             severity:'high',     confidence:0.94, tags:['Phishing','Typosquatting','Initial Access'], source:'VirusTotal',        description:'Typosquatting domain mimicking Microsoft update service.', first_seen:'2024-03-22T08:00:00Z', last_seen: new Date().toISOString() },
  { id:'3', type:'hash',   value:'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',         severity:'high',     confidence:0.89, tags:['Malware','Dropper','LockBit'],                  source:'CrowdStrike',       description:'SHA256 hash of LockBit 3.0 dropper binary.', first_seen:'2024-02-10T14:00:00Z', last_seen: new Date(Date.now() - 86400000).toISOString() },
  { id:'4', type:'url',    value:'https://dl.dropboxusercontent.com/s/payload', severity:'medium',   confidence:0.72, tags:['Payload delivery','Dropbox abuse'],          source:'URLhaus',           description:'Malicious payload hosted on compromised Dropbox link.', first_seen:'2024-04-01T09:00:00Z', last_seen: new Date(Date.now() - 3600000).toISOString() },
  { id:'5', type:'cve',    value:'CVE-2024-21762',                            severity:'critical', confidence:1.0,  tags:['FortiOS','RCE','Zero-day'],                    source:'NVD',               description:'Critical authentication bypass vulnerability in FortiOS. CVSS 9.8. Actively exploited.', first_seen:'2024-02-08T00:00:00Z', last_seen: new Date().toISOString() },
]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  ip:     <Globe className="w-4 h-4" />,
  domain: <Link  className="w-4 h-4" />,
  hash:   <Hash  className="w-4 h-4" />,
  url:    <Link  className="w-4 h-4" />,
  email:  <Mail  className="w-4 h-4" />,
  cve:    <AlertTriangle className="w-4 h-4" />,
}

export function ThreatIntelPage() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const filtered = MOCK_INDICATORS.filter(i =>
    (selectedType === '' || i.type === selectedType) &&
    (search === '' || i.value.toLowerCase().includes(search.toLowerCase()) || i.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  )

  const stats = [
    { label: 'Total IOCs', value: MOCK_INDICATORS.length, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-bg)]', border: 'border-[var(--primary-ring)]' },
    { label: 'Critical',   value: MOCK_INDICATORS.filter(i => i.severity === 'critical').length, color: 'text-[var(--danger)]', bg: 'bg-[var(--danger-bg)]', border: 'border-[var(--danger-ring)]' },
    { label: 'IPs',        value: MOCK_INDICATORS.filter(i => i.type === 'ip').length, color: 'text-[var(--text-primary)]', bg: 'bg-[var(--bg-inset)]', border: 'border-[var(--border)]' },
    { label: 'Domains',    value: MOCK_INDICATORS.filter(i => i.type === 'domain').length, color: 'text-[var(--text-primary)]', bg: 'bg-[var(--bg-inset)]', border: 'border-[var(--border)]' },
    { label: 'Hashes',     value: MOCK_INDICATORS.filter(i => i.type === 'hash').length, color: 'text-[var(--text-primary)]', bg: 'bg-[var(--bg-inset)]', border: 'border-[var(--border)]' },
    { label: 'CVEs',       value: MOCK_INDICATORS.filter(i => i.type === 'cve').length, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-bg)]', border: 'border-[var(--warning-ring)]' },
  ]

  return (
    <PageContainer className="flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Threat Intel Feed</h1>
          <p className="text-[var(--text-muted)] mt-1">Known threat indicators and adversary infrastructure.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--danger-ring)] bg-[var(--danger-bg)]">
          <Zap className="w-4 h-4 text-[var(--danger)]" />
          <span className="text-xs font-bold text-[var(--danger)] uppercase tracking-wider">Live Feed Active</span>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className={`p-4 flex flex-col items-center justify-center text-center`}>
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters ── */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-[var(--border)] bg-[var(--bg-surface)] rounded-t-[var(--radius-lg)]">
          
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-sm px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-inset)] focus-within:border-[var(--primary-dim)] transition-colors">
            <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <input
              className="bg-transparent flex-1 text-sm text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)]"
              placeholder="Search IOCs, tags, values..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Type Pills */}
          <div className="flex flex-wrap gap-2">
            {['', 'ip', 'domain', 'hash', 'url', 'cve'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors border ${
                  selectedType === t 
                    ? 'bg-[var(--primary-bg)] border-[var(--primary-ring)] text-[var(--primary)]' 
                    : 'bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t || 'ALL'}
              </button>
            ))}
          </div>
          
        </div>

        {/* ── Indicator List ── */}
        <div className="divide-y divide-[var(--border)]">
          {filtered.map((ind, i) => {
            const isCrit = ind.severity === 'critical';
            const isHigh = ind.severity === 'high';
            const sevColor = isCrit ? 'var(--danger)' : isHigh ? 'var(--warning)' : 'var(--primary)';
            const sevBg = isCrit ? 'var(--danger-bg)' : isHigh ? 'var(--warning-bg)' : 'var(--primary-bg)';
            const sevRing = isCrit ? 'var(--danger-ring)' : isHigh ? 'var(--warning-ring)' : 'var(--primary-ring)';

            return (
              <motion.div key={ind.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="flex flex-col md:flex-row md:items-start gap-4 p-5 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] transition-colors relative group">
                  
                  {/* Left Border Accent */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: sevColor }}
                  />

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] flex items-center justify-center shrink-0 text-[var(--text-muted)]">
                    {TYPE_ICONS[ind.type] || <Activity className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                      <code className="text-sm font-bold font-mono text-[var(--primary)] break-all">{ind.value}</code>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span 
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                          style={{ color: sevColor, backgroundColor: sevBg, borderColor: sevRing }}
                        >
                          {ind.severity}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-inset)]">
                          {ind.type}
                        </span>
                      </div>
                    </div>
                    
                    {ind.description && (
                      <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">
                        {ind.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {ind.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-inset)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-xs text-[var(--text-muted)] font-mono pt-3 border-t border-[var(--border)]">
                      <span>Source: <span className="text-[var(--text-primary)] font-semibold ml-1">{ind.source}</span></span>
                      <span>Confidence: <span className="text-[var(--primary)] font-semibold ml-1">{Math.round(ind.confidence * 100)}%</span></span>
                      <span className="sm:ml-auto">Last Seen: <span className="text-[var(--text-primary)] ml-1">{formatDate(ind.last_seen, 'short')}</span></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-[var(--text-muted)] text-sm">
              No IOCs found matching your criteria.
            </div>
          )}
        </div>
      </Card>
    </PageContainer>
  )
}
