import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Zap, Globe, Hash, Link, Mail, AlertTriangle } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Badge, SeverityBadge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { ThreatIndicator } from '@/types'

const MOCK_INDICATORS: ThreatIndicator[] = [
  { id:'1', type:'ip', value:'185.220.101.47', severity:'critical', confidence:0.98, tags:['TOR exit node','C2','Ransomware'], source:'Threat Intel Feed', description:'Known Tor exit node used by ransomware groups for C2 communications.', first_seen:'2024-01-15T10:00:00Z', last_seen: new Date().toISOString() },
  { id:'2', type:'domain', value:'update-microsoft-secure[.]com', severity:'high', confidence:0.94, tags:['Phishing','Typosquatting','Initial Access'], source:'VirusTotal', description:'Typosquatting domain mimicking Microsoft update service. Used in phishing campaigns.', first_seen:'2024-03-22T08:00:00Z', last_seen: new Date().toISOString() },
  { id:'3', type:'hash', value:'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', severity:'high', confidence:0.89, tags:['Malware','Dropper','LockBit'], source:'CrowdStrike', description:'SHA256 hash of LockBit 3.0 dropper binary.', first_seen:'2024-02-10T14:00:00Z', last_seen: new Date(Date.now() - 86400000).toISOString() },
  { id:'4', type:'url', value:'https://dl.dropboxusercontent.com/s/malicious_payload', severity:'medium', confidence:0.72, tags:['Payload delivery','Dropbox abuse'], source:'URLhaus', description:'Malicious payload hosted on compromised Dropbox link.', first_seen:'2024-04-01T09:00:00Z', last_seen: new Date(Date.now() - 3600000).toISOString() },
  { id:'5', type:'cve', value:'CVE-2024-21762', severity:'critical', confidence:1.0, tags:['FortiOS','RCE','Zero-day'], source:'NVD', description:'Critical authentication bypass vulnerability in FortiOS. CVSS 9.8. Actively exploited in the wild.', first_seen:'2024-02-08T00:00:00Z', last_seen: new Date().toISOString() },
]

const typeIcons: Record<string, React.ReactNode> = {
  ip:     <Globe className="w-3.5 h-3.5" />,
  domain: <Link className="w-3.5 h-3.5" />,
  hash:   <Hash className="w-3.5 h-3.5" />,
  url:    <Link className="w-3.5 h-3.5" />,
  email:  <Mail className="w-3.5 h-3.5" />,
  cve:    <AlertTriangle className="w-3.5 h-3.5" />,
}

export function ThreatIntelPage() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const filtered = MOCK_INDICATORS.filter(i =>
    (selectedType === '' || i.type === selectedType) &&
    (search === '' || i.value.toLowerCase().includes(search.toLowerCase()) || i.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  )

  return (
    <PageContainer title="Threat Intelligence" description="Known threat indicators and adversary infrastructure">
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search IOCs, tags, values…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {['', 'ip', 'domain', 'hash', 'url', 'cve'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors uppercase cursor-pointer ${
                selectedType === t
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border text-[#3d566e] hover:border-border-2 hover:text-[#8FA3BF]'
              }`}
            >
              {t || 'ALL'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((indicator, i) => (
          <motion.div
            key={indicator.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card hover>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {/* Type icon */}
                  <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-[#3d566e] shrink-0">
                    {typeIcons[indicator.type]}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-4">
                      <code className="text-sm font-mono text-primary break-all">{indicator.value}</code>
                      <div className="flex items-center gap-2 shrink-0">
                        <SeverityBadge severity={indicator.severity} />
                        <Badge variant="muted" className="text-[10px] uppercase">{indicator.type}</Badge>
                      </div>
                    </div>
                    {indicator.description && (
                      <p className="text-xs text-[#3d566e] leading-relaxed">{indicator.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {indicator.tags.map(tag => (
                        <Badge key={tag} variant="default" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-[#3d566e] font-mono">
                      <span>Source: <span className="text-[#8FA3BF]">{indicator.source}</span></span>
                      <span>Confidence: <span className="text-[#8FA3BF]">{Math.round(indicator.confidence * 100)}%</span></span>
                      <span>Last seen: <span className="text-[#8FA3BF]">{formatDate(indicator.last_seen, 'short')}</span></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total IOCs',    value: MOCK_INDICATORS.length, color: '#8EDDBE' },
          { label: 'Critical',      value: MOCK_INDICATORS.filter(i => i.severity === 'critical').length, color: '#E75A43' },
          { label: 'IPs',           value: MOCK_INDICATORS.filter(i => i.type === 'ip').length, color: '#8FA3BF' },
          { label: 'Domains',       value: MOCK_INDICATORS.filter(i => i.type === 'domain').length, color: '#8FA3BF' },
          { label: 'Hashes',        value: MOCK_INDICATORS.filter(i => i.type === 'hash').length, color: '#8FA3BF' },
          { label: 'CVEs',          value: MOCK_INDICATORS.filter(i => i.type === 'cve').length, color: '#FFB040' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="py-3 text-center">
              <div className="text-xl font-bold font-mono" style={{ color }}>{value}</div>
              <div className="text-[11px] text-[#3d566e]">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
