import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Send, User, Bot, Sparkles, AlertTriangle, ChevronRight } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '@/components/ui'
import { aiService } from '@/services/ai.service'

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
  'What\'s the probability of ransomware deployment?',
]

const MOCK_RESPONSES: Record<string, string> = {
  default: `Based on my analysis of the incident, here's what I've determined:

**Attack Chain Summary**
The attacker followed a classic ransomware kill chain:
1. **Initial Access** (T1566.001) — Spear phishing with malicious macro document
2. **Execution** (T1059.001) — PowerShell dropper executed via macro
3. **Persistence** (T1053.005) — Scheduled task created for C2 callback
4. **Credential Access** (T1003.001) — Mimikatz used to dump LSASS credentials
5. **Lateral Movement** (T1021.001) — RDP to domain controller using stolen credentials
6. **Defense Evasion** (T1490) — Shadow copy deletion to prevent recovery

**Confidence Level: High (91%)**

The behavioral pattern is consistent with the **ALPHV/BlackCat** ransomware group, which is known for double extortion tactics.`,
}

export function AIInvestigationPage() {
  const { incidentId } = useParams<{ incidentId?: string }>()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: incidentId
        ? `I'm analyzing **Incident #${incidentId}**. I have full context of all correlated events, MITRE mappings, and behavioral patterns. What would you like to investigate?`
        : 'I\'m your AI security analyst. I can help you investigate incidents, analyze attack patterns, search MITRE ATT&CK, and provide threat intelligence. What would you like to explore?',
      timestamp: new Date(),
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
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await aiService.chat(content, incidentId)
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        sources: response.sources,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      // Fallback mock response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: MOCK_RESPONSES.default,
        sources: ['MITRE ATT&CK v14', 'Internal Incident History', 'CVE Database'],
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer
      title="AI Investigation"
      description="Autonomous threat analysis powered by AI"
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Chat */}
        <div className="xl:col-span-3 flex flex-col min-h-0">
          <Card className="flex flex-col flex-1 min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'assistant'
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-surface border border-border'
                    }`}>
                      {msg.role === 'assistant'
                        ? <Bot className="w-3.5 h-3.5 text-primary" />
                        : <User className="w-3.5 h-3.5 text-[#8FA3BF]" />
                      }
                    </div>

                    {/* Bubble */}
                    <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                      <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary/10 border border-primary/15 text-[#E2E8F0]'
                          : 'bg-bg-2 border border-border text-[#E2E8F0]'
                      }`}>
                        <FormattedContent content={msg.content} />
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {msg.sources.map(s => (
                            <Badge key={s} variant="muted" className="text-[10px]">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <span className="text-[10px] text-[#3d566e] font-mono">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-bg-2 border border-border rounded-xl px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
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
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {STARTER_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border text-[#8FA3BF] hover:border-primary/30 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={e => { e.preventDefault(); sendMessage(input) }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about this incident, techniques, or threat actors…"
                  className="flex-1"
                  disabled={loading}
                />
                <Button type="submit" disabled={!input.trim() || loading} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <CardTitle>AI Capabilities</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 text-xs">
                {[
                  { icon: <AlertTriangle className="w-3.5 h-3.5 text-danger" />, label: 'Threat correlation', desc: 'Links events across sources' },
                  { icon: <Sparkles className="w-3.5 h-3.5 text-primary" />,     label: 'MITRE mapping',    desc: 'Maps techniques to ATT&CK' },
                  { icon: <Brain className="w-3.5 h-3.5 text-warning" />,         label: 'Attack prediction', desc: 'Forecasts next attacker moves' },
                  { icon: <Bot className="w-3.5 h-3.5 text-success" />,           label: 'RAG knowledge',   desc: 'MITRE, CVEs, threat intel' },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <div className="mt-0.5">{icon}</div>
                    <div>
                      <div className="text-[#E2E8F0] font-semibold">{label}</div>
                      <div className="text-[#3d566e]">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Knowledge Sources</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {[
                  'MITRE ATT&CK v14',
                  'CVE Database 2024',
                  'CERT-In Advisories',
                  'OWASP Top 10',
                  'Internal Incident History',
                ].map(source => (
                  <div key={source} className="flex items-center gap-2 text-xs text-[#8FA3BF] font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {source}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

function FormattedContent({ content }: { content: string }) {
  // Simple markdown-like formatting
  const lines = content.split('\n')
  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-[#E2E8F0]">{line.slice(2, -2)}</p>
        }
        if (line.startsWith('- ') || line.match(/^\d+\./)) {
          return <p key={i} className="pl-3 text-[#8FA3BF]">{line}</p>
        }
        // Inline bold
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} className="text-[#8FA3BF]">
            {parts.map((part, j) =>
              j % 2 === 0 ? part : <strong key={j} className="font-semibold text-[#E2E8F0]">{part}</strong>
            )}
          </p>
        )
      })}
    </div>
  )
}
