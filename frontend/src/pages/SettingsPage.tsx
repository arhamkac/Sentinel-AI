import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Bell, Key, Radio, Save, CheckCircle2, RefreshCw } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/auth.store'
import { PageHeader } from '@/components/common'

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User   },
  { id: 'security',      label: 'Security',      icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell   },
  { id: 'api',           label: 'API Keys',      icon: Key    },
  { id: 'organization',  label: 'Organization',  icon: Radio  },
]

interface SettingsInputProps {
  label: string
  value: string
  onChange?: (val: string) => void
  type?: string
  readOnly?: boolean
}

function SettingsInput({ label, value, onChange, type = 'text', readOnly }: SettingsInputProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        readOnly={readOnly}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
          readOnly 
            ? 'bg-[var(--bg-inset)] border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed' 
            : 'bg-[var(--bg-inset)] border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--primary-dim)] hover:border-[var(--border-strong)]'
        }`}
      />
    </div>
  )
}

function SettingsToggle({ label, description, active, onChange }: {
  label: string; description: string; active: boolean; onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-b-0">
      <div>
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">{description}</div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border ${
          active 
            ? 'bg-[var(--primary-bg)] border-[var(--primary-ring)]' 
            : 'bg-[var(--bg-inset)] border-[var(--border)]'
        }`}
      >
        <span 
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
            active ? 'left-[22px] bg-[var(--primary)]' : 'left-[3px] bg-[var(--text-muted)]'
          }`} 
        />
      </button>
    </div>
  )
}

export function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Controlled inputs state
  const [fullName, setFullName] = useState(user?.name ?? 'Demo Analyst')
  const [emailAddress, setEmailAddress] = useState(user?.email ?? 'analyst@sentinel.cni')
  const [orgName, setOrgName] = useState('Critical Infrastructure Defense')
  const [siem, setSiem] = useState('Splunk Enterprise 9.x')
  const [soar, setSoar] = useState('Palo Alto XSOAR')
  const [currentPassword, setCurrentPassword] = useState('••••••••••')
  const [newPassword, setNewPassword] = useState('')

  // Stateful Notification settings
  const [notifs, setNotifs] = useState({ critical: true, high: true, medium: false, email: true, slack: false })

  // Stateful API Key Management
  const [apiKeys, setApiKeys] = useState([
    { label: 'Production API Key', key: 'sk-sent-prod-a3f8c2e1d4b7f9...', active: true,  created: '2025-01-15' },
    { label: 'Development API Key', key: 'sk-sent-dev-b9c3e7d2a8f1c5...',  active: false, created: '2025-03-22' },
  ])

  const handleGenerateKey = () => {
    const keySuffix = Array.from({ length: 14 }, () => Math.random().toString(36)[2]).join('')
    const newKey = {
      label: 'Development API Key',
      key: `sk-sent-dev-${keySuffix}...`,
      active: true,
      created: new Date().toISOString().split('T')[0]
    }
    setApiKeys(prev => [...prev, newKey])
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      // Save profile name/email back to auth store
      if (user) {
        setUser({
          ...user,
          name: fullName,
          email: emailAddress,
        })
      }
      setTimeout(() => setSaved(false), 2500)
    }, 800)
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <PageHeader
        title="System Settings"
        description="Manage account, security, and platform preferences."
        actions={
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 ${
              saved 
                ? 'bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-ring)]' 
                : 'bg-[var(--primary)] text-[var(--bg-base)] hover:brightness-110'
            }`}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </motion.button>
        }
      />

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* ── Tabs Sidebar ── */}
        <div className="w-full md:w-56 shrink-0 flex flex-col gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 h-10 px-4 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                activeTab === t.id 
                  ? 'bg-[var(--bg-hover)] text-[var(--primary)] font-semibold' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Settings Content ── */}
        <Card className="flex-1 min-w-0">
          <CardContent className="p-6 sm:p-8">
            
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Operator Profile</h3>
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-inset)] border border-[var(--border)] flex items-center justify-center text-2xl font-bold text-[var(--primary)] select-none">
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-base font-bold text-[var(--text-primary)]">{fullName}</div>
                      <div className="text-sm text-[var(--text-muted)] mt-1">{emailAddress}</div>
                      <div className="mt-2 inline-flex text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--primary-bg)] text-[var(--primary)] border border-[var(--primary-ring)]">
                        Level 4 Access
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SettingsInput label="Full Name" value={fullName} onChange={setFullName} />
                  <SettingsInput label="Email Address" value={emailAddress} onChange={setEmailAddress} type="email" />
                  <SettingsInput label="Organization" value={orgName} readOnly />
                  <SettingsInput label="Role" value={user?.role ?? 'analyst'} readOnly />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Security Configuration</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <SettingsInput label="Current Password" value={currentPassword} onChange={setCurrentPassword} type="password" />
                    <SettingsInput label="New Password" value={newPassword} onChange={setNewPassword} type="password" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Access Policies</h3>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] px-4">
                    {[
                      { label: 'Two-Factor Authentication', desc: 'Require TOTP on every login', on: true },
                      { label: 'Session Timeout (15 min)', desc: 'Auto-logout after inactivity', on: true },
                      { label: 'Audit Login Events', desc: 'Log all authentication attempts', on: true },
                      { label: 'IP Allowlist', desc: 'Restrict to trusted IP ranges', on: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-b-0">
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</div>
                          <div className="text-xs text-[var(--text-muted)] mt-1">{item.desc}</div>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          item.on 
                            ? 'text-[var(--primary)] bg-[var(--primary-bg)] border-[var(--primary-ring)]' 
                            : 'text-[var(--text-muted)] bg-[var(--bg-surface)] border-[var(--border)]'
                        }`}>
                          {item.on ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-6">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Alert & Notification Preferences</h3>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] px-4">
                  <SettingsToggle label="Critical Severity Alerts" description="Immediate alerts for critical incidents" active={notifs.critical} onChange={() => setNotifs(p => ({...p, critical: !p.critical}))} />
                  <SettingsToggle label="High Severity Alerts" description="Notifications for high-priority incidents" active={notifs.high} onChange={() => setNotifs(p => ({...p, high: !p.high}))} />
                  <SettingsToggle label="Medium Severity Alerts" description="Informational medium-risk alerts" active={notifs.medium} onChange={() => setNotifs(p => ({...p, medium: !p.medium}))} />
                  <SettingsToggle label="Email Notifications" description="Send alerts to registered email address" active={notifs.email} onChange={() => setNotifs(p => ({...p, email: !p.email}))} />
                  <SettingsToggle label="Slack Integration" description="Forward incidents to Slack channel" active={notifs.slack} onChange={() => setNotifs(p => ({...p, slack: !p.slack}))} />
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="flex flex-col gap-6">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">API Key Management</h3>
                <div className="flex flex-col gap-4">
                  {apiKeys.map((k, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-inset)]">
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">{k.label}</div>
                        <div className="text-xs font-mono text-[var(--text-secondary)] mt-1">{k.key}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Created: {k.created}</div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${
                        k.active 
                          ? 'text-[var(--primary)] bg-[var(--primary-bg)] border-[var(--primary-ring)]' 
                          : 'text-[var(--text-muted)] bg-[var(--bg-surface)] border-[var(--border)]'
                      }`}>
                        {k.active ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                  ))}
                  <button 
                    onClick={handleGenerateKey}
                    className="self-start px-4 py-2 rounded-md border border-[var(--primary-ring)] bg-[var(--primary-bg)] text-sm font-medium text-[var(--primary)] hover:brightness-110 transition-colors cursor-pointer"
                  >
                    + Generate New Key
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'organization' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Organization Configuration</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SettingsInput label="Organization Name" value={orgName} onChange={setOrgName} />
                    <SettingsInput label="Domain" value="sentinel.cni" readOnly />
                    <SettingsInput label="SIEM Integration" value={siem} onChange={setSiem} />
                    <SettingsInput label="SOAR Platform" value={soar} onChange={setSoar} />
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-[var(--warning-ring)] bg-[var(--warning-bg)]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--warning)] mb-1">Data Retention Policy</div>
                  <div className="text-sm text-[var(--text-secondary)]">Event data is retained for 90 days. Incident records kept for 365 days per compliance policy.</div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
        
      </div>
    </PageContainer>
  )
}
