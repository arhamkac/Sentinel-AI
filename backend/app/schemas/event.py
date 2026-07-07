from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


class SecurityEventBase(BaseModel):
    event_type: str
    severity: str
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    hostname: str
    user: Optional[str] = None
    process: Optional[str] = None
    description: str
    raw_data: Optional[dict[str, Any]] = None
    mitre_technique_id: Optional[str] = None
    mitre_technique_name: Optional[str] = None
    timestamp: datetime


class SecurityEventCreate(SecurityEventBase):
    organization_id: str
    is_simulated: bool = False


class SecurityEventResponse(SecurityEventBase):
    id: str
    anomaly_score: Optional[float] = None
    incident_id: Optional[str] = None
    organization_id: str
    is_simulated: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_events_today: int
    total_events_change: float
    active_incidents: int
    active_incidents_change: float
    critical_alerts: int
    critical_alerts_change: float
    mean_time_to_detect: float
    mtd_change: float
    security_score: int
    risk_level: str
    events_by_hour: list[dict]
    events_by_type: list[dict]
    incidents_by_severity: list[dict]


class PaginatedEvents(BaseModel):
    items: list[SecurityEventResponse]
    total: int
    page: int
    page_size: int
    pages: int
