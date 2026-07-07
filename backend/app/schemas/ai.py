from typing import Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    incident_id: Optional[str] = None
    conversation_history: list[dict] = []


class ChatResponse(BaseModel):
    response: str
    sources: list[str] = []
    confidence: Optional[float] = None


class MitreTechnique(BaseModel):
    technique_id: str
    technique_name: str
    tactic: str
    description: str
    subtechniques: list[str] = []
    platforms: list[str] = []
    detection: str = ""
    mitigation: str = ""


class ThreatIntelEnrichRequest(BaseModel):
    indicators: list[str]


class ThreatIndicatorResponse(BaseModel):
    id: str
    type: str
    value: str
    severity: str
    confidence: float
    tags: list[str] = []
    source: str
    description: Optional[str] = None
    first_seen: str
    last_seen: str

    model_config = {"from_attributes": True}


class InvestigationResponse(BaseModel):
    narrative: str
    predicted_steps: list[dict] = []
    confidence: float
    recommendations: list[str] = []
    mitre_techniques: list[dict] = []
