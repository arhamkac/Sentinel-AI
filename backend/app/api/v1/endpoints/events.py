from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime, timedelta, timezone

from app.db.session import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.event import SecurityEvent
from app.models.incident import Incident
from pydantic import BaseModel

router = APIRouter()


class EventResponse(BaseModel):
    id: str
    event_type: str
    severity: str
    source_ip: str | None
    destination_ip: str | None
    source_port: int | None
    destination_port: int | None
    hostname: str
    user: str | None
    process: str | None
    description: str
    raw_data: dict | None
    anomaly_score: float | None
    mitre_technique_id: str | None
    mitre_technique_name: str | None
    incident_id: str | None
    organization_id: str
    is_simulated: bool
    timestamp: str

    class Config:
        from_attributes = True


class PaginatedEvents(BaseModel):
    items: List[EventResponse]
    total: int
    page: int
    page_size: int
    pages: int


@router.get("", response_model=PaginatedEvents)
async def list_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    search: Optional[str] = None,
    incident_id: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(SecurityEvent).where(SecurityEvent.organization_id == current_user.organization_id)

    if severity:
        query = query.where(SecurityEvent.severity == severity)
    if event_type:
        query = query.where(SecurityEvent.event_type == event_type)
    if incident_id:
        query = query.where(SecurityEvent.incident_id == incident_id)
    if search:
        query = query.where(SecurityEvent.description.ilike(f"%{search}%") | SecurityEvent.hostname.ilike(f"%{search}%"))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one() or 0

    # Paginate and fetch
    query = query.order_by(SecurityEvent.timestamp.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    events = result.scalars().all()

    pages = (total + page_size - 1) // page_size if total > 0 else 1

    items = [
        EventResponse(
            id=e.id,
            event_type=e.event_type,
            severity=e.severity,
            source_ip=e.source_ip,
            destination_ip=e.destination_ip,
            source_port=e.source_port,
            destination_port=e.destination_port,
            hostname=e.hostname,
            user=e.user,
            process=e.process,
            description=e.description,
            raw_data=e.raw_data,
            anomaly_score=e.anomaly_score,
            mitre_technique_id=e.mitre_technique_id,
            mitre_technique_name=e.mitre_technique_name,
            incident_id=e.incident_id,
            organization_id=e.organization_id,
            is_simulated=e.is_simulated,
            timestamp=e.timestamp.isoformat()
        )
        for e in events
    ]

    return PaginatedEvents(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages
    )


@router.get("/stats/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    org_id = current_user.organization_id

    # Total events today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    events_today_query = select(func.count(SecurityEvent.id)).where(
        SecurityEvent.organization_id == org_id,
        SecurityEvent.timestamp >= today_start
    )
    events_today_result = await db.execute(events_today_query)
    total_events_today = events_today_result.scalar_one() or 0

    # Active incidents
    active_incidents_query = select(func.count(Incident.id)).where(
        Incident.organization_id == org_id,
        Incident.status != "resolved",
        Incident.status != "closed"
    )
    active_incidents_result = await db.execute(active_incidents_query)
    active_incidents = active_incidents_result.scalar_one() or 0

    # Critical alerts
    critical_alerts_query = select(func.count(SecurityEvent.id)).where(
        SecurityEvent.organization_id == org_id,
        SecurityEvent.severity == "critical"
    )
    critical_alerts_result = await db.execute(critical_alerts_query)
    critical_alerts = critical_alerts_result.scalar_one() or 0

    # Determine security score & risk level based on incidents and critical events
    if critical_alerts > 5 or active_incidents > 3:
        security_score = 42
        risk_level = "critical"
    elif critical_alerts > 0 or active_incidents > 0:
        security_score = 78
        risk_level = "high"
    else:
        security_score = 98
        risk_level = "low"

    # Events by hour (dummy or based on today)
    events_by_hour = []
    for h in range(12):
        hour_str = f"{(datetime.now() - timedelta(hours=11-h)).strftime('%H:00')}"
        events_by_hour.append({"hour": hour_str, "count": 10 + (h * 3) if h % 3 == 0 else 5})

    # Events by type
    events_by_type = [
        {"type": "endpoint", "count": 24},
        {"type": "network", "count": 45},
        {"type": "scada", "count": 12}
    ]

    # Incidents by severity
    incidents_by_severity = [
        {"severity": "critical", "count": 1 if active_incidents > 0 else 0},
        {"severity": "high", "count": 1 if active_incidents > 1 else 0},
        {"severity": "medium", "count": 0},
        {"severity": "low", "count": 0}
    ]

    return {
        "total_events_today": total_events_today,
        "total_events_change": 12,
        "active_incidents": active_incidents,
        "active_incidents_change": 1,
        "critical_alerts": critical_alerts,
        "critical_alerts_change": 0,
        "mean_time_to_detect": 45,  # 45 minutes
        "mtd_change": -5,
        "security_score": security_score,
        "risk_level": risk_level,
        "events_by_hour": events_by_hour,
        "events_by_type": events_by_type,
        "incidents_by_severity": incidents_by_severity
    }
