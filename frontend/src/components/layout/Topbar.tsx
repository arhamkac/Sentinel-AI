import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, Sparkles, Menu, LogOut, User, Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useEventsStore } from '@/stores/events.store'
import { useUIStore } from '@/stores/ui.store'

export function Topbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { liveEvents } = useEventsStore()
  const { toggleMobileSidebar } = useUIStore()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const criticalCount = liveEvents.filter(e => e.severity === 'critical').length
  const hasCritical = criticalCount > 0
  const recentAlerts = liveEvents.slice(0, 5)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header
      className="flex items-center shrink-0 relative z-20"
      style={{
        height: 56,
        paddingLeft: 'clamp(16px, 4vw, 40px)',
        paddingRight: 'clamp(16px, 4vw, 40px)',
        gap: 12,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* ── Mobile hamburger ── */}
      <button
        className="md:hidden flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
        style={{
          width: 36, height: 36,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
        onClick={toggleMobileSidebar}
        aria-label="Open navigation menu"
      >
        <Menu style={{ width: 18, height: 18 }} />
      </button>

      {/* ── Search ── */}
      <button
        onClick={() => navigate('/incidents')}
        className="flex items-center cursor-pointer transition-colors hover:bg-[var(--bg-inset)] hover:border-[var(--primary-dim)]"
        style={{
          width: 'auto',
          maxWidth: 280,
          flex: '1 1 auto',
          height: 36,
          padding: '0 12px',
          gap: 8,
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
        aria-label="Search incidents and assets"
      >
        <Search style={{ width: 14, height: 14, color: 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{
          fontSize: 13,
          color: 'var(--text-disabled)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          Search incidents, assets...
        </span>
        <span className="hidden sm:inline" style={{
          marginLeft: 'auto',
          fontSize: 11,
          color: 'var(--text-disabled)',
          background: 'var(--bg-inset)',
          padding: '1px 6px',
          borderRadius: 4,
          border: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}>
          ⌘K
        </span>
      </button>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── AI Status ── */}
      <div
        className="hidden md:flex items-center"
        style={{
          gap: 6,
          height: 32,
          padding: '0 10px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--primary-bg)',
          border: '1px solid var(--primary-ring)',
        }}
      >
        <Sparkles style={{ width: 13, height: 13, color: 'var(--primary)' }} />
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: 'var(--primary)',
        }}>
          AI Online
        </span>
      </div>

      {/* ── Notifications ── */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false) }}
          className="relative flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:opacity-80 active:scale-95"
          style={{
            width: 36, height: 36,
            background: hasCritical ? 'var(--danger-bg)' : 'var(--bg-surface)',
            border: `1px solid ${hasCritical ? 'var(--danger-ring)' : 'var(--border)'}`,
            color: hasCritical ? 'var(--danger)' : 'var(--text-muted)',
          }}
          aria-label={`Notifications${hasCritical ? `, ${criticalCount} critical alerts` : ''}`}
          aria-expanded={notifOpen}
        >
          <Bell style={{ width: 16, height: 16 }} />
          {hasCritical && (
            <span
              className="absolute flex items-center justify-center rounded-full"
              style={{
                top: -4, right: -4,
                minWidth: 18, height: 18,
                background: 'var(--danger)',
                color: 'var(--bg-base)',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {criticalCount}
            </span>
          )}
        </button>

        {/* Notification dropdown */}
        {notifOpen && (
          <div
            className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden"
            style={{
              width: 320,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Notifications
              </p>
              {hasCritical && (
                <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>
                  {criticalCount} critical alert{criticalCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {recentAlerts.length > 0 ? (
                recentAlerts.map((evt, i) => (
                  <div
                    key={evt.id ?? i}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 12,
                    }}
                    className="hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {evt.description?.slice(0, 60) ?? 'Security event detected'}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                      {evt.hostname} · {evt.severity}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  No recent alerts
                </div>
              )}
            </div>
            <div
              style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}
            >
              <button
                onClick={() => { navigate('/incidents'); setNotifOpen(false) }}
                style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                View all incidents →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="hidden sm:block" style={{ width: 1, height: 24, background: 'var(--border)' }} />

      {/* ── User Menu ── */}
      <div ref={userMenuRef} className="relative">
        <button
          onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false) }}
          className="flex items-center gap-3 cursor-pointer p-1 rounded-lg transition-colors hover:bg-[var(--bg-inset)] active:scale-95"
          aria-label="User menu"
          aria-expanded={userMenuOpen}
        >
          <div className="flex-col items-end hidden sm:flex">
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: '16px' }}>
              {user?.name || 'Admin'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: '14px', textTransform: 'capitalize' }}>
              {user?.role || 'SOC Analyst'}
            </span>
          </div>
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 36, height: 36,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: 14, fontWeight: 600,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </button>

        {/* User dropdown */}
        {userMenuOpen && (
          <div
            className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden"
            style={{
              width: 200,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {user?.email || 'user@sentinel.ai'}
              </p>
            </div>
            {[
              { icon: User, label: 'Profile', action: () => { navigate('/settings'); setUserMenuOpen(false) } },
              { icon: Settings, label: 'Settings', action: () => { navigate('/settings'); setUserMenuOpen(false) } },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-colors"
                style={{
                  padding: '10px 16px',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <item.icon style={{ width: 14, height: 14 }} />
                {item.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 hover:bg-[var(--danger-bg)] transition-colors"
                style={{
                  padding: '10px 16px',
                  fontSize: 13,
                  color: 'var(--danger)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <LogOut style={{ width: 14, height: 14 }} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
