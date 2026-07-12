"""
IT/OT Cross-Plane Incident Correlation Engine (Task A6)
Links high-risk events to existing incidents within a 15-minute window,
or creates new Incident records when no matching context exists.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import SecurityEvent
from app.models.incident import Incident

logger = logging.getLogger(__name__)

CORRELATION_WINDOW_MINUTES = 15
HIGH_RISK_SEVERITIES = {"high", "critical"}
HIGH_RISK_SCORE_THRESHOLD = 0.65


async def correlate_event(event: SecurityEvent, db: AsyncSession) -> Optional[str]:
    """
    Check if event belongs to an existing incident (same host/user, within 15 min window).
    If yes, links the event to that incident and returns the incident_id.
    If no match, creates a new Incident and returns its id.
    Only processes high/critical severity or anomaly_score > threshold.
    Returns None for low-risk events.
    """
    severity = getattr(event, "severity", "low")
    score = getattr(event, "anomaly_score", 0.0) or 0.0

    if severity not in HIGH_RISK_SEVERITIES and score < HIGH_RISK_SCORE_THRESHOLD:
        return None  # Not worth correlating

    org_id = event.organization_id
    hostname = event.hostname
    user = event.user
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(minutes=CORRELATION_WINDOW_MINUTES)

    # ── Query active incidents in org within the correlation window ──────────
    q = select(Incident).where(
        Incident.organization_id == org_id,
        Incident.status.notin_(["resolved", "closed"]),
        Incident.created_at >= window_start,
    )
    result = await db.execute(q)
    active_incidents = result.scalars().all()

    # ── Try to match by hostname or user context ─────────────────────────────
    matched_incident: Optional[Incident] = None
    for inc in active_incidents:
        # Check hostname overlap
        affected_assets = inc.affected_assets or []
        asset_ids = [
            a.get("id", a) if isinstance(a, dict) else a
            for a in affected_assets
        ]
        if hostname and hostname in asset_ids:
            matched_incident = inc
            break

        # Check user overlap
        affected_users = inc.affected_users or []
        user_names = [
            u.get("username", u) if isinstance(u, dict) else u
            for u in affected_users
        ]
        if user and user in user_names:
            matched_incident = inc
            break

    if matched_incident:
        # Link event to this incident and update event count
        incident_id = matched_incident.id
        matched_incident.event_count = (matched_incident.event_count or 0) + 1

        # Escalate severity if needed
        severity_rank = {"low": 0, "medium": 1, "high": 2, "critical": 3}
        if severity_rank.get(severity, 0) > severity_rank.get(matched_incident.severity, 0):
            matched_incident.severity = severity
            matched_incident.status = "investigating"

        # Append hostname to affected_assets if not already there
        if hostname:
            existing = [
                a.get("id", a) if isinstance(a, dict) else a
                for a in (matched_incident.affected_assets or [])
            ]
            if hostname not in existing:
                assets = list(matched_incident.affected_assets or [])
                assets.append({"id": hostname, "type": "host"})
                matched_incident.affected_assets = assets

        await db.flush()
        logger.info(f"Event {event.id} correlated to existing incident {incident_id}")
        return incident_id

    # ── No match — create a new incident ─────────────────────────────────────
    technique_id = getattr(event, "mitre_technique_id", None)
    technique_name = getattr(event, "mitre_technique_name", None)

    new_incident = Incident(
        title=f"Automated Detection: {event.description[:80]}",
        description=event.description,
        severity=severity,
        status="open",
        organization_id=org_id,
        is_simulated=getattr(event, "is_simulated", False),
        event_count=1,
        affected_assets=[{"id": hostname, "type": "host"}] if hostname else [],
        affected_users=[{"username": user}] if user else [],
        mitre_techniques=[
            {"id": technique_id, "name": technique_name}
        ] if technique_id else [],
    )
    db.add(new_incident)
    await db.flush()
    logger.info(f"New incident {new_incident.id} created for event {event.id} (host={hostname})")
    return new_incident.id
