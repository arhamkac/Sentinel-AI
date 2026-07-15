import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.models.event import SecurityEvent
from app.models.simulation import SimulationRun
from app.websockets.manager import manager
from app.core.config import settings
from app.services.ai.correlation import correlate_event

logger = logging.getLogger(__name__)

SCENARIOS = {
    "ransomware": {
        "name": "Ransomware Scenario",
        "steps": [
            {
                "event_type": "endpoint",
                "severity": "low",
                "hostname": "WS-07",
                "user": "r.sharma",
                "process": "excel.exe",
                "description": "Spear-phishing email attachment macro execution detected on analyst workstation.",
                "raw_data": {"attachment": "Q4_Report_CNI.xlsm", "spawned_process": "cmd.exe"},
                "mitre_technique_id": "T1566.001",
                "mitre_technique_name": "Phishing: Spearphishing Attachment",
                "anomaly_score": 0.25,
            },
            {
                "event_type": "network",
                "severity": "medium",
                "hostname": "WS-07",
                "user": "r.sharma",
                "process": "powershell.exe",
                "description": "PowerShell outbound connection to known malicious C2 hosting server.",
                "source_ip": "10.0.4.7",
                "destination_ip": "185.220.101.4",
                "source_port": 49201,
                "destination_port": 443,
                "raw_data": {"command_line": "powershell.exe -ExecutionPolicy Bypass -File C:\\Users\\r.sharma\\AppData\\Local\\Temp\\update.ps1"},
                "mitre_technique_id": "T1059.001",
                "mitre_technique_name": "Command and Scripting Interpreter: PowerShell",
                "anomaly_score": 0.48,
            },
            {
                "event_type": "endpoint",
                "severity": "high",
                "hostname": "WS-07",
                "user": "SYSTEM",
                "process": "vssadmin.exe",
                "description": "Attempt to dump local credentials and disable Volume Shadow Copies on workstation WS-07.",
                "raw_data": {"command_line": "vssadmin.exe delete shadows /all /quiet"},
                "mitre_technique_id": "T1490",
                "mitre_technique_name": "Inhibit System Recovery",
                "anomaly_score": 0.78,
            },
            {
                "event_type": "network",
                "severity": "high",
                "hostname": "WS-07",
                "user": "SYSTEM",
                "process": "cmd.exe",
                "description": "Lateral movement attempt: SMB connection established from WS-07 to FileServer-01.",
                "source_ip": "10.0.4.7",
                "destination_ip": "10.0.4.10",
                "source_port": 445,
                "destination_port": 445,
                "raw_data": {"target_share": "\\\\FileServer-01\\C$"},
                "mitre_technique_id": "T1021.002",
                "mitre_technique_name": "Remote Services: SMB/Windows Admin Shares",
                "anomaly_score": 0.81,
            },
            {
                "event_type": "endpoint",
                "severity": "critical",
                "hostname": "FileServer-01",
                "user": "SYSTEM",
                "process": "crypt.exe",
                "description": "Mass encryption of files on FileServer-01. Ransomware activity confirmed.",
                "raw_data": {"encrypted_files_count": 14500, "extension": ".locked"},
                "mitre_technique_id": "T1486",
                "mitre_technique_name": "Data Encrypted for Impact",
                "anomaly_score": 0.95,
            }
        ]
    },
    "ot_sabotage": {
        "name": "OT Sabotage Scenario",
        "steps": [
            {
                "event_type": "endpoint",
                "severity": "low",
                "hostname": "WS-07",
                "user": "r.sharma",
                "process": "mstsc.exe",
                "description": "Analyst workstation established RDP remote access to SCADA control workstation.",
                "source_ip": "10.0.4.7",
                "destination_ip": "10.0.10.12",
                "source_port": 49352,
                "destination_port": 3389,
                "raw_data": {"target_host": "SCADA-WS-02"},
                "mitre_technique_id": "T1021.001",
                "mitre_technique_name": "Remote Services: Remote Desktop Protocol",
                "anomaly_score": 0.35,
            },
            {
                "event_type": "endpoint",
                "severity": "medium",
                "hostname": "SCADA-WS-02",
                "user": "scada_admin",
                "process": "scada_console.exe",
                "description": "Remote control commands executed accessing SCADA HMI management application.",
                "raw_data": {"privilege_level": "administrator"},
                "mitre_technique_id": "T0813",
                "mitre_technique_name": "Modify Parameter",
                "anomaly_score": 0.52,
            },
            {
                "event_type": "scada",
                "severity": "high",
                "hostname": "SCADA-WS-02",
                "user": "scada_admin",
                "process": "scada_console.exe",
                "description": "DNP3 command validation warnings. Telemetry parameters drift detected on Substation 02.",
                "raw_data": {"protocol": "DNP3", "point_index": 4, "anomaly_details": "Out-of-range write attempts"},
                "mitre_technique_id": "T0813",
                "mitre_technique_name": "Modify Parameter",
                "anomaly_score": 0.72,
            },
            {
                "event_type": "scada",
                "severity": "high",
                "hostname": "SCADA-WS-02",
                "user": "scada_admin",
                "process": "scada_console.exe",
                "description": "Invalid DNP3 function code injection (Direct Operate - Force Trip) sent to PLC/RTU.",
                "raw_data": {"protocol": "DNP3", "function_code": "0x05", "target_breaker": "Breaker #4"},
                "mitre_technique_id": "T0855",
                "mitre_technique_name": "Unauthorized Command Message",
                "anomaly_score": 0.88,
            },
            {
                "event_type": "scada",
                "severity": "critical",
                "hostname": "SCADA-WS-02",
                "user": "scada_admin",
                "process": "scada_console.exe",
                "description": "Sub-02 Phase angle shift matches grid sabotage signature. Breaker isolation triggered.",
                "raw_data": {"breaker_status": "tripped", "line_frequency": "50.02 Hz", "phase_drift": "0.85"},
                "mitre_technique_id": "T0814",
                "mitre_technique_name": "Inhibit Response Function",
                "anomaly_score": 0.96,
            }
        ]
    }
}


async def run_scenario_task(scenario_id: str, organization_id: str, run_id: str) -> None:
    logger.info(f"Starting background simulation {run_id} for scenario {scenario_id}")
    scenario = SCENARIOS.get(scenario_id)
    if not scenario:
        logger.error(f"Scenario {scenario_id} not found.")
        return

    delay_ms = settings.SIMULATION_EVENT_DELAY_MS
    delay_sec = delay_ms / 1000.0

    async with AsyncSessionLocal() as db:
        # Fetch simulation run record
        result = await db.execute(select(SimulationRun).where(SimulationRun.id == run_id))
        sim_run = result.scalar_one_or_none()
        if not sim_run:
            logger.error(f"SimulationRun {run_id} not found in database.")
            return

        sim_run.status = "running"
        sim_run.started_at = datetime.now(timezone.utc)
        await db.commit()

        events_generated = 0
        try:
            for step in scenario["steps"]:
                # Wait before generating next step
                await asyncio.sleep(delay_sec)

                # Create event
                event = SecurityEvent(
                    event_type=step["event_type"],
                    severity=step["severity"],
                    hostname=step["hostname"],
                    user=step.get("user"),
                    process=step.get("process"),
                    description=step["description"],
                    source_ip=step.get("source_ip"),
                    destination_ip=step.get("destination_ip"),
                    source_port=step.get("source_port"),
                    destination_port=step.get("destination_port"),
                    raw_data=step.get("raw_data"),
                    anomaly_score=step.get("anomaly_score"),
                    mitre_technique_id=step.get("mitre_technique_id"),
                    mitre_technique_name=step.get("mitre_technique_name"),
                    organization_id=organization_id,
                    is_simulated=True,
                    timestamp=datetime.now(timezone.utc)
                )
                db.add(event)
                await db.flush()

                # Correlate event to link it to an incident (or create a new one)
                incident_id = await correlate_event(event, db)
                if incident_id:
                    event.incident_id = incident_id
                    await db.flush()

                # Increment count
                events_generated += 1

                # Construct websocket payload
                ws_payload = {
                    "id": event.id,
                    "event_type": event.event_type,
                    "severity": event.severity,
                    "hostname": event.hostname,
                    "user": event.user,
                    "process": event.process,
                    "description": event.description,
                    "source_ip": event.source_ip,
                    "destination_ip": event.destination_ip,
                    "source_port": event.source_port,
                    "destination_port": event.destination_port,
                    "raw_data": event.raw_data,
                    "anomaly_score": event.anomaly_score,
                    "mitre_technique_id": event.mitre_technique_id,
                    "mitre_technique_name": event.mitre_technique_name,
                    "incident_id": event.incident_id,
                    "organization_id": event.organization_id,
                    "is_simulated": event.is_simulated,
                    "timestamp": event.timestamp.isoformat()
                }

                # Broadcast to organization websocket subscribers
                await manager.broadcast_to_org(organization_id, ws_payload)

            # Mark complete
            sim_run.status = "completed"
            sim_run.events_generated = events_generated
            sim_run.completed_at = datetime.now(timezone.utc)
            await db.commit()
            logger.info(f"Simulation run {run_id} completed successfully.")

        except Exception as e:
            logger.exception(f"Error during simulation run {run_id}")
            sim_run.status = "failed"
            sim_run.error_message = str(e)
            await db.commit()
