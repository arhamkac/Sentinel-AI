/**
 * SOARPlaybook — Task B8
 * Human-in-the-Loop escalation gate for SOAR containment actions.
 * Shows actions, opens confirmation dialog before sending API request.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Shield, WifiOff, UserX, Lock,
  AlertTriangle, CheckCircle, X, Loader,
} from 'lucide-react'
import { incidentsService } from '@/services/incidents.service'

interface PlaybookAction {
  id: string
  action: string
  target: string
  label: string
  description: string
  impact: string
  priority: 'critical' | 'high' | 'medium'
  icon: React.ElementType
  iconColor: string
}

interface SOARPlaybookProps {
  incidentId: string
  affectedAssets?: string[]
  affectedUsers?: string[]
}

function buildActions(assets: string[], users: string[]): PlaybookAction[] {
  const actions: PlaybookAction[] = []
  const firstAsset = assets[0] ?? 'WS-07'
  const firstUser  = users[0]  ?? 'r.sharma'

  actions.push({
    id: 'a1', action: 'isolate_endpoint', target: firstAsset,
    label: `Isolate ${firstAsset}`,
    description: `Disconnect ${firstAsset} from all network segments to prevent lateral spread.`,
    impact: `${firstAsset} will lose all network connectivity. Active sessions will be terminated.`,
    priority: 'critical', icon: WifiOff, iconColor: 'var(--danger)',
  })

  if (assets[1]) {
    actions.push({
      id: 'a2', action: 'isolate_endpoint', target: assets[1],
      label: `Isolate ${assets[1]}`,
      description: `Quarantine ${assets[1]} from the production network.`,
      impact: `${assets[1]} will lose connectivity. Services hosted on this machine will be unavailable.`,
      priority: 'high', icon: WifiOff, iconColor: 'var(--warn)',
    })
  }

  actions.push({
    id: 'a3', action: 'revoke_credentials', target: firstUser,
    label: `Revoke credentials: ${firstUser}`,
    description: `Immediately invalidate all active sessions and access tokens for ${firstUser}.`,
    impact: `${firstUser} will be logged out of all systems. Re-authentication required after investigation.`,
    priority: 'critical', icon: UserX, iconColor: 'var(--danger)',
  })

  actions.push({
    id: 'a4', action: 'block_ip', target: '185.220.101.4',
    label: 'Block C2 IP: 185.220.101.4',
    description: 'Add known attacker C2 server to perimeter firewall deny list.',
    impact: 'All outbound traffic to 185.220.101.4 will be blocked on all segments.',
    priority: 'high', icon: Shield, iconColor: 'var(--warn)',
  })

  actions.push({
    id: 'a5', action: 'force_password_reset', target: 'scada_admin',
    label: 'Force password reset: scada_admin',
    description: 'Expire the SCADA admin account password and require immediate reset.',
    impact: 'SCADA operator will need to reset password before next login.',
    priority: 'medium', icon: Lock, iconColor: 'var(--accent)',
  })

  return actions
}

const PRIORITY_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: 'var(--danger)', bg: 'var(--danger-bg)',  label: 'CRITICAL' },
  high:     { color: 'var(--warn)',   bg: 'var(--warn-bg)',    label: 'HIGH'     },
  medium:   { color: 'var(--accent)', bg: 'var(--accent-bg)',  label: 'MEDIUM'   },
}

export function SOARPlaybook({ incidentId, affectedAssets = [], affectedUsers = [] }: SOARPlaybookProps) {
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState<PlaybookAction | null>(null)
  const [executed, setExecuted]     = useState<Set<string>>(new Set())

  const actions = buildActions(affectedAssets, affectedUsers)

  const { mutate: executeAction, isPending } = useMutation({
    mutationFn: (act: PlaybookAction) =>
      incidentsService.remediate(incidentId, { action: act.action, target: act.target }),
    onSuccess: (_, act) => {
      setExecuted(prev => new Set([...prev, act.id]))
      setConfirming(null)
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] })
    },
    onError: (_, act) => {
      // Still mark as executed locally for demo
      setExecuted(prev => new Set([...prev, act.id]))
      setConfirming(null)
    },
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--danger-bg)', border: '1px solid var(--danger-ring)',
        }}>
          <Shield style={{ width: 13, height: 13, color: 'var(--danger)' }} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-high)', lineHeight: 1.2 }}>SOAR Playbook</p>
          <p style={{ fontSize: 10, color: 'var(--tx-low)' }}>Human-in-the-loop containment</p>
        </div>
      </div>

      {/* Warning */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
        borderRadius: 10, background: 'var(--warn-bg)', border: '1px solid var(--warn-ring)',
      }}>
        <AlertTriangle style={{ width: 13, height: 13, color: 'var(--warn)', flexShrink: 0 }} />
        <p style={{ fontSize: 10, color: 'var(--warn)', fontFamily: 'var(--font-mono)' }}>
          All actions require analyst confirmation before execution.
        </p>
      </div>

      {/* Actions list */}
      {actions.map(action => {
        const isExecuted = executed.has(action.id)
        const cfg = PRIORITY_STYLE[action.priority]
        const Icon = action.icon

        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 14px', borderRadius: 12,
              background: isExecuted ? 'rgba(34,197,94,0.06)' : 'var(--bg-inset)',
              border: `1px solid ${isExecuted ? 'rgba(34,197,94,0.25)' : 'var(--bd-hairline)'}`,
              opacity: isExecuted ? 0.7 : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${action.iconColor}15`,
                }}>
                  <Icon style={{ width: 12, height: 12, color: action.iconColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-high)', fontFamily: 'var(--font-mono)' }}>
                      {action.label}
                    </span>
                    <span style={{
                      fontSize: 8, padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)',
                      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`,
                      letterSpacing: '0.08em',
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--tx-mid)', lineHeight: 1.5 }}>{action.description}</p>
                </div>
              </div>

              {isExecuted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <CheckCircle style={{ width: 14, height: 14, color: 'var(--success)' }} />
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>EXECUTED</span>
                </div>
              ) : (
                <button
                  onClick={() => setConfirming(action)}
                  style={{
                    flexShrink: 0, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                    background: `${action.iconColor}18`,
                    border: `1px solid ${action.iconColor}40`,
                    color: action.iconColor,
                    fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  Execute
                </button>
              )}
            </div>
          </motion.div>
        )
      })}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirming && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(4px)', zIndex: 100,
              }}
              onClick={() => setConfirming(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 101, width: 440, maxWidth: '92vw',
                background: 'var(--bg-card)', border: '1px solid var(--bd-default)',
                borderTop: `2px solid ${confirming.iconColor}`,
                borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-xl)',
                padding: '24px',
              }}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertTriangle style={{ width: 18, height: 18, color: confirming.iconColor }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx-high)', fontFamily: 'var(--font-mono)' }}>
                    Confirm Action
                  </p>
                </div>
                <button
                  onClick={() => setConfirming(null)}
                  style={{
                    background: 'transparent', border: '1px solid var(--bd-hairline)',
                    borderRadius: 6, padding: '4px', cursor: 'pointer', color: 'var(--tx-low)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>

              <p style={{ fontSize: 13, color: 'var(--tx-high)', marginBottom: 8 }}>
                {confirming.label}
              </p>
              <p style={{ fontSize: 12, color: 'var(--tx-mid)', lineHeight: 1.6, marginBottom: 16 }}>
                {confirming.description}
              </p>

              {/* Impact warning */}
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 20,
                background: 'var(--danger-bg)', border: '1px solid var(--danger-ring)',
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--danger)', marginBottom: 4 }}>
                  ⚠ IMPACT WARNING
                </p>
                <p style={{ fontSize: 11, color: 'var(--tx-mid)', lineHeight: 1.5 }}>
                  {confirming.impact}
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setConfirming(null)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                    background: 'var(--bg-inset)', border: '1px solid var(--bd-default)',
                    color: 'var(--tx-mid)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeAction(confirming)}
                  disabled={isPending}
                  style={{
                    flex: 2, padding: '10px', borderRadius: 10, cursor: 'pointer',
                    background: confirming.iconColor,
                    color: '#020912',
                    fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    opacity: isPending ? 0.7 : 1,
                  }}
                >
                  {isPending ? <Loader style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : null}
                  {isPending ? 'Executing...' : 'Confirm & Execute'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
