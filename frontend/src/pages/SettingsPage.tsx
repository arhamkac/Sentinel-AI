import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Bell, Key, Radio, Save, CheckCircle2 } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { useAuthStore } from '@/stores/auth.store'

const PRIMARY = '#00D9B4'
const WARN    = '#FFB040'
const DIM     = '#3d566e'
const MUTED   = '#8FA3BF'
const BRIGHT  = '#E2E8F0'
const SURFACE = '#071022'
const BORDER  = '#162030'

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User   },
  { id: 'security',      label: 'Security',      icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell   },
  { id: 'api',           label: 'API Keys',      icon: Key    },
  { id: 'organization',  label: 'Organization',  icon: Radio  },
]

function HudInput({ label, value, type = 'text', readOnly }: {
  label: string; value: string; type?: string; readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-mono uppercase tracking-widest" style={{ color: DIM }}>{label}</label>
      <input
        type={type}
        defaultValue={value}
        readOnly={readOnly}
        className="w-full px-4 py-2.5 rounded-xl border text-[12px] font-mono outline-none transition-colors"
        style={{
          background: '#040d1a',
          borderColor: BORDER,
          color: readOnly ? MUTED : BRIGHT,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = PRIMARY + '60' }}
        onBlur={e => { e.currentTarget.style.borderColor = BORDER }}
      />
    </div>
  )
}

function HudToggle({ label, description, active, onChange }: {
  label: string; description: string; active: boolean; onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b last:border-b-0" style={{ borderColor: BORDER }}>
      <div>
        <div className="text-[12px] font-mono" style={{ color: BRIGHT }}>{label}</div>
        <div className="text-[10px] font-mono mt-0.5" style={{ color: MUTED }}>{description}</div>
      </div>
      <button
        onClick={onChange}
        className="relative w-10 h-6 rounded-full transition-all cursor-pointer border"
        style={{ background: active ? PRIMARY + '30' : '#040d1a', borderColor: active ? PRIMARY : BORDER }}
      >
        <span className="absolute top-0.5 transition-all duration-200 w-5 h-5 rounded-full"
          style={{ left: active ? '18px' : '2px', background: active ? PRIMARY : DIM }} />
      </button>
    </div>
  )
}

export function SettingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [notifs, setNotifs] = useState({ critical: true, high: true, medium: false, email: true, slack: false })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: DIM }}>Platform Configuration</div>
          <h1 className="text-xl font-bold font-mono" style={{ color: BRIGHT }}>System Settings</h1>
          <p className="text-[11px] font-mono mt-0.5" style={{ color: MUTED }}>Manage account, security, and platform preferences</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold font-mono uppercase tracking-widest transition-all"
          style={{ background: saved ? '#1a3d2e' : PRIMARY, color: saved ? PRIMARY : '#020814' }}
        >
          {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </motion.button>
      </div>

      <div className="flex gap-6">
        {/* Left tab nav */}
        <div className="w-44 shrink-0 flex flex-col gap-0.5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-2.5 h-10 px-3 rounded-xl text-[12px] font-mono transition-all text-left border"
              style={{
                background:   activeTab === t.id ? PRIMARY + '12' : 'transparent',
                borderColor:  activeTab === t.id ? PRIMARY + '35' : 'transparent',
                borderLeftWidth: activeTab === t.id ? 2 : 1,
                borderLeftColor: activeTab === t.id ? PRIMARY : 'transparent',
                color:        activeTab === t.id ? PRIMARY : MUTED,
              }}
            >
              <t.icon style={{ width: 13, height: 13 }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0 rounded-2xl border p-6 space-y-6" style={{ background: SURFACE, borderColor: BORDER }}>
          {activeTab === 'profile' && (
            <>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest mb-4" style={{ color: DIM }}>Operator Profile</div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl font-bold font-mono"
                    style={{ background: '#0c1828', borderColor: BORDER, color: PRIMARY }}>
                    {user?.name?.charAt(0).toUpperCase() ?? 'A'}
                  </div>
                  <div>
                    <div className="text-sm font-bold font-mono" style={{ color: BRIGHT }}>{user?.name ?? 'Demo Analyst'}</div>
                    <div className="text-[10px] font-mono mt-0.5" style={{ color: MUTED }}>{user?.email ?? 'analyst@sentinel.cni'}</div>
                    <div className="text-[9px] font-mono px-2 py-0.5 rounded border mt-1 inline-block"
                      style={{ borderColor: PRIMARY + '40', color: PRIMARY, background: PRIMARY + '10' }}>
                      LEVEL 4 ACCESS
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <HudInput label="Full Name" value={user?.name ?? 'Demo Analyst'} />
                <HudInput label="Email Address" value={user?.email ?? 'analyst@sentinel.cni'} type="email" />
                <HudInput label="Organization" value="Critical Infrastructure Defense" readOnly />
                <HudInput label="Role" value={user?.role ?? 'analyst'} readOnly />
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <div className="text-[9px] font-mono uppercase tracking-widest mb-4" style={{ color: DIM }}>Security Configuration</div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <HudInput label="Current Password" value="••••••••••" type="password" />
                <HudInput label="New Password" value="" type="password" />
              </div>
              <div className="space-y-0 rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
                {[
                  { label: 'Two-Factor Authentication', desc: 'Require TOTP on every login', on: true },
                  { label: 'Session Timeout (15 min)', desc: 'Auto-logout after inactivity', on: true },
                  { label: 'Audit Login Events', desc: 'Log all authentication attempts', on: true },
                  { label: 'IP Allowlist', desc: 'Restrict to trusted IP ranges', on: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b last:border-b-0" style={{ borderColor: BORDER }}>
                    <div>
                      <div className="text-[12px] font-mono" style={{ color: BRIGHT }}>{item.label}</div>
                      <div className="text-[10px] font-mono" style={{ color: MUTED }}>{item.desc}</div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded border font-bold"
                      style={{ color: item.on ? PRIMARY : MUTED, borderColor: item.on ? PRIMARY + '40' : BORDER, background: item.on ? PRIMARY + '10' : 'transparent' }}>
                      {item.on ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <div className="text-[9px] font-mono uppercase tracking-widest mb-4" style={{ color: DIM }}>Alert & Notification Preferences</div>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
                <div className="px-4">
                  <HudToggle label="Critical Severity Alerts" description="Immediate alerts for critical incidents" active={notifs.critical} onChange={() => setNotifs(p => ({...p, critical: !p.critical}))} />
                  <HudToggle label="High Severity Alerts" description="Notifications for high-priority incidents" active={notifs.high} onChange={() => setNotifs(p => ({...p, high: !p.high}))} />
                  <HudToggle label="Medium Severity Alerts" description="Informational medium-risk alerts" active={notifs.medium} onChange={() => setNotifs(p => ({...p, medium: !p.medium}))} />
                  <HudToggle label="Email Notifications" description="Send alerts to registered email address" active={notifs.email} onChange={() => setNotifs(p => ({...p, email: !p.email}))} />
                  <HudToggle label="Slack Integration" description="Forward incidents to Slack channel" active={notifs.slack} onChange={() => setNotifs(p => ({...p, slack: !p.slack}))} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'api' && (
            <>
              <div className="text-[9px] font-mono uppercase tracking-widest mb-4" style={{ color: DIM }}>API Key Management</div>
              {[
                { label: 'Production API Key', key: 'sk-sent-prod-a3f8c2e1d4b7f9...', active: true,  created: '2025-01-15' },
                { label: 'Development API Key', key: 'sk-sent-dev-b9c3e7d2a8f1c5...',  active: false, created: '2025-03-22' },
              ].map((k, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-4 rounded-xl border mb-3"
                  style={{ background: '#040d1a', borderColor: BORDER }}>
                  <div>
                    <div className="text-[11px] font-bold font-mono" style={{ color: BRIGHT }}>{k.label}</div>
                    <div className="text-[10px] font-mono mt-1" style={{ color: DIM, letterSpacing: '0.05em' }}>{k.key}</div>
                    <div className="text-[9px] font-mono mt-0.5" style={{ color: DIM }}>Created: {k.created}</div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border font-bold shrink-0"
                    style={{ color: k.active ? PRIMARY : MUTED, borderColor: k.active ? PRIMARY + '40' : BORDER, background: k.active ? PRIMARY + '10' : 'transparent' }}>
                    {k.active ? 'ACTIVE' : 'REVOKED'}
                  </span>
                </div>
              ))}
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-widest transition-all hover:brightness-110"
                style={{ borderColor: PRIMARY + '40', color: PRIMARY, background: PRIMARY + '10' }}>
                + Generate New Key
              </button>
            </>
          )}

          {activeTab === 'organization' && (
            <>
              <div className="text-[9px] font-mono uppercase tracking-widest mb-4" style={{ color: DIM }}>Organization Configuration</div>
              <div className="grid grid-cols-2 gap-4">
                <HudInput label="Organization Name" value="Critical Infrastructure Defense" />
                <HudInput label="Domain" value="sentinel.cni" readOnly />
                <HudInput label="SIEM Integration" value="Splunk Enterprise 9.x" />
                <HudInput label="SOAR Platform" value="Palo Alto XSOAR" />
              </div>
              <div className="mt-4 p-4 rounded-xl border" style={{ borderColor: WARN + '30', background: WARN + '08' }}>
                <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: WARN }}>Data Retention Policy</div>
                <div className="text-[11px] font-mono" style={{ color: MUTED }}>Event data is retained for 90 days. Incident records kept for 365 days per compliance policy.</div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
