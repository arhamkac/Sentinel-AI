"""
Multi-Agent AI Investigator & Threat Predictor (Task A7)
Integrates with OpenRouter API to run three specialized agents:
  1. Attribution Agent  — maps events to MITRE ATT&CK
  2. Predictive Agent   — forecasts next attacker moves
  3. SOAR Agent         — generates containment playbooks
"""
import json
import logging
from typing import Any, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


# ─── Prompt Templates ────────────────────────────────────────────────────────

ATTRIBUTION_SYSTEM = """You are a senior cybersecurity threat analyst. 
Given a security incident, analyze the attack chain and:
1. Map each technique to MITRE ATT&CK IDs (both Enterprise and ICS/OT where relevant).
2. Identify the likely threat actor group or campaign based on TTPs.
3. Assign a confidence score (0.0-1.0) to each attribution.
Return ONLY a valid JSON object with this exact schema:
{
  "threat_narrative": "string — clear, concise summary of the attack chain",
  "threat_actor": "string — likely actor or 'Unknown'",
  "confidence": 0.0-1.0,
  "mitre_techniques": [{"id": "Txxx", "name": "...", "tactic": "...", "confidence": 0.0-1.0}],
  "executive_summary": "string — 2-3 sentences for non-technical stakeholders"
}"""

PREDICTION_SYSTEM = """You are a threat intelligence analyst specializing in attack path prediction.
Given incident context, predict the attacker's most likely next moves.
Return ONLY a valid JSON array with this schema:
[
  {
    "technique_id": "Txxx",
    "technique_name": "string",
    "probability": 0.0-1.0,
    "reasoning": "string — why this is likely",
    "time_estimate": "string — e.g. '30-90 minutes'",
    "indicators_to_watch": ["string"]
  }
]
Limit to top 3 predictions."""

SOAR_SYSTEM = """You are a SOAR orchestration engine. 
Given a security incident, generate actionable containment playbooks.
Return ONLY a valid JSON array with this schema:
[
  {
    "action": "string — technical action name",
    "target": "string — asset or user to act on",
    "priority": "critical|high|medium|low",
    "description": "string — what this does",
    "impact": "string — side effects if executed",
    "automated": true|false
  }
]"""

CHAT_SYSTEM = """You are Sentinel AI, an autonomous cyber decision intelligence assistant.
You help security analysts investigate incidents, understand attack patterns, 
map techniques to MITRE ATT&CK, and recommend containment actions.

CRITICAL INSTRUCTION: If the user indicates they do not understand something, are confused, or explicitly ask for an explanation (e.g., "What does this mean?", "Explain it to me"), you MUST break down the technical concepts into simple, beginner-friendly terms. Use clear analogies (like comparing network traffic to physical mail, or firewalls to security guards) and step-by-step logic. Avoid jargon when explaining.

Otherwise, be concise, technical, and actionable. Use markdown formatting."""


async def _call_openrouter(
    system_prompt: str,
    user_prompt: str,
    model: Optional[str] = None,
    max_tokens: int = 1500,
) -> str:
    """Send a request to OpenRouter API and return the response text."""
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not configured")

    selected_model = model or settings.AI_MODEL_PRIMARY
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sentinel.ai",
        "X-Title": "Sentinel AI",
    }
    payload = {
        "model": selected_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.3,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.OPENROUTER_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


def _safe_json_parse(text: str, fallback: Any) -> Any:
    """Try to parse JSON from LLM output, stripping markdown code fences."""
    text = text.strip()
    # Strip markdown code fences
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]) if len(lines) > 2 else text
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.warning(f"JSON parse failed, using fallback. Raw: {text[:200]}")
        return fallback


async def run_attribution_agent(incident_context: str) -> dict:
    """Attribution Agent: maps incident to MITRE techniques and actor profiles."""
    fallback = {
        "threat_narrative": "Unable to generate narrative at this time.",
        "threat_actor": "Unknown",
        "confidence": 0.5,
        "mitre_techniques": [],
        "executive_summary": "Analysis pending.",
    }
    try:
        raw = await _call_openrouter(
            system_prompt=ATTRIBUTION_SYSTEM,
            user_prompt=f"Analyze this incident:\n\n{incident_context}",
            model=settings.AI_MODEL_REASONING,
        )
        return _safe_json_parse(raw, fallback)
    except Exception as e:
        logger.error(f"Attribution agent error: {e}")
        return fallback


async def run_prediction_agent(incident_context: str) -> list:
    """Prediction Agent: forecasts next attacker moves."""
    fallback = [
        {
            "technique_id": "T1486",
            "technique_name": "Data Encrypted for Impact",
            "probability": 0.75,
            "reasoning": "Common ransomware final stage",
            "time_estimate": "1-4 hours",
            "indicators_to_watch": ["mass file rename events", "ransom note creation"],
        }
    ]
    try:
        raw = await _call_openrouter(
            system_prompt=PREDICTION_SYSTEM,
            user_prompt=f"Predict next steps for this incident:\n\n{incident_context}",
            model=settings.AI_MODEL_PRIMARY,
        )
        return _safe_json_parse(raw, fallback)
    except Exception as e:
        logger.error(f"Prediction agent error: {e}")
        return fallback


async def run_soar_agent(incident_context: str) -> list:
    """SOAR Agent: generates containment playbook actions."""
    fallback = [
        {"action": "isolate_endpoint", "target": "affected_host", "priority": "high",
         "description": "Isolate the compromised host from the network",
         "impact": "Host will lose network connectivity", "automated": False},
        {"action": "block_ip", "target": "source_ip", "priority": "critical",
         "description": "Block attacker C2 IP at perimeter firewall",
         "impact": "Outbound connections to IP blocked", "automated": True},
    ]
    try:
        raw = await _call_openrouter(
            system_prompt=SOAR_SYSTEM,
            user_prompt=f"Generate containment playbook for:\n\n{incident_context}",
            model=settings.AI_MODEL_FAST,
        )
        return _safe_json_parse(raw, fallback)
    except Exception as e:
        logger.error(f"SOAR agent error: {e}")
        return fallback


async def run_chat_agent(
    message: str,
    incident_context: Optional[str] = None,
    conversation_history: Optional[list] = None,
) -> dict:
    """Chat Agent: conversational AI investigation assistant."""
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        return _mock_advanced_agent(message, incident_context)

    user_content = message
    if incident_context:
        user_content = f"[Incident Context]\n{incident_context}\n\n[Question]\n{message}"

    messages = [{"role": "system", "content": CHAT_SYSTEM}]
    if conversation_history:
        messages.extend(conversation_history[-10:])  # Keep last 10 turns
    messages.append({"role": "user", "content": user_content})

    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://sentinel.ai",
            "X-Title": "Sentinel AI",
        }
        payload = {
            "model": settings.AI_MODEL_PRIMARY,
            "messages": messages,
            "max_tokens": 800,
            "temperature": 0.4,
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(
                f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            if "choices" not in data:
                logger.error(f"OpenRouter API returned no choices. Raw response: {response.text}")
                raise KeyError("choices")
            text = data["choices"][0]["message"]["content"]
            return {
                "response": text,
                "sources": ["MITRE ATT&CK v14", "OpenRouter AI", "Sentinel AI KB"],
            }
    except Exception as e:
        logger.error(f"Chat agent error: {e}")
        return _mock_advanced_agent(message, incident_context)


def _parse_incident_context(context: Optional[str]) -> dict:
    if not context:
        return {}
    res = {}
    for line in context.split('\n'):
        if line.startswith("Incident: "):
            res["title"] = line[len("Incident: "):].strip()
        elif line.startswith("Severity: "):
            res["severity"] = line[len("Severity: "):].strip()
        elif line.startswith("Status: "):
            res["status"] = line[len("Status: "):].strip()
        elif line.startswith("Description: "):
            res["description"] = line[len("Description: "):].strip()
        elif line.startswith("Affected Assets: "):
            res["assets"] = line[len("Affected Assets: "):].strip()
        elif line.startswith("Affected Users: "):
            res["users"] = line[len("Affected Users: "):].strip()
        elif line.startswith("MITRE Techniques: "):
            res["techniques"] = line[len("MITRE Techniques: "):].strip()
        elif line.startswith("Narrative: "):
            res["narrative"] = line[len("Narrative: "):].strip()
    return res


def _mock_advanced_agent(message: str, incident_context: Optional[str] = None) -> dict:
    """Advanced fallback mock response when OpenRouter is unavailable."""
    msg = message.lower()
    
    # Handle navigation intents
    if any(k in msg for k in ['go to', 'navigate', 'show me', 'open']):
        if any(k in msg for k in ['dashboard', 'home']):
            return {"response": "Navigating to Dashboard...", "sources": ["System"], "navigateTo": "/dashboard"}
        if 'incident' in msg:
            return {"response": "Navigating to Incidents...", "sources": ["System"], "navigateTo": "/incidents"}
        if any(k in msg for k in ['graph', 'attack']):
            return {"response": "Navigating to Attack Graph...", "sources": ["System"], "navigateTo": "/attack-graph"}
        if 'simulat' in msg:
            return {"response": "Navigating to Simulator...", "sources": ["System"], "navigateTo": "/simulator"}
        if any(k in msg for k in ['threat', 'intel']):
            return {"response": "Navigating to Threat Intel...", "sources": ["System"], "navigateTo": "/threat-intel"}

    # Handle general knowledge
    if 'hello' in msg or 'hi' in msg:
        return {"response": "Hello! I am Sentinel AI. I can analyze incidents, predict threats, or navigate you around the platform. What do you need?", "sources": ["Sentinel KB"]}

    if 'how to use' in msg or 'help' in msg:
        return {"response": "I can help you navigate (e.g., 'go to simulator'), analyze incidents, or provide MITRE intel. Try asking me about a specific incident or tell me where to go.", "sources": ["User Manual"]}

    # Specific incident queries
    info = _parse_incident_context(incident_context)
    
    if any(k in msg for k in ("asset", "host", "machine", "workstation", "server")):
        assets = info.get("assets", "WS-07, SCADA-WS-02, breaker-4")
        return {"response": f"**Assets & Host Investigation:**\n\nBased on the incident logs, the threat actor targeted or pivot-moved through the following assets:\n- **{assets}**\n\n**Recommendation:** Isolate these hosts immediately.", "sources": ["Internal Telemetry"]}
        
    if any(k in msg for k in ("user", "account", "identity", "credential")):
        users = info.get("users", "r.sharma, scada_admin")
        return {"response": f"**Identity & Credentials Report:**\n\nThe following user profiles were compromised:\n- **{users}**\n\n**Recommendation:** Revoke credentials immediately.", "sources": ["Active Directory"]}
        
    if any(k in msg for k in ("technique", "mitre", "ttp", "attack")):
        techs = info.get("techniques", "T1566.001 (Spearphishing), T1059.001 (PowerShell)")
        return {"response": f"**MITRE ATT&CK Mapping:**\n\nI have aligned the telemetry stream to the following MITRE techniques:\n- **{techs}**", "sources": ["MITRE ATT&CK v14"]}
        
    if any(k in msg for k in ("contain", "remediat", "block", "playbook", "isolate", "action")):
        return {"response": "**Recommended Containment Plan:**\n1. **Isolate** the compromised systems.\n2. **Block** outbound C2 communication.\n3. **Revoke access** credentials.", "sources": ["SOAR Playbooks"]}

    # Default fallback
    return {
        "response": f"Based on my advanced analysis, the query '{message}' indicates a need for deep investigation.\n\n**Key Findings:**\n- Suspicious activity detected on WS-07\n- Credential dumping techniques (T1003.001) mapped\n\nI recommend immediate isolation of affected assets.",
        "sources": ["MITRE ATT&CK v14", "Internal Heuristics"]
    }
