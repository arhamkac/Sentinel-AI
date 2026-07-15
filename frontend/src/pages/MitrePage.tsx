import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Shield } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/Card'
import { PageHeader, EmptyState } from '@/components/common'
import { MITRE_TACTICS } from '@/lib/constants'
import type { MitreTechnique } from '@/types'

const MOCK_TECHNIQUES: MitreTechnique[] = [
  { technique_id:'T1566', technique_name:'Phishing',                           tactic:'initial_access',      description:'Adversaries may send phishing messages to gain access to victim systems.',               subtechniques:['T1566.001','T1566.002'], platforms:['Windows','macOS','Linux'], detection:'Monitor email flows and attachment execution.',         mitigation:'User training, email filtering' },
  { technique_id:'T1059', technique_name:'Command and Scripting Interpreter',   tactic:'execution',           description:'Adversaries may abuse command and script interpreters to execute commands.',             subtechniques:['T1059.001','T1059.003'], platforms:['Windows','macOS','Linux'], detection:'Monitor process creation for interpreters.',             mitigation:'Code signing, application control' },
  { technique_id:'T1053', technique_name:'Scheduled Task/Job',                  tactic:'persistence',         description:'Adversaries may abuse task scheduling to facilitate recurring execution.',                subtechniques:['T1053.005'],             platforms:['Windows'],               detection:'Monitor scheduled task creation.',                      mitigation:'Audit, user account management' },
  { technique_id:'T1068', technique_name:'Exploitation for Privilege Escalation',tactic:'privilege_escalation',description:'Adversaries may exploit vulnerabilities to elevate privileges.',                       subtechniques:[],                       platforms:['Windows','Linux'],        detection:'Monitor for exploitation artifacts.',                   mitigation:'Patch management, sandboxing' },
  { technique_id:'T1003', technique_name:'OS Credential Dumping',               tactic:'credential_access',   description:'Adversaries may dump credentials to obtain account login material.',                     subtechniques:['T1003.001','T1003.002'], platforms:['Windows'],               detection:'Monitor LSASS access, SAM file reads.',                 mitigation:'Credential Guard, privileged account management' },
  { technique_id:'T1021', technique_name:'Remote Services',                     tactic:'lateral_movement',    description:'Adversaries may use valid accounts to log into remote services.',                       subtechniques:['T1021.001','T1021.002'], platforms:['Windows','Linux'],        detection:'Monitor unusual remote auth.',                          mitigation:'MFA, network segmentation' },
  { technique_id:'T1486', technique_name:'Data Encrypted for Impact',           tactic:'impact',              description:'Adversaries may encrypt data to interrupt availability.',                               subtechniques:[],                       platforms:['Windows','macOS','Linux'], detection:'Monitor mass file modifications.',                      mitigation:'Data backups, endpoint protection' },
  { technique_id:'T1027', technique_name:'Obfuscated Files or Information',     tactic:'defense_evasion',     description:'Adversaries may obfuscate files to avoid detection.',                                  subtechniques:['T1027.001'],             platforms:['Windows','macOS','Linux'], detection:'Monitor high entropy files.',                           mitigation:'AV/EDR, behavior analysis' },
]

const TACTIC_COLORS: Record<string, string> = {
  initial_access: '#FF4D6D', execution: '#F97316', persistence: '#F59E0B',
  privilege_escalation: '#EAB308', defense_evasion: '#A855F7', credential_access: '#EC4899',
  discovery: '#06B6D4', lateral_movement: '#00D9B4', collection: '#10B981',
  command_and_control: '#6366F1', exfiltration: '#F43F5E', impact: '#EF4444',
}

export function MitrePage() {
  const [search, setSearch] = useState('')
  const [selectedTactic, setSelectedTactic] = useState('')
  const [selected, setSelected] = useState<MitreTechnique | null>(null)

  const { data: techniques = MOCK_TECHNIQUES } = useQuery({
    queryKey: ['mitre-techniques', selectedTactic],
    queryFn: () => fetch(`/api/v1/ai/mitre/techniques?tactic=${selectedTactic}`).then(r => r.json()),
    enabled: false,
  })

  const filtered = (techniques as MitreTechnique[]).filter((t: MitreTechnique) =>
    (selectedTactic === '' || t.tactic === selectedTactic) &&
    (search === '' || t.technique_name.toLowerCase().includes(search.toLowerCase()) || t.technique_id.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <PageContainer className="flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <PageHeader
        title="MITRE ATT&CK Matrix"
        description="Adversary tactics, techniques, and procedures mapped to incidents."
      />

      {/* ── Filters ── */}
      <div className="flex flex-col gap-4">
        
        {/* Tactic Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTactic('')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
              selectedTactic === '' 
                ? 'bg-[var(--primary-bg)] border-[var(--primary-ring)] text-[var(--primary)]' 
                : 'bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
            }`}
          >
            All Tactics
          </button>
          {MITRE_TACTICS.map(tactic => {
            const isSelected = selectedTactic === tactic.key;
            const tColor = TACTIC_COLORS[tactic.key] ?? 'var(--primary)';
            return (
              <button
                key={tactic.key}
                onClick={() => setSelectedTactic(selectedTactic === tactic.key ? '' : tactic.key)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border"
                style={{
                  background: isSelected ? `${tColor}20` : 'transparent',
                  borderColor: isSelected ? `${tColor}50` : 'var(--border)',
                  color: isSelected ? tColor : 'var(--text-muted)',
                }}
              >
                {tactic.name}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] max-w-sm focus-within:border-[var(--primary-dim)] transition-colors">
          <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            className="bg-transparent flex-1 text-sm text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)]"
            placeholder="Search techniques or IDs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* ── Techniques List (2/3) ── */}
        <div className="xl:col-span-2 flex flex-col gap-3">
          {filtered.map((t: MitreTechnique, i: number) => {
            const tc = TACTIC_COLORS[t.tactic] ?? 'var(--primary)'
            const isSelected = selected?.technique_id === t.technique_id
            
            return (
              <motion.div key={t.technique_id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <div
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected ? 'bg-[var(--bg-hover)]' : 'bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                  }`}
                  style={{ 
                    borderColor: isSelected ? `${tc}50` : 'var(--border)', 
                    borderLeftWidth: isSelected ? 4 : 1, 
                    borderLeftColor: isSelected ? tc : 'var(--border)' 
                  }}
                  onClick={() => setSelected(t)}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{ background: `${tc}15`, borderColor: `${tc}30` }}
                  >
                    <Shield className="w-5 h-5" style={{ color: tc }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span 
                        className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border"
                        style={{ color: tc, borderColor: `${tc}40`, background: `${tc}15` }}
                      >
                        {t.technique_id}
                      </span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{t.technique_name}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-1 leading-relaxed">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: tc, background: `${tc}15` }}
                      >
                        {t.tactic.replace(/_/g, ' ')}
                      </span>
                      {t.platforms.slice(0, 3).map((p: string) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-muted)]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
          {filtered.length === 0 && (
            <EmptyState
              title="No techniques found"
              description="No techniques matched your search query."
            />
          )}
        </div>

        {/* ── Detail Panel (1/3) ── */}
        <div>
          {selected ? (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="sticky top-6">
              <Card>
                <CardContent className="p-6 flex flex-col gap-6">
                  
                  <div>
                    <span 
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border inline-block mb-3"
                      style={{ 
                        color: TACTIC_COLORS[selected.tactic] ?? 'var(--primary)', 
                        borderColor: (TACTIC_COLORS[selected.tactic] ?? 'var(--primary)') + '40', 
                        background: (TACTIC_COLORS[selected.tactic] ?? 'var(--primary)') + '15' 
                      }}
                    >
                      {selected.technique_id}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{selected.technique_name}</h3>
                    <span 
                      className="text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full mt-2 inline-block"
                      style={{ 
                        color: TACTIC_COLORS[selected.tactic] ?? 'var(--primary)', 
                        background: (TACTIC_COLORS[selected.tactic] ?? 'var(--primary)') + '15' 
                      }}
                    >
                      {selected.tactic.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-5">
                    {[
                      { title: 'Description', body: selected.description },
                      { title: 'Detection',   body: selected.detection   },
                      { title: 'Mitigation',  body: selected.mitigation  },
                    ].map(s => (
                      <div key={s.title}>
                        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">{s.title}</div>
                        <p className="text-sm leading-relaxed text-[var(--text-muted)]">{s.body}</p>
                      </div>
                    ))}
                  </div>

                  {selected.subtechniques.length > 0 && (
                    <div className="pt-2 border-t border-[var(--border)]">
                      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Sub-Techniques</div>
                      <div className="flex flex-wrap gap-2">
                        {selected.subtechniques.map(s => (
                          <span key={s} className="text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-muted)]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <EmptyState
              title="No technique selected"
              description="Select a technique from the list to view detailed descriptions, detection methods, and mitigations."
              className="sticky top-6"
            />
          )}
        </div>

      </div>
    </PageContainer>
  )
}
