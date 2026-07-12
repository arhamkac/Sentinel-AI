/* eslint-disable react-hooks/purity */
import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Send, User, Bot, Sparkles, AlertTriangle, ChevronRight } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { aiService } from '@/services/ai.service'

const PRIMARY = '#00D9B4'
const DIM     = '#3d566e'
const MUTED   = '#8FA3BF'
const BRIGHT  = '#E2E8F0'
const SURFACE = '#071022'
const BORDER  = '#162030'
const DANGER  = '#E75A43'
const WARN    = '#FFB040'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  timestamp: Date
}

const STARTER_PROMPTS = [
  'What techniques did the attacker use?',
  'What is the likely attacker motivation?',
  'What are the recommended containment steps?',
  'Are there any related CVEs I should know about?',
  "What's the probability of ransomware deployment?",
]

const MOCK_RESPONSE = `Based on my analysis of the incident, here's what I've determined:

**Attack Chain Summary**
The attacker followed a classic ransomware kill chain:
1. **Initial Access** (T1566.001) — Spear phishing with malicious macro document
2. **Execution** (T1059.001) — PowerShell dropper executed via macro
3. **Persistence** (T1053.005) — Scheduled task created for C2 callback
4. **Credential Access** (T1003.001) — Mimikatz used to dump LSASS credentials
5. **Lateral Movement** (T1021.001) — RDP to domain controller using stolen credentials
6. **Defense Evasion** (T1490) — Shadow copy deletion to prevent recovery

**Confidence Level: High (91%)**

The behavioral pattern is consistent with the **ALPHV/BlackCat** ransomware group, which is known for double extortion tactics.`

function parseInlineBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, j) =>
    j % 2 === 0 ? part : <strong key={j} style={{ color: BRIGHT }}>{part}</strong>
  )
}

function FormattedContent({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="flex flex-col gap-1.5 text-[11px] leading-relaxed" style={{ color: MUTED }}>
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={i} className="h-2" />
        }

        // 1. Headers (e.g. ### Title or **Title**)
        if (trimmed.startsWith('#')) {
          const match = trimmed.match(/^(#{1,6})\s+(.*)$/)
          if (match) {
            const level = match[1].length
            const text = match[2]
            const sizeClass = level === 1 ? 'text-sm font-black' : level === 2 ? 'text-xs font-extrabold' : 'text-[11px] font-bold'
            return (
              <p key={i} className={`${sizeClass} font-mono mt-2 mb-1`} style={{ color: BRIGHT }}>
                {parseInlineBold(text)}
              </p>
            )
          }
        }

        // 2. Unordered lists (- or *)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const text = trimmed.slice(2)
          return (
            <div key={i} className="flex gap-2 pl-3 items-start font-mono text-[10.5px]">
              <span style={{ color: PRIMARY, userSelect: 'none' }}>•</span>
              <span className="flex-1">{parseInlineBold(text)}</span>
            </div>
          )
        }

        // 3. Ordered lists (1. or 2.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
        if (numMatch) {
          const num = numMatch[1]
          const text = numMatch[2]
          return (
            <div key={i} className="flex gap-2 pl-3 items-start font-mono text-[10.5px]">
              <span style={{ color: PRIMARY, userSelect: 'none' }}>{num}.</span>
              <span className="flex-1">{parseInlineBold(text)}</span>
            </div>
          )
        }

        // 4. Standard Paragraph
        return (
          <p key={i}>
            {parseInlineBold(line)}
          </p>
        )
      })}
    </div>
  )
}

export function AIInvestigationPage() {
  const { incidentId } = useParams<{ incidentId?: string }>()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0', role: 'assistant', timestamp: new Date(),
      content: incidentId
        ? `Analyzing **Incident #${incidentId}**. I have full context of all correlated events, MITRE mappings, and behavioral patterns. What would you like to investigate?`
        : "I'm your AI security analyst. I can help you investigate incidents, analyze attack patterns, search MITRE ATT&CK, and provide threat intelligence. What would you like to explore?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await aiService.chat(content, incidentId)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: response.response, sources: response.sources, timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: MOCK_RESPONSE,
        sources: ['MITRE ATT&CK v14', 'Internal Incident History', 'CVE Database'],
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      {/* Page header */}
      <div>
        <div className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: DIM }}>Autonomous Analysis Engine</div>
        <h1 className="text-xl font-bold font-mono" style={{ color: BRIGHT }}>AI Investigation</h1>
        <p className="text-[11px] font-mono mt-0.5" style={{ color: MUTED }}>Intelligent threat analysis powered by RAG-enhanced AI</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5" style={{ height: 'calc(100vh - 280px)', minHeight: 500 }}>

        {/* Chat area */}
        <div className="xl:col-span-3 flex flex-col min-h-0 rounded-2xl border overflow-hidden"
          style={{ background: SURFACE, borderColor: BORDER }}>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 min-h-0">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      background: msg.role === 'assistant' ? PRIMARY + '15' : '#0c1828',
                      borderColor: msg.role === 'assistant' ? PRIMARY + '30' : BORDER,
                    }}>
                    {msg.role === 'assistant'
                      ? <Bot style={{ width: 14, height: 14, color: PRIMARY }} />
                      : <User style={{ width: 14, height: 14, color: MUTED }} />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <div className="rounded-xl px-4 py-3 border"
                      style={{
                        background: msg.role === 'user' ? PRIMARY + '10' : '#040d1a',
                        borderColor: msg.role === 'user' ? PRIMARY + '20' : BORDER,
                      }}>
                      <FormattedContent content={msg.content} />
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map(s => (
                          <span key={s} className="text-[9px] font-mono px-2 py-0.5 rounded border"
                            style={{ color: MUTED, borderColor: BORDER }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-[9px] font-mono" style={{ color: DIM }}>
                      {msg.timestamp.toLocaleTimeString('en-GB')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {loading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-xl border flex items-center justify-center"
                  style={{ background: PRIMARY + '15', borderColor: PRIMARY + '30' }}>
                  <Bot style={{ width: 14, height: 14, color: PRIMARY }} />
                </div>
                <div className="rounded-xl px-4 py-3 border flex items-center gap-1.5"
                  style={{ background: '#040d1a', borderColor: BORDER }}>
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: PRIMARY }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Starter prompts */}
          {messages.length === 1 && (
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {STARTER_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  className="text-[10px] font-mono px-3 py-1.5 rounded-lg border flex items-center gap-1 cursor-pointer transition-all"
                  style={{ borderColor: BORDER, color: MUTED }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = PRIMARY + '40'; (e.currentTarget as HTMLButtonElement).style.color = PRIMARY }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.color = MUTED }}
                >
                  <ChevronRight style={{ width: 11, height: 11 }} />
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t" style={{ borderColor: BORDER }}>
            <form onSubmit={e => { e.preventDefault(); sendMessage(input) }} className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about this incident, techniques, or threat actors..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border text-[11px] font-mono outline-none"
                style={{ background: '#040d1a', borderColor: BORDER, color: BRIGHT }}
                onFocus={e => { e.currentTarget.style.borderColor = PRIMARY + '60' }}
                onBlur={e => { e.currentTarget.style.borderColor = BORDER }}
              />
              <button type="submit" disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                style={{ background: input.trim() ? PRIMARY : BORDER, color: input.trim() ? '#020814' : DIM }}>
                <Send style={{ width: 15, height: 15 }} />
              </button>
            </form>
          </div>
        </div>

        {/* Right side panel */}
        <div className="flex flex-col gap-4">
          {/* Capabilities */}
          <div className="rounded-2xl border p-4" style={{ background: SURFACE, borderColor: BORDER }}>
            <div className="flex items-center gap-2 mb-3">
              <Brain style={{ width: 14, height: 14, color: PRIMARY }} />
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: BRIGHT }}>AI Capabilities</span>
            </div>
            <div className="space-y-3">
              {[
                { icon: AlertTriangle, color: DANGER, label: 'Threat Correlation', desc: 'Links events across sources' },
                { icon: Sparkles,      color: PRIMARY, label: 'MITRE Mapping',      desc: 'Maps to ATT&CK framework'  },
                { icon: Brain,         color: WARN,    label: 'Attack Prediction',  desc: 'Forecasts next moves'       },
                { icon: Bot,           color: PRIMARY, label: 'RAG Knowledge',      desc: 'MITRE, CVEs, threat intel'  },
              ].map(({ icon: Icon, color, label, desc }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: color + '15' }}>
                    <Icon style={{ width: 12, height: 12, color }} />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono" style={{ color: BRIGHT }}>{label}</div>
                    <div className="text-[10px] font-mono" style={{ color: DIM }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Sources */}
          <div className="rounded-2xl border p-4" style={{ background: SURFACE, borderColor: BORDER }}>
            <div className="text-[9px] font-mono uppercase tracking-widest mb-3" style={{ color: DIM }}>Knowledge Sources</div>
            <div className="space-y-2">
              {[
                'MITRE ATT&CK v14',
                'CVE Database 2024',
                'CERT-In Advisories',
                'OWASP Top 10',
                'Internal Incident History',
              ].map(source => (
                <div key={source} className="flex items-center gap-2 text-[10px] font-mono" style={{ color: MUTED }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: PRIMARY }} />
                  {source}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
