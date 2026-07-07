export const APP_NAME = 'Sentinel AI'
export const APP_VERSION = '1.0.0'
export const APP_TAGLINE = 'Autonomous Cyber Investigation Platform'

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low', 'info'] as const

export const INCIDENT_STATUSES = ['open', 'investigating', 'contained', 'resolved', 'closed'] as const

export const MITRE_TACTICS = [
  { id: 'TA0001', name: 'Initial Access',        key: 'initial_access' },
  { id: 'TA0002', name: 'Execution',             key: 'execution' },
  { id: 'TA0003', name: 'Persistence',           key: 'persistence' },
  { id: 'TA0004', name: 'Privilege Escalation',  key: 'privilege_escalation' },
  { id: 'TA0005', name: 'Defense Evasion',       key: 'defense_evasion' },
  { id: 'TA0006', name: 'Credential Access',     key: 'credential_access' },
  { id: 'TA0007', name: 'Discovery',             key: 'discovery' },
  { id: 'TA0008', name: 'Lateral Movement',      key: 'lateral_movement' },
  { id: 'TA0009', name: 'Collection',            key: 'collection' },
  { id: 'TA0011', name: 'C2',                    key: 'command_and_control' },
  { id: 'TA0010', name: 'Exfiltration',          key: 'exfiltration' },
  { id: 'TA0040', name: 'Impact',                key: 'impact' },
] as const

export const PAGE_SIZE = 20

export const WS_RECONNECT_DELAY = 3000
export const WS_MAX_RECONNECT = 5
