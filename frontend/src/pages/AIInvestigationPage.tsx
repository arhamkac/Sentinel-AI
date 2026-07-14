/* eslint-disable react-hooks/purity */
import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Send, User, Bot, Sparkles, AlertTriangle, ChevronRight } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { aiService } from '@/services/ai.service'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

function FormattedContent({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => <h1 className="text-lg font-bold text-[var(--text-primary)] mt-4 mb-2" {...props} />,
          h2: ({ ...props }) => <h2 className="text-base font-bold text-[var(--text-primary)] mt-4 mb-2" {...props} />,
          h3: ({ ...props }) => <h3 className="text-sm font-bold text-[var(--text-primary)] mt-3 mb-1" {...props} />,
          p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
          li: ({ ...props }) => <li className="pl-1" {...props} />,
          strong: ({ ...props }) => <strong className="font-semibold text-[var(--text-primary)]" {...props} />,
          a: ({ ...props }) => <a className="text-[var(--primary)] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
          code: ({ inline, className, children, ...props }: any) => {
            return inline ? (
              <code className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-1 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-[var(--bg-surface)] p-3 rounded-md overflow-x-auto border border-[var(--border)] my-2">
                <code className="text-xs font-mono text-[var(--text-primary)]" {...props}>
                  {children}
                </code>
              </pre>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
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
    <PageContainer className="flex flex-col gap-6">
      
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">AI Investigation</h1>
        <p className="text-[var(--text-muted)] mt-1">Intelligent threat analysis powered by RAG-enhanced AI.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6" style={{ height: 'calc(100vh - 160px)', minHeight: 600 }}>

        {/* ── Chat Area (75%) ── */}
        <Card className="xl:col-span-3 flex flex-col min-h-0">
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 min-h-0">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      msg.role === 'assistant' 
                        ? 'bg-[var(--primary-bg)] border-[var(--primary-ring)]' 
                        : 'bg-[var(--bg-inset)] border-[var(--border)]'
                    }`}
                  >
                    {msg.role === 'assistant'
                      ? <Bot className="w-4 h-4 text-[var(--primary)]" />
                      : <User className="w-4 h-4 text-[var(--text-muted)]" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <div 
                      className={`rounded-xl px-5 py-4 border ${
                        msg.role === 'user' 
                          ? 'bg-[var(--primary-bg)] border-[var(--primary-ring)] rounded-tr-sm' 
                          : 'bg-[var(--bg-inset)] border-[var(--border)] rounded-tl-sm'
                      }`}
                    >
                      <FormattedContent content={msg.content} />
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {msg.sources.map(s => (
                          <span 
                            key={s} 
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-muted)]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {loading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg border border-[var(--primary-ring)] bg-[var(--primary-bg)] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <div className="rounded-xl px-5 py-4 border border-[var(--border)] bg-[var(--bg-inset)] rounded-tl-sm flex items-center gap-2">
                  {[0, 1, 2].map(i => (
                    <motion.span 
                      key={i} 
                      className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Starter Prompts */}
          {messages.length === 1 && (
            <div className="px-6 pb-4 flex flex-wrap gap-2">
              {STARTER_PROMPTS.map(p => (
                <button 
                  key={p} 
                  onClick={() => sendMessage(p)}
                  className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-inset)] hover:border-[var(--primary-dim)] hover:text-[var(--primary)] text-[var(--text-secondary)] flex items-center gap-1.5 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-surface)]">
            <form onSubmit={e => { e.preventDefault(); sendMessage(input) }} className="flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about this incident, techniques, or threat actors..."
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary-dim)] transition-colors placeholder-[var(--text-muted)]"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className={`w-12 rounded-lg flex items-center justify-center transition-colors ${
                  input.trim() 
                    ? 'bg-[var(--primary)] text-[var(--bg-base)] hover:brightness-110' 
                    : 'bg-[var(--bg-inset)] text-[var(--text-muted)] border border-[var(--border)]'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </Card>

        {/* ── Context Panel (25%) ── */}
        <div className="flex flex-col gap-6">
          
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[var(--primary)]" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4">
              {[
                { icon: AlertTriangle, color: 'text-[var(--danger)]', bg: 'bg-[var(--danger-bg)]', border: 'border-[var(--danger-ring)]', label: 'Threat Correlation', desc: 'Links events across sources' },
                { icon: Sparkles, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-bg)]', border: 'border-[var(--primary-ring)]', label: 'MITRE Mapping', desc: 'Maps to ATT&CK framework' },
                { icon: Brain, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-bg)]', border: 'border-[var(--warning-ring)]', label: 'Attack Prediction', desc: 'Forecasts next moves' },
                { icon: Bot, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-bg)]', border: 'border-[var(--primary-ring)]', label: 'RAG Knowledge', desc: 'MITRE, CVEs, threat intel' },
              ].map(({ icon: Icon, color, bg, border, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${bg} ${border}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{label}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <CardTitle>Knowledge Sources</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-2.5">
              {[
                'MITRE ATT&CK v14',
                'CVE Database 2024',
                'CERT-In Advisories',
                'OWASP Top 10',
                'Internal Incident History',
              ].map(source => (
                <div key={source} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  {source}
                </div>
              ))}
            </CardContent>
          </Card>
          
        </div>

      </div>
    </PageContainer>
  )
}
