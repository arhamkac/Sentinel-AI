"""
AI Chat Endpoint (Task A7 / Task B6 backend)
Exposes POST /api/v1/ai/chat for the AI Investigation console.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List

from app.db.session import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.incident import Incident
from app.services.ai.service import run_chat_agent

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    incident_id: Optional[str] = None
    history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    response: str
    sources: List[str]
    navigateTo: Optional[str] = None


def _build_incident_context(inc: Incident) -> str:
    """Format an incident as a string context for the AI agent."""
    lines = [
        f"Incident: {inc.title}",
        f"Severity: {inc.severity}",
        f"Status: {inc.status}",
        f"Description: {inc.description}",
    ]
    if inc.threat_narrative:
        lines.append(f"Narrative: {inc.threat_narrative}")
    if inc.affected_assets:
        assets = [
            a.get("id", str(a)) if isinstance(a, dict) else str(a)
            for a in inc.affected_assets
        ]
        lines.append(f"Affected Assets: {', '.join(assets)}")
    if inc.affected_users:
        users = [
            u.get("username", str(u)) if isinstance(u, dict) else str(u)
            for u in inc.affected_users
        ]
        lines.append(f"Affected Users: {', '.join(users)}")
    if inc.mitre_techniques:
        techs = [
            f"{t.get('id', 'T?')} ({t.get('name', '?')})" if isinstance(t, dict) else str(t)
            for t in inc.mitre_techniques
        ]
        lines.append(f"MITRE Techniques: {', '.join(techs)}")
    return "\n".join(lines)


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """AI chat endpoint — routes message to multi-agent AI service."""
    incident_context: Optional[str] = None

    if payload.incident_id:
        result = await db.execute(
            select(Incident).where(
                Incident.id == payload.incident_id,
                Incident.organization_id == current_user.organization_id,
            )
        )
        inc = result.scalar_one_or_none()
        if inc:
            incident_context = _build_incident_context(inc)

    history = None
    if payload.history:
        history = [{"role": m.role, "content": m.content} for m in payload.history]

    result = await run_chat_agent(
        message=payload.message,
        incident_context=incident_context,
        conversation_history=history,
    )
    return ChatResponse(
        response=result.get("response", ""),
        sources=result.get("sources", []),
        navigateTo=result.get("navigateTo", None)
    )
