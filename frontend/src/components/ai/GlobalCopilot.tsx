import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, User, Sparkles } from 'lucide-react'
import { aiService } from '@/services/ai.service'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function FormattedContent({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => <h1 className="text-lg font-bold text-[var(--text-primary)] mt-2 mb-1" {...props} />,
          h2: ({ ...props }) => <h2 className="text-base font-bold text-[var(--text-primary)] mt-2 mb-1" {...props} />,
          h3: ({ ...props }) => <h3 className="text-sm font-bold text-[var(--text-primary)] mt-1 mb-1" {...props} />,
          p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
          li: ({ ...props }) => <li className="pl-1" {...props} />,
          strong: ({ ...props }) => <strong className="font-semibold text-[var(--text-primary)]" {...props} />,
          a: ({ ...props }) => <a className="text-[var(--primary)] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
          pre: ({ ...props }) => <pre className="bg-[var(--bg-inset)] p-3 rounded-md overflow-x-auto border border-[var(--border)] my-2" {...props} />,
          code: ({ className, children, ...props }) => {
            const isInline = !className || !className.includes('language-');
            return (
              <code 
                className={`${className || ''} ${isInline ? 'bg-[var(--bg-inset)] text-[var(--text-primary)] px-1 py-0.5 rounded text-[11px] font-mono' : 'text-xs font-mono text-[var(--text-primary)]'}`} 
                {...props}
              >
                {children}
              </code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export function GlobalCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0', role: 'assistant', timestamp: new Date(),
      content: "Hi! I'm Sentinel AI. Ask me to explain any technical term, summarize incidents, or navigate the platform.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await aiService.chat(content)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: response.response, timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: "I'm currently unable to process that request. Please try again later.",
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }, [loading])

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt: string }>
      if (customEvent.detail?.prompt) {
        setIsOpen(true)
        sendMessage(customEvent.detail.prompt)
      }
    }
    window.addEventListener('trigger-copilot', handleTrigger)
    return () => window.removeEventListener('trigger-copilot', handleTrigger)
  }, [sendMessage])

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--primary)] text-[var(--bg-base)] shadow-lg shadow-[var(--primary)]/30 flex items-center justify-center hover:scale-105 transition-transform z-50 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-120px)] bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-inset)]" style={{ padding: '12px 16px' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary-bg)] border border-[var(--primary-ring)] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Ask AI Copilot</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Always ready to explain technical terms</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[var(--bg-surface)] rounded-md text-[var(--text-muted)] transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: '16px', gap: '16px' }}>
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : ''}`} style={{ gap: '12px' }}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border mt-1 ${
                    msg.role === 'assistant' 
                      ? 'bg-[var(--primary-bg)] border-[var(--primary-ring)]' 
                      : 'bg-[var(--bg-inset)] border-[var(--border)]'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-3 h-3 text-[var(--primary)]" /> : <User className="w-3 h-3 text-[var(--text-muted)]" />}
                  </div>
                  
                  <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`} style={{ gap: '4px' }}>
                    <div className={`rounded-xl border ${
                      msg.role === 'user'
                        ? 'bg-[var(--primary-bg)] border-[var(--primary-ring)] rounded-tr-sm'
                        : 'bg-[var(--bg-inset)] border-[var(--border)] rounded-tl-sm'
                    }`} style={{ padding: '8px 16px' }}>
                      <FormattedContent content={msg.content} />
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex" style={{ gap: '12px' }}>
                  <div className="w-6 h-6 rounded-md bg-[var(--primary-bg)] border border-[var(--primary-ring)] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-[var(--primary)]" />
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] rounded-tl-sm flex items-center" style={{ padding: '12px 16px', gap: '6px' }}>
                    {[0, 1, 2].map(i => (
                      <motion.span 
                        key={i} 
                        className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[var(--border)] bg-[var(--bg-surface)]" style={{ padding: '12px' }}>
              <form onSubmit={e => { e.preventDefault(); sendMessage(input) }} className="flex" style={{ gap: '8px' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask me to explain..."
                  disabled={loading}
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary-dim)] transition-colors placeholder-[var(--text-muted)]"
                  style={{ padding: '8px 12px' }}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading}
                  className={`w-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    input.trim() 
                      ? 'bg-[var(--primary)] text-[var(--bg-base)] hover:brightness-110' 
                      : 'bg-[var(--bg-inset)] text-[var(--text-muted)] border border-[var(--border)]'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
