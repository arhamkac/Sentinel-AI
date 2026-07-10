import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Shield } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { MITRE_TACTICS } from '@/lib/constants'
import type { MitreTechnique } from '@/types'

const PRIMARY = '#00D9B4'
const DIM     = '#3d566e'
const MUTED   = '#8FA3BF'
const BRIGHT  = '#E2E8F0'
const SURFACE = '#071022'
const BORDER  = '#162030'

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
    <PageContainer>
      {/* Page header */}
      <div>
        <div className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: DIM }}>Adversary Tactics Framework</div>
        <h1 className="text-xl font-bold font-mono" style={{ color: BRIGHT }}>MITRE ATT&CK Matrix</h1>
        <p className="text-[11px] font-mono mt-0.5" style={{ color: MUTED }}>Adversary tactics, techniques, and procedures mapped to incidents</p>
      </div>

      {/* Tactic filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTactic('')}
          className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer"
          style={{ background: selectedTactic === '' ? PRIMARY + '15' : 'transparent', borderColor: selectedTactic === '' ? PRIMARY + '50' : BORDER, color: selectedTactic === '' ? PRIMARY : MUTED }}
        >
          All Tactics
        </button>
        {MITRE_TACTICS.map(tactic => (
          <button
            key={tactic.key}
            onClick={() => setSelectedTactic(selectedTactic === tactic.key ? '' : tactic.key)}
            className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer"
            style={{
              background: selectedTactic === tactic.key ? (TACTIC_COLORS[tactic.key] ?? PRIMARY) + '20' : 'transparent',
              borderColor: selectedTactic === tactic.key ? (TACTIC_COLORS[tactic.key] ?? PRIMARY) + '50' : BORDER,
              color: selectedTactic === tactic.key ? (TACTIC_COLORS[tactic.key] ?? PRIMARY) : MUTED,
            }}
          >
            {tactic.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border max-w-sm" style={{ background: SURFACE, borderColor: BORDER }}>
        <Search style={{ width: 13, height: 13, color: DIM }} />
        <input
          className="bg-transparent flex-1 text-[11px] font-mono outline-none"
          style={{ color: BRIGHT }}
          placeholder="Search techniques or IDs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Techniques list */}
        <div className="xl:col-span-2 flex flex-col gap-2">
          {filtered.map((t: MitreTechnique, i: number) => {
            const tc = TACTIC_COLORS[t.tactic] ?? PRIMARY
            const isSelected = selected?.technique_id === t.technique_id
            return (
              <motion.div key={t.technique_id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <div
                  className="flex items-start gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all"
                  style={{ background: SURFACE, borderColor: isSelected ? tc + '50' : BORDER, borderLeftWidth: 2, borderLeftColor: tc }}
                  onClick={() => setSelected(t)}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: tc + '18', border: `1px solid ${tc}30` }}>
                    <Shield style={{ width: 14, height: 14, color: tc }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded border font-bold"
                        style={{ color: tc, borderColor: tc + '40', background: tc + '12' }}>
                        {t.technique_id}
                      </span>
                      <span className="text-[13px] font-bold font-mono" style={{ color: BRIGHT }}>{t.technique_name}</span>
                    </div>
                    <p className="text-[10px] mb-1.5 line-clamp-1" style={{ color: MUTED }}>{t.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                        style={{ color: tc, background: tc + '12' }}>{t.tactic.replace(/_/g, ' ')}</span>
                      {t.platforms.slice(0, 3).map((p: string) => (
                        <span key={p} className="text-[9px] font-mono px-2 py-0.5 rounded border"
                          style={{ color: MUTED, borderColor: BORDER }}>{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
            <div className="sticky top-4 rounded-2xl border p-5 space-y-4" style={{ background: SURFACE, borderColor: BORDER }}>
              <div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded border font-bold"
                  style={{ color: TACTIC_COLORS[selected.tactic] ?? PRIMARY, borderColor: (TACTIC_COLORS[selected.tactic] ?? PRIMARY) + '40', background: (TACTIC_COLORS[selected.tactic] ?? PRIMARY) + '12' }}>
                  {selected.technique_id}
                </span>
                <h3 className="text-sm font-bold font-mono mt-2" style={{ color: BRIGHT }}>{selected.technique_name}</h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{ color: TACTIC_COLORS[selected.tactic] ?? PRIMARY, background: (TACTIC_COLORS[selected.tactic] ?? PRIMARY) + '15' }}>
                  {selected.tactic.replace(/_/g, ' ')}
                </span>
              </div>

              {[
                { title: 'Description', body: selected.description },
                { title: 'Detection',   body: selected.detection   },
                { title: 'Mitigation',  body: selected.mitigation  },
              ].map(s => (
                <div key={s.title}>
                  <div className="text-[9px] font-mono uppercase tracking-widest mb-1.5" style={{ color: DIM }}>{s.title}</div>
                  <p className="text-[11px] leading-relaxed" style={{ color: MUTED }}>{s.body}</p>
                </div>
              ))}

              {selected.subtechniques.length > 0 && (
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest mb-1.5" style={{ color: DIM }}>Sub-Techniques</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.subtechniques.map(s => (
                      <span key={s} className="text-[9px] font-mono px-2 py-0.5 rounded border"
                        style={{ color: MUTED, borderColor: BORDER }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </PageContainer>
  )
}
