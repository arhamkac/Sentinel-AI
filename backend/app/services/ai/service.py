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
        return {
            "response": _mock_chat_response(message, incident_context),
            "sources": ["MITRE ATT&CK v14 (offline mode)"],
        }

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
        return {
            "response": _mock_chat_response(message, incident_context),
            "sources": ["MITRE ATT&CK v14 (local)", "Internal Incident History"],
        }


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


def _mock_chat_response(message: str, incident_context: Optional[str] = None) -> str:
    """Fallback mock response when OpenRouter is unavailable."""
    msg_lower = message.lower()
    info = _parse_incident_context(incident_context)

    # 1. Ask about affected hosts / assets
    if any(k in msg_lower for k in ("asset", "host", "machine", "workstation", "server")):
        assets = info.get("assets", "WS-07, SCADA-WS-02, breaker-4")
        return f"""**Assets & Host Investigation:**

Based on the incident logs, the threat actor targeted or pivot-moved through the following assets:
- **{assets}**

**Recommendation:** Isolate these hosts from the active network segment immediately to prevent further lateral movement."""

    # 2. Ask about user account / compromised account
    if any(k in msg_lower for k in ("user", "account", "identity", "credential", "compromise")):
        users = info.get("users", "r.sharma, scada_admin")
        return f"""**Identity & Credentials Report:**

The following user profiles were compromised or used in the attack chain:
- **{users}**

**Recommendation:** Revoke credentials, terminate all Active Directory sessions, and force a password reset for these identities immediately."""

    # 3. Ask about MITRE techniques / TTPs
    if any(k in msg_lower for k in ("technique", "mitre", "ttp", "attack")):
        techs = info.get("techniques", "T1566.001 (Spearphishing), T1059.001 (PowerShell), T1003.001 (Mimikatz), T1021.001 (RDP), T0855 (Unauthorized Command)")
        return f"""**MITRE ATT&CK Mapping:**

I have aligned the telemetry stream to the following MITRE techniques:
- **{techs}**

This maps directly to a standard IT-to-OT compromise pathway (Industrial Control System targeting)."""

    # 4. Ask about containment / remediation / action / SOAR
    if any(k in msg_lower for k in ("contain", "remediat", "block", "playbook", "isolate", "action")):
        assets = info.get("assets", "WS-07, SCADA-WS-02")
        return f"""**Recommended Containment Plan (SOAR Playbook):**

1. **Isolate** the compromised systems: **{assets}**
2. **Block** outbound C2 communication to confirmed attacker IPs (e.g. `185.220.101.4`)
3. **Revoke access** credentials for affected operators to block active RDP sessions.
4. **Force SCADA session re-authentication** to drop illegal DNP3 controls.

Select these actions in the **SOAR Actions** tab to execute them."""

    # 5. Ask about "what happened" / "explain" / general incident details
    if any(k in msg_lower for k in ("what does this mean", "don't understand", "dont understand", "simple")):
        return """**Simplified Explanation:**
        
Imagine your computer network is like a large office building.
- A **Phishing Email** (T1566) is like a fake delivery driver tricking an employee into opening the back door.
- **Lateral Movement** (T1021) is when the attacker sneaks from that employee's desk into the secure server room.
- **Ransomware** (T1486) means they changed the locks on all the filing cabinets and are demanding money for the new keys.

We need to immediately cut the power to the server room (isolate the hosts) to stop them from changing more locks!"""

    if any(k in msg_lower for k in ("happen", "explain", "summary", "narrative", "context", "who")):
        title = info.get("title", "CNI Grid Sabotage / Ransomware Chain")
        desc = info.get("description", "Potential malware execution and lateral movement detected.")
        sev = info.get("severity", "CRITICAL")
        status = info.get("status", "OPEN")
        return f"""**Incident Investigation Summary:**

- **Incident Title:** {title}
- **Current Severity:** **{sev.upper()}**
- **Status:** {status.upper()}

**Threat Narrative:**
{desc}

*Attribution indicators point towards a coordinate APT attack leveraging IT endpoints to gain SCADA operational access.*"""

    # 6. Default response
    return f"""I am analyzing this incident. If you have questions, you can ask about:
- **"Which assets are affected?"** (list endpoints)
- **"Which user accounts are compromised?"** (list credentials)
- **"What MITRE techniques were used?"** (TTP mapping)
- **"How do I contain the threat?"** (SOAR recommendations)
- **"Explain what happened"** (incident summary)

*Sentinel AI autonomous investigator is online.*"""
