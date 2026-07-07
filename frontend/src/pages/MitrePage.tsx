import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Shield } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardContent, Input, Badge } from '@/components/ui'
import { MITRE_TACTICS } from '@/lib/constants'
import type { MitreTechnique } from '@/types'

const MOCK_TECHNIQUES: MitreTechnique[] = [
  { technique_id:'T1566', technique_name:'Phishing', tactic:'initial_access', description:'Adversaries may send phishing messages to gain access to victim systems.', subtechniques:['T1566.001','T1566.002'], platforms:['Windows','macOS','Linux'], detection:'Monitor email flows and attachment execution.', mitigation:'User training, email filtering' },
  { technique_id:'T1059', technique_name:'Command and Scripting Interpreter', tactic:'execution', description:'Adversaries may abuse command and script interpreters to execute commands.', subtechniques:['T1059.001','T1059.003'], platforms:['Windows','macOS','Linux'], detection:'Monitor process creation for interpreters.', mitigation:'Code signing, application control' },
  { technique_id:'T1053', technique_name:'Scheduled Task/Job', tactic:'persistence', description:'Adversaries may abuse task scheduling to facilitate recurring execution.', subtechniques:['T1053.005'], platforms:['Windows'], detection:'Monitor scheduled task creation.', mitigation:'Audit, user account management' },
  { technique_id:'T1068', technique_name:'Exploitation for Privilege Escalation', tactic:'privilege_escalation', description:'Adversaries may exploit vulnerabilities to elevate privileges.', subtechniques:[], platforms:['Windows','Linux'], detection:'Monitor for exploitation artifacts.', mitigation:'Patch management, sandboxing' },
  { technique_id:'T1003', technique_name:'OS Credential Dumping', tactic:'credential_access', description:'Adversaries may dump credentials to obtain account login material.', subtechniques:['T1003.001','T1003.002'], platforms:['Windows'], detection:'Monitor LSASS access, SAM file reads.', mitigation:'Credential Guard, privileged account management' },
  { technique_id:'T1021', technique_name:'Remote Services', tactic:'lateral_movement', description:'Adversaries may use valid accounts to log into remote services.', subtechniques:['T1021.001','T1021.002'], platforms:['Windows','Linux'], detection:'Monitor unusual remote auth.', mitigation:'MFA, network segmentation' },
  { technique_id:'T1486', technique_name:'Data Encrypted for Impact', tactic:'impact', description:'Adversaries may encrypt data to interrupt availability.', subtechniques:[], platforms:['Windows','macOS','Linux'], detection:'Monitor mass file modifications.', mitigation:'Data backups, endpoint protection' },
  { technique_id:'T1027', technique_name:'Obfuscated Files or Information', tactic:'defense_evasion', description:'Adversaries may obfuscate files to avoid detection.', subtechniques:['T1027.001'], platforms:['Windows','macOS','Linux'], detection:'Monitor high entropy files.', mitigation:'AV/EDR, behavior analysis' },
]

const tacticColors: Record<string, string> = {
  initial_access: '#FF4D6D', execution: '#F97316', persistence: '#F59E0B',
  privilege_escalation: '#EAB308', defense_evasion: '#A855F7', credential_access: '#EC4899',
  discovery: '#06B6D4', lateral_movement: '#00E5FF', collection: '#10B981',
  command_and_control: '#6366F1', exfiltration: '#F43F5E', impact: '#EF4444',
}

export function MitrePage() {
  const [search, setSearch] = useState('')
  const [selectedTactic, setSelectedTactic] = useState('')
  const [selected, setSelected] = useState<MitreTechnique | null>(null)

  const { data: techniques = MOCK_TECHNIQUES } = useQuery({
    queryKey: ['mitre-techniques', selectedTactic],
    queryFn: () => fetch(`/api/v1/ai/mitre/techniques?tactic=${selectedTactic}`).then(r => r.json()),
    enabled: false, // use mock
  })

  const filtered = (techniques as MitreTechnique[]).filter((t: MitreTechnique) =>
    (selectedTactic === '' || t.tactic === selectedTactic) &&
    (search === '' ||
      t.technique_name.toLowerCase().includes(search.toLowerCase()) ||
      t.technique_id.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <PageContainer title="MITRE ATT&CK" description="Adversary tactics, techniques, and procedures">
      {/* Tactic filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTactic('')}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
            selectedTactic === '' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-[#3d566e] hover:border-border-2 hover:text-[#8FA3BF]'
          }`}
        >
          All Tactics
        </button>
        {MITRE_TACTICS.map(tactic => (
          <button
            key={tactic.key}
            onClick={() => setSelectedTactic(selectedTactic === tactic.key ? '' : tactic.key)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              selectedTactic === tactic.key
                ? 'text-white border-transparent'
                : 'border-border text-[#3d566e] hover:border-border-2 hover:text-[#8FA3BF]'
            }`}
            style={selectedTactic === tactic.key ? { background: tacticColors[tactic.key], borderColor: tacticColors[tactic.key] } : {}}
          >
            {tactic.name}
          </button>
        ))}
      </div>

      <Input
        placeholder="Search techniques or IDs…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        className="max-w-sm"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Techniques list */}
        <div className="xl:col-span-2 flex flex-col gap-2">
          {filtered.map((t: MitreTechnique, i: number) => (
            <motion.div
              key={t.technique_id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card
                hover
                className={`cursor-pointer transition-all ${selected?.technique_id === t.technique_id ? 'border-primary/30' : ''}`}
                onClick={() => setSelected(t)}
              >
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white"
                      style={{ background: `${tacticColors[t.tactic]}20`, border: `1px solid ${tacticColors[t.tactic]}30` }}
                    >
                      <Shield className="w-3.5 h-3.5" style={{ color: tacticColors[t.tactic] }} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="primary" className="text-[10px]">{t.technique_id}</Badge>
                        <span className="text-sm font-semibold text-[#E2E8F0]">{t.technique_name}</span>
                      </div>
                      <p className="text-xs text-[#3d566e] line-clamp-1">{t.description}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: tacticColors[t.tactic], background: `${tacticColors[t.tactic]}15` }}
                        >
                          {t.tactic.replace(/_/g, ' ')}
                        </span>
                        <div className="flex gap-1">
                          {t.platforms.slice(0, 3).map((p: string) => (
                            <Badge key={p} variant="muted" className="text-[10px]">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="sticky top-4">
              <CardContent className="pt-5 flex flex-col gap-4">
                <div>
                  <Badge variant="primary" className="mb-2">{selected.technique_id}</Badge>
                  <h3 className="text-sm font-semibold text-[#E2E8F0]">{selected.technique_name}</h3>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ color: tacticColors[selected.tactic], background: `${tacticColors[selected.tactic]}15` }}
                  >
                    {selected.tactic.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#8FA3BF] uppercase tracking-wider mb-1.5 font-mono">Description</h4>
                  <p className="text-xs text-[#3d566e] leading-relaxed">{selected.description}</p>
                </div>
                {selected.subtechniques.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[#8FA3BF] uppercase tracking-wider mb-1.5 font-mono">Sub-techniques</h4>
                    <div className="flex flex-wrap gap-1">
                      {selected.subtechniques.map(s => (
                        <Badge key={s} variant="muted" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-semibold text-[#8FA3BF] uppercase tracking-wider mb-1.5 font-mono">Detection</h4>
                  <p className="text-xs text-[#3d566e]">{selected.detection}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#8FA3BF] uppercase tracking-wider mb-1.5 font-mono">Mitigation</h4>
                  <p className="text-xs text-[#3d566e]">{selected.mitigation}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </PageContainer>
  )
}
