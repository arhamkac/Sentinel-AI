from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime, timezone

from app.db.session import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.incident import Incident
from pydantic import BaseModel

router = APIRouter()


class IncidentResponse(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    status: str
    threat_narrative: str | None
    executive_summary: str | None
    predicted_next_steps: list | None
    recommendations: list | None
    affected_assets: list | None
    affected_users: list | None
    mitre_techniques: list | None
    event_count: int
    assigned_to: str | None
    organization_id: str
    is_simulated: bool
    resolved_at: str | None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class PaginatedIncidents(BaseModel):
    items: List[IncidentResponse]
    total: int
    page: int
    page_size: int
    pages: int


class UpdateStatusRequest(BaseModel):
    status: str


class AttackNode(BaseModel):
    id: str
    label: str
    type: str
    mitre_id: Optional[str] = None
    timestamp: Optional[str] = None
    metadata: Optional[dict] = None


class AttackEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    technique: Optional[str] = None
    timestamp: Optional[str] = None


class AttackGraphResponse(BaseModel):
    incident_id: str
    nodes: List[AttackNode]
    edges: List[AttackEdge]
    generated_at: str


@router.get("", response_model=PaginatedIncidents)
async def list_incidents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Incident).where(Incident.organization_id == current_user.organization_id)

    if severity:
        query = query.where(Incident.severity == severity)
    if status:
        query = query.where(Incident.status == status)
    if search:
        query = query.where(Incident.title.ilike(f"%{search}%") | Incident.description.ilike(f"%{search}%"))

    result = await db.execute(query)
    incidents = result.scalars().all()

    # Auto-seed a demo incident if database is empty for this org
    if not incidents:
        demo_incident = Incident(
            title="Coordinated IT/OT Attack Scenario",
            description="Spear-phishing vector causing remote execution and grid frequency anomalies.",
            severity="critical",
            status="investigating",
            threat_narrative="Attacker gained initial access on WS-07 via spear phishing, escalated privileges to administrator, dumped credentials, and pivoted via RDP access to SCADA-WS-02. Initiated out-of-range DNP3 parameters writes causing substation frequency drift.",
            executive_summary="Active cybersecurity incident impacting grid substation Sub-02. Multi-stage attack traversing IT network to OT SCADA networks.",
            predicted_next_steps=[
                {"step": "Breaker shutdown propagation to Substation 03", "confidence": 0.85},
                {"step": "Command control channel migration to secondary IP", "confidence": 0.72}
            ],
            recommendations=[
                {"action": "Isolate workstation WS-07", "priority": "high"},
                {"action": "Enforce strict IP lockouts on DNP3 ports", "priority": "critical"}
            ],
            affected_assets=[
                {"id": "WS-07", "type": "workstation", "ip": "10.0.4.7"},
                {"id": "SCADA-WS-02", "type": "scada_server", "ip": "10.0.10.12"}
            ],
            affected_users=[
                {"username": "r.sharma", "role": "analyst"},
                {"username": "scada_admin", "role": "scada_operator"}
            ],
            mitre_techniques=[
                {"id": "T1566.001", "name": "Spearphishing Attachment"},
                {"id": "T1059.001", "name": "PowerShell"},
                {"id": "T1021.001", "name": "Remote Desktop Protocol"},
                {"id": "T0813", "name": "Modify Parameter"}
            ],
            event_count=5,
            organization_id=current_user.organization_id,
            is_simulated=True
        )
        db.add(demo_incident)
        await db.flush()
        await db.commit()
        incidents = [demo_incident]

    total = len(incidents)
    pages = 1

    items = [
        IncidentResponse(
            id=inc.id,
            title=inc.title,
            description=inc.description,
            severity=inc.severity,
            status=inc.status,
            threat_narrative=inc.threat_narrative,
            executive_summary=inc.executive_summary,
            predicted_next_steps=inc.predicted_next_steps,
            recommendations=inc.recommendations,
            affected_assets=inc.affected_assets,
            affected_users=inc.affected_users,
            mitre_techniques=inc.mitre_techniques,
            event_count=inc.event_count,
            assigned_to=inc.assigned_to,
            organization_id=inc.organization_id,
            is_simulated=inc.is_simulated,
            resolved_at=inc.resolved_at.isoformat() if inc.resolved_at else None,
            created_at=inc.created_at.isoformat(),
            updated_at=inc.updated_at.isoformat()
        )
        for inc in incidents
    ]

    return PaginatedIncidents(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages
    )


@router.get("/{id}", response_model=IncidentResponse)
async def get_incident(
    id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Incident).where(
            Incident.id == id,
            Incident.organization_id == current_user.organization_id
        )
    )
    inc = result.scalar_one_or_none()
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    return IncidentResponse(
        id=inc.id,
        title=inc.title,
        description=inc.description,
        severity=inc.severity,
        status=inc.status,
        threat_narrative=inc.threat_narrative,
        executive_summary=inc.executive_summary,
        predicted_next_steps=inc.predicted_next_steps,
        recommendations=inc.recommendations,
        affected_assets=inc.affected_assets,
        affected_users=inc.affected_users,
        mitre_techniques=inc.mitre_techniques,
        event_count=inc.event_count,
        assigned_to=inc.assigned_to,
        organization_id=inc.organization_id,
        is_simulated=inc.is_simulated,
        resolved_at=inc.resolved_at.isoformat() if inc.resolved_at else None,
        created_at=inc.created_at.isoformat(),
        updated_at=inc.updated_at.isoformat()
    )


@router.patch("/{id}/status", response_model=IncidentResponse)
async def update_status(
    id: str,
    payload: UpdateStatusRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Incident).where(
            Incident.id == id,
            Incident.organization_id == current_user.organization_id
        )
    )
    inc = result.scalar_one_or_none()
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    inc.status = payload.status
    if payload.status in ["resolved", "closed"]:
        inc.resolved_at = datetime.now(timezone.utc)
    await db.commit()

    return IncidentResponse(
        id=inc.id,
        title=inc.title,
        description=inc.description,
        severity=inc.severity,
        status=inc.status,
        threat_narrative=inc.threat_narrative,
        executive_summary=inc.executive_summary,
        predicted_next_steps=inc.predicted_next_steps,
        recommendations=inc.recommendations,
        affected_assets=inc.affected_assets,
        affected_users=inc.affected_users,
        mitre_techniques=inc.mitre_techniques,
        event_count=inc.event_count,
        assigned_to=inc.assigned_to,
        organization_id=inc.organization_id,
        is_simulated=inc.is_simulated,
        resolved_at=inc.resolved_at.isoformat() if inc.resolved_at else None,
        created_at=inc.created_at.isoformat(),
        updated_at=inc.updated_at.isoformat()
    )


@router.get("/{id}/attack-graph", response_model=AttackGraphResponse)
async def get_attack_graph(
    id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify incident exists
    result = await db.execute(
        select(Incident).where(
            Incident.id == id,
            Incident.organization_id == current_user.organization_id
        )
    )
    inc = result.scalar_one_or_none()
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    # Return structured attack path nodes and edges matching the scenario
    nodes = [
        AttackNode(id="attacker", label="Attacker (External)", type="threat_actor"),
        AttackNode(id="ws-07", label="WS-07 (Workstation)", type="host", metadata={"ip": "10.0.4.7", "os": "Windows 10"}),
        AttackNode(id="user-rsharma", label="r.sharma (User)", type="user"),
        AttackNode(id="scada-ws-02", label="SCADA-WS-02 (SCADA Host)", type="host", metadata={"ip": "10.0.10.12"}),
        AttackNode(id="breaker-4", label="Sub-02 Breaker #4", type="physical_asset")
    ]

    edges = [
        AttackEdge(id="e1", source="attacker", target="ws-07", label="Spearphishing Attachment", technique="T1566.001"),
        AttackEdge(id="e2", source="ws-07", target="user-rsharma", label="User Execution", technique="T1204.002"),
        AttackEdge(id="e3", source="user-rsharma", target="scada-ws-02", label="RDP Pivot", technique="T1021.001"),
        AttackEdge(id="e4", source="scada-ws-02", target="breaker-4", label="Direct Operate command", technique="T0855")
    ]

    return AttackGraphResponse(
        incident_id=id,
        nodes=nodes,
        edges=edges,
        generated_at=datetime.now(timezone.utc).isoformat()
    )
