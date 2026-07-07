import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, Shield, Radio, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'

// ─── Interactive Plexus Canvas Background ─────────────────────
function PlexusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Node configuration
    const numNodes = Math.min(100, Math.floor((width * height) / 15000))
    const nodes: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
    }> = []

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1,
      })
    }

    // Mouse tracking
    let mouse = { x: -1000, y: -1000 }
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw connections
      ctx.lineWidth = 0.5
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i]

        // Connect to other nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j]
          const dx = n1.x - n2.x
          const dy = n1.y - n2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.15
            ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(n1.x, n1.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.stroke()
          }
        }

        // Connect to mouse
        const mdx = n1.x - mouse.x
        const mdy = n1.y - mouse.y
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mdist < 150) {
          const malpha = (1 - mdist / 150) * 0.25
          ctx.strokeStyle = `rgba(124, 58, 237, ${malpha})`
          ctx.beginPath()
          ctx.moveTo(n1.x, n1.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }

        // Move node
        n1.x += n1.vx
        n1.y += n1.vy

        // Boundaries check
        if (n1.x < 0 || n1.x > width) n1.vx *= -1
        if (n1.y < 0 || n1.y > height) n1.vy *= -1

        // Draw node
        ctx.fillStyle = n1.vx > 0 ? 'rgba(0, 229, 255, 0.4)' : 'rgba(124, 58, 237, 0.4)'
        ctx.beginPath()
        ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none block z-0"
    />
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDemoAccess = () => {
    // Immediate local bypass
    localStorage.setItem('access_token', 'mock_demo_token')
    localStorage.setItem('refresh_token', 'mock_demo_token')
    setUser({
      id: 'demo-user',
      name: 'Demo Analyst',
      email: 'demo@sentinel.ai',
      role: 'admin',
      organization_id: 'demo-org',
      created_at: new Date().toISOString()
    })
    navigate('/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await authService.login({ email, password })
      setUser(user)
      navigate('/dashboard')
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Session ID matching reference design
  const sessionId = 'X7Y8-Z9A0-B1C2'

  return (
    <div className="min-h-screen w-full bg-[#020814] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic plexus background */}
      <PlexusBackground />

      {/* Ambient soft glow spots */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00E5FF]/[0.02] rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#7C3AED]/[0.02] rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main glass box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[850px] min-h-[500px] flex flex-col lg:flex-row rounded-2xl border border-[#162030] bg-[#040d1a]/80 backdrop-blur-md overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.8)] relative z-10"
      >
        {/* Left Panel — Decorative branding */}
        <div className="hidden lg:flex w-1/2 bg-[#020814]/30 p-10 flex-col items-center justify-between border-r border-[#162030] relative overflow-hidden">
          {/* Subtle background SVG technical graphs */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
              <path d="M0,100 Q100,50 200,100 T400,100" stroke="#00E5FF" strokeWidth="1.5" />
              <path d="M0,200 Q100,280 200,200 T400,200" stroke="#7C3AED" strokeWidth="1.5" />
              <line x1="50" y1="0" x2="50" y2="400" stroke="#162030" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="150" y1="0" x2="150" y2="400" stroke="#162030" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="250" y1="0" x2="250" y2="400" stroke="#162030" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="350" y1="0" x2="350" y2="400" stroke="#162030" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#162030" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="0" y1="250" x2="400" y2="250" stroke="#162030" strokeWidth="0.5" strokeDasharray="4 4" />
            </svg>
          </div>

          <div className="w-full flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-[10px] font-mono text-[#3d566e] uppercase tracking-widest">Security Pulse Console</span>
          </div>

          {/* Central glowing Eye/Scanner logo */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Concentric rings */}
            <div className="absolute inset-0 rounded-full border border-[#00E5FF]/10 animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-[#7C3AED]/10 border-dashed animate-[spin_15s_linear_infinite_reverse]" />
            <div className="absolute inset-8 rounded-full border border-[#00E5FF]/20" />

            {/* Glowing background aura */}
            <div className="absolute w-28 h-28 rounded-full bg-[#00E5FF]/5 blur-xl animate-pulse" />

            {/* Cyber Eye Emblem */}
            <div className="relative w-16 h-16 rounded-full bg-[#071022] border border-[#00E5FF]/30 flex items-center justify-center shadow-[0_0_24px_rgba(0,229,255,0.15)] z-10">
              <svg className="w-8 h-8 text-[#00E5FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* Left panel bottom status */}
          <div className="w-full text-center">
            <p className="text-[10px] font-mono text-[#3d566e] tracking-wider">
              SYSTEM_STATUS: <span className="text-[#10D9A0]">SECURE</span> // ENCRYPTION: <span className="text-[#00E5FF]">AES-256</span>
            </p>
          </div>
        </div>

        {/* Right Panel — Interactive credentials & demo entry */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center relative">
          {/* Faint Session ID matching reference image */}
          <div className="absolute top-5 right-6 text-[9px] font-mono text-[#3d566e]/70 tracking-wider">
            SESSION_ID: {sessionId}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#E2E8F0] tracking-tight">Sign In</h2>
              <p className="text-xs text-[#3d566e] mt-1 font-mono">Access Sentinel AI platform</p>
            </div>

            {/* ── HIGH PRIORITY DEMO WORKSPACE BUTTON ── */}
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full h-11 rounded-lg border font-semibold flex items-center justify-center gap-2.5 text-sm transition-all duration-300 relative overflow-hidden group cursor-pointer"
              style={{
                background: 'linear-gradient(#071022, #071022) padding-box, linear-gradient(135deg, #00E5FF, #7C3AED) border-box',
                borderColor: 'transparent',
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.12)',
              }}
            >
              {/* Animated scanning shimmer sweep */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent translate-x-[-100%] group-hover:animate-[sweep-right_1s_ease-out]" />
              <Sparkles className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-white group-hover:text-[#00E5FF] transition-colors">Enter Live Demo Workspace</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-[#162030]" />
              <span className="text-[9px] font-mono text-[#3d566e] uppercase tracking-widest shrink-0">or use credentials</span>
              <div className="flex-1 h-[1px] bg-[#162030]" />
            </div>

            {/* Credentials Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="analyst@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="pointer-events-auto text-[#3d566e] hover:text-[#E2E8F0] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
                autoComplete="current-password"
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-[#FF4D6D] bg-[#FF4D6D]/8 border border-[#FF4D6D]/20 rounded-lg px-3 py-2 font-mono"
                  >
                    ⚠ {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg font-semibold text-[#020814] text-xs transition-all relative overflow-hidden group disabled:opacity-50 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #00E5FF, #00b8cc)', boxShadow: '0 0 20px rgba(0,229,255,0.15)' }}
              >
                <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                {loading ? (
                  <svg className="animate-spin h-4 w-4 mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : 'SIGN IN'}
              </button>
            </form>

            <p className="text-xs text-[#3d566e] text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#00E5FF] hover:text-[#00b8cc] transition-colors font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
