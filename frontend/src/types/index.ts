export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed'

export type EventType =
  | 'process_creation'
  | 'network_connection'
  | 'file_modification'
  | 'registry_change'
  | 'authentication'
  | 'privilege_escalation'
  | 'lateral_movement'
  | 'data_exfiltration'
  | 'command_and_control'
  | 'persistence'

export type MitreTactic =
  | 'initial_access'
  | 'execution'
  | 'persistence'
  | 'privilege_escalation'
  | 'defense_evasion'
  | 'credential_access'
  | 'discovery'
  | 'lateral_movement'
  | 'collection'
  | 'command_and_control'
  | 'exfiltration'
  | 'impact'

// ─── Auth ───────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'analyst' | 'viewer'
  avatar?: string
  organization_id: string
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

// ─── Security Events ─────────────────────────────────────────────
export interface SecurityEvent {
  id: string
  event_type: EventType
  severity: Severity
  source_ip?: string
  destination_ip?: string
  hostname: string
  user?: string
  process?: string
  description: string
  raw_data?: Record<string, unknown>
  anomaly_score?: number
  mitre_technique_id?: string
  mitre_technique_name?: string
  incident_id?: string
  timestamp: string
  created_at: string
}

// ─── Incidents ───────────────────────────────────────────────────
export interface Incident {
  id: string
  title: string
  description: string
  severity: Severity
  status: IncidentStatus
  threat_narrative?: string
  predicted_next_steps?: PredictedStep[]
  affected_assets: string[]
  affected_users: string[]
  mitre_techniques: MitreTechniqueRef[]
  event_count: number
  assigned_to?: string
  organization_id: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface PredictedStep {
  technique_id: string
  technique_name: string
  probability: number
  reasoning: string
  time_estimate: string
  indicators_to_watch: string[]
}

export interface MitreTechniqueRef {
  technique_id: string
  technique_name: string
  tactic: MitreTactic
  confidence: number
}

// ─── Attack Graph ────────────────────────────────────────────────
export interface AttackNode {
  id: string
  type: 'host' | 'user' | 'process' | 'network' | 'technique' | 'objective'
  label: string
  severity?: Severity
  mitre_id?: string
  timestamp?: string
  metadata?: Record<string, unknown>
}

export interface AttackEdge {
  id: string
  source: string
  target: string
  label?: string
  technique?: string
  timestamp?: string
}

export interface AttackGraph {
  incident_id: string
  nodes: AttackNode[]
  edges: AttackEdge[]
  generated_at: string
}

// ─── Threat Intelligence ─────────────────────────────────────────
export interface ThreatIndicator {
  id: string
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'cve'
  value: string
  severity: Severity
  confidence: number
  tags: string[]
  source: string
  description?: string
  first_seen: string
  last_seen: string
}

// ─── MITRE ───────────────────────────────────────────────────────
export interface MitreTechnique {
  technique_id: string
  technique_name: string
  tactic: MitreTactic
  description: string
  subtechniques: string[]
  platforms: string[]
  detection: string
  mitigation: string
}

// ─── Reports ─────────────────────────────────────────────────────
export interface IncidentReport {
  id: string
  incident_id: string
  title: string
  executive_summary: string
  technical_details: string
  timeline: TimelineEvent[]
  recommendations: string[]
  generated_at: string
  generated_by: string
}

export interface TimelineEvent {
  timestamp: string
  description: string
  event_type: EventType
  severity: Severity
}

// ─── Dashboard Stats ─────────────────────────────────────────────
export interface DashboardStats {
  total_events_today: number
  total_events_change: number
  active_incidents: number
  active_incidents_change: number
  critical_alerts: number
  critical_alerts_change: number
  mean_time_to_detect: number
  mtd_change: number
  security_score: number
  risk_level: 'critical' | 'high' | 'medium' | 'low'
  events_by_hour: { hour: string; count: number }[]
  events_by_type: { type: string; count: number }[]
  incidents_by_severity: { severity: Severity; count: number }[]
}

// ─── Pagination ──────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

// ─── API Error ───────────────────────────────────────────────────
export interface ApiError {
  detail: string
  status_code?: number
}

// ─── Simulator ───────────────────────────────────────────────────
export interface SimulationScenario {
  id: string
  name: string
  description: string
  attack_type: string
  severity: Severity
  estimated_duration: string
  techniques: string[]
  target_profile: string
}

export interface SimulationRun {
  id: string
  scenario_id: string
  scenario_name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  events_generated: number
  incident_id?: string
  started_at?: string
  completed_at?: string
}
