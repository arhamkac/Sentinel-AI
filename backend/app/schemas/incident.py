from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel


class MitreTechniqueRef(BaseModel):
    technique_id: str
    technique_name: str
    tactic: str
    confidence: float


class PredictedStep(BaseModel):
    technique_id: str
    technique_name: str
    probability: float
    reasoning: str
    time_estimate: str
    indicators_to_watch: list[str]


class IncidentResponse(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    status: str
    threat_narrative: Optional[str] = None
    executive_summary: Optional[str] = None
    predicted_next_steps: Optional[list[PredictedStep]] = None
    recommendations: Optional[list[str]] = None
    affected_assets: list[str] = []
    affected_users: list[str] = []
    mitre_techniques: list[MitreTechniqueRef] = []
    event_count: int
    assigned_to: Optional[str] = None
    organization_id: str
    is_simulated: bool = False
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class IncidentStatusUpdate(BaseModel):
    status: str


class AttackNode(BaseModel):
    id: str
    type: str
    label: str
    severity: Optional[str] = None
    mitre_id: Optional[str] = None
    timestamp: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


class AttackEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    technique: Optional[str] = None
    timestamp: Optional[str] = None


class AttackGraph(BaseModel):
    incident_id: str
    nodes: list[AttackNode]
    edges: list[AttackEdge]
    generated_at: str


class NarrativeResponse(BaseModel):
    narrative: str


class PaginatedIncidents(BaseModel):
    items: list[IncidentResponse]
    total: int
    page: int
    page_size: int
    pages: int
