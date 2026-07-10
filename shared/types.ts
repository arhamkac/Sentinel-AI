// Shared type definitions used across frontend and documentation

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';

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
  | 'endpoint'
  | 'network'
  | 'scada'
  | 'correlation';

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
  | 'impact';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}
