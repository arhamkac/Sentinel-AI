import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Shield, Bell, Key, Radio, Save } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '@/components/ui'
import { useAuthStore } from '@/stores/auth.store'

const TABS = [
  { id: 'profile',        label: 'Profile',       icon: User },
  { id: 'security',       label: 'Security',      icon: Shield },
  { id: 'notifications',  label: 'Notifications', icon: Bell },
  { id: 'api',            label: 'API Keys',       icon: Key },
  { id: 'organization',   label: 'Organization',  icon: Radio },
]

export function SettingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <PageContainer title="Settings" description="Manage your account and platform preferences">
      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0 flex flex-col gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer ${
                activeTab === id
                  ? 'bg-primary/10 text-primary border border-primary/15'
                  : 'text-[#8FA3BF] hover:bg-surface-2 hover:text-[#E2E8F0] border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0"
        >
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[#060B16] text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#E2E8F0]">{user?.name ?? 'Analyst'}</p>
                    <p className="text-xs text-[#3d566e]">{user?.email ?? 'analyst@sentinel.ai'}</p>
                    <Badge variant="primary" className="mt-1 capitalize">{user?.role ?? 'analyst'}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Name" defaultValue={user?.name ?? ''} />
                  <Input label="Email" type="email" defaultValue={user?.email ?? ''} />
                </div>
                <Button onClick={handleSave} loading={false} variant={saved ? 'secondary' : 'default'}>
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-[#E2E8F0]">Change Password</h3>
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <Input label="New Password" type="password" placeholder="Min 8 characters" />
                  <Input label="Confirm New Password" type="password" placeholder="Repeat new password" />
                  <Button size="sm">Update Password</Button>
                </div>
                <div className="border-t border-border pt-4 flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-[#E2E8F0]">Two-Factor Authentication</h3>
                  <p className="text-xs text-[#3d566e]">Add an extra layer of security to your account.</p>
                  <Button variant="outline" size="sm">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Critical incident alerts', desc: 'Immediate alerts for critical severity incidents', enabled: true },
                    { label: 'New incident created', desc: 'Notify when a new incident is automatically created', enabled: true },
                    { label: 'AI investigation complete', desc: 'Alert when AI finishes analyzing an incident', enabled: false },
                    { label: 'Weekly security digest', desc: 'Weekly summary of security posture and top threats', enabled: true },
                    { label: 'Threat intelligence updates', desc: 'New IOCs and threat actor activity', enabled: false },
                  ].map(({ label, desc, enabled }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm text-[#E2E8F0] font-medium">{label}</p>
                        <p className="text-xs text-[#3d566e]">{desc}</p>
                      </div>
                      <div className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${enabled ? 'bg-primary' : 'bg-border'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow m-0.5 transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card>
              <CardHeader><CardTitle>API Keys</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-bg-2 border border-border">
                  <div>
                    <p className="text-sm text-[#E2E8F0] font-semibold">Production Key</p>
                    <code className="text-xs text-[#3d566e] font-mono">sk-sentinel-••••••••••••••••••••••••••••••••</code>
                  </div>
                  <Badge variant="success" dot>Active</Badge>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-[#E2E8F0]">OpenRouter Configuration</h3>
                  <Input label="OpenRouter API Key" type="password" placeholder="sk-or-v1-••••" hint="Used for AI-powered threat analysis and narrative generation" />
                </div>
                <Button size="sm">Save API Keys</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'organization' && (
            <Card>
              <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Organization Name" defaultValue="Acme Corp" />
                  <Input label="Industry" defaultValue="Financial Services" />
                  <Input label="Primary Contact" defaultValue={user?.email ?? ''} />
                  <Input label="Time Zone" defaultValue="UTC+0" />
                </div>
                <div className="border-t border-border pt-4 flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-[#E2E8F0]">Team Members</h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { name: 'Alice Johnson', role: 'admin',   email: 'alice@acme.com' },
                      { name: 'Bob Wilson',    role: 'analyst', email: 'bob@acme.com' },
                      { name: 'Carol Davis',   role: 'viewer',  email: 'carol@acme.com' },
                    ].map(({ name, role, email }) => (
                      <div key={email} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[#060B16] text-xs font-bold font-mono">
                            {name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm text-[#E2E8F0] font-medium">{name}</p>
                            <p className="text-xs text-[#3d566e] font-mono">{email}</p>
                          </div>
                        </div>
                        <Badge variant={role === 'admin' ? 'primary' : role === 'analyst' ? 'warning' : 'muted'} className="capitalize">
                          {role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Save Organization
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </PageContainer>
  )
}
