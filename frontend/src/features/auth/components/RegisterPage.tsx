import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, Shield, User, Building } from 'lucide-react'
import { Input } from '@/components/ui'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { PlexusBackground } from '@/components/common'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', organization: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)



  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await authService.register(form)
      navigate('/login?registered=true')
    } catch {
      setError('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  const sessionId = 'X7Y8-Z9A0-B1C2'

  return (
    <div className="min-h-screen w-full bg-[#020814] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Plexus Background */}
      <PlexusBackground />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00E5FF]/[0.02] rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#7C3AED]/[0.02] rounded-full blur-3xl pointer-events-none z-0" />

      {/* Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[850px] min-h-[520px] flex flex-col lg:flex-row rounded-2xl border border-[#162030] bg-[#040d1a]/80 backdrop-blur-md overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.8)] relative z-10"
      >
        {/* Left Panel — Decorative */}
        <div className="hidden lg:flex w-1/2 bg-[#020814]/30 p-10 flex-col items-center justify-between border-r border-[#162030] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
              <path d="M0,100 Q100,50 200,100 T400,100" stroke="#00E5FF" strokeWidth="1.5" />
              <path d="M0,200 Q100,280 200,200 T400,200" stroke="#7C3AED" strokeWidth="1.5" />
              <line x1="50" y1="0" x2="50" y2="400" stroke="#162030" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="150" y1="0" x2="150" y2="400" stroke="#162030" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="250" y1="0" x2="250" y2="400" stroke="#162030" strokeWidth="0.5" strokeDasharray="4 4" />
            </svg>
          </div>

          <div className="w-full flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-[10px] font-mono text-[#3d566e] uppercase tracking-widest">Security Pulse Console</span>
          </div>

          {/* Central Logo */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#00E5FF]/10 animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-[#7C3AED]/10 border-dashed animate-[spin_15s_linear_infinite_reverse]" />
            <div className="absolute w-28 h-28 rounded-full bg-[#00E5FF]/5 blur-xl animate-pulse" />

            <div className="relative w-16 h-16 rounded-full bg-[#071022] border border-[#00E5FF]/30 flex items-center justify-center shadow-[0_0_24px_rgba(0,229,255,0.15)] z-10">
              <svg className="w-8 h-8 text-[#00E5FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <div className="w-full text-center">
            <p className="text-[10px] font-mono text-[#3d566e] tracking-wider">
              SYSTEM_STATUS: <span className="text-[#10D9A0]">SECURE</span> // ENCRYPTION: <span className="text-[#00E5FF]">AES-256</span>
            </p>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center relative">
          <div className="absolute top-5 right-6 text-[9px] font-mono text-[#3d566e]/70 tracking-wider">
            SESSION_ID: {sessionId}
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#E2E8F0] tracking-tight">Create Account</h2>
              <p className="text-xs text-[#3d566e] mt-1 font-mono">Join Sentinel AI platform</p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="Full name"
                type="text"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={set('name')}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Organization"
                type="text"
                placeholder="Acme Corp"
                value={form.organization}
                onChange={set('organization')}
                leftIcon={<Building className="w-4 h-4" />}
                required
              />
              <Input
                label="Email address"
                type="email"
                placeholder="alex@company.com"
                value={form.email}
                onChange={set('email')}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={set('password')}
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
                className="w-full h-10 rounded-lg font-semibold text-[#020814] text-xs transition-all relative overflow-hidden group disabled:opacity-50 cursor-pointer mt-2"
                style={{ background: 'linear-gradient(135deg, #00E5FF, #00b8cc)', boxShadow: '0 0 20px rgba(0,229,255,0.15)' }}
              >
                <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                {loading ? (
                  <svg className="animate-spin h-4 w-4 mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : 'CREATE ACCOUNT'}
              </button>
            </form>

            <p className="text-xs text-[#3d566e] text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-[#00E5FF] hover:text-[#00b8cc] transition-colors font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
