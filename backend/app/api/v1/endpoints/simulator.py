from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.simulation import SimulationRun
from app.services.simulator.service import run_scenario_task, SCENARIOS
from pydantic import BaseModel

router = APIRouter()


class RunRequest(BaseModel):
    scenario_id: str


class ScenarioResponse(BaseModel):
    id: str
    name: str
    description: str
    attack_type: str
    severity: str
    estimated_duration: str
    techniques: List[str]
    target_profile: str


class RunResponse(BaseModel):
    id: str
    scenario_id: str
    scenario_name: str
    status: str
    events_generated: int
    organization_id: str
    error_message: str | None
    started_at: str | None
    completed_at: str | None

    class Config:
        from_attributes = True


@router.get("/scenarios", response_model=List[ScenarioResponse])
async def get_scenarios(current_user: User = Depends(get_current_active_user)):
    return [
        {
            "id": "ransomware",
            "name": "Ransomware Scenario",
            "description": "Spear-phishing macro execution -> local PowerShell download -> host credential dump -> lateral movement to file server -> encryption of files.",
            "attack_type": "Ransomware",
            "severity": "critical",
            "estimated_duration": "~3 minutes",
            "techniques": ["T1566", "T1059", "T1003", "T1021", "T1486"],
            "target_profile": "Corporate Windows Environment"
        },
        {
            "id": "ot_sabotage",
            "name": "OT Sabotage Scenario",
            "description": "Remote login on IT workstation -> remote control execution accessing SCADA console -> invalid DNP3 code injections -> breaker trip.",
            "attack_type": "OT Sabotage",
            "severity": "high",
            "estimated_duration": "~2 minutes",
            "techniques": ["T1021", "T0813", "T0855", "T0814"],
            "target_profile": "Substation 02 / Grid Network"
        }
    ]


@router.post("/run", response_model=RunResponse, status_code=status.HTTP_201_CREATED)
async def run_scenario(
    payload: RunRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    scenario_id = payload.scenario_id
    if scenario_id not in SCENARIOS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{scenario_id}' not found. Available scenarios: {list(SCENARIOS.keys())}"
        )

    # Check if a simulation run is already active for this organization
    active_run_query = await db.execute(
        select(SimulationRun).where(
            SimulationRun.organization_id == current_user.organization_id,
            SimulationRun.status == "running"
        )
    )
    if active_run_query.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A simulation run is already currently active."
        )

    # Create run record
    run = SimulationRun(
        scenario_id=scenario_id,
        scenario_name=SCENARIOS[scenario_id]["name"],
        status="pending",
        events_generated=0,
        organization_id=current_user.organization_id,
    )
    db.add(run)
    await db.flush()
    await db.commit()

    # Enqueue background task
    background_tasks.add_task(
        run_scenario_task,
        scenario_id=scenario_id,
        organization_id=current_user.organization_id,
        run_id=run.id
    )

    # Re-fetch or return populated model
    # Convert dates to ISO string format or rely on Pydantic formatting
    return RunResponse(
        id=run.id,
        scenario_id=run.scenario_id,
        scenario_name=run.scenario_name,
        status=run.status,
        events_generated=run.events_generated,
        organization_id=run.organization_id,
        error_message=run.error_message,
        started_at=run.started_at.isoformat() if run.started_at else None,
        completed_at=run.completed_at.isoformat() if run.completed_at else None
    )


@router.get("/runs", response_model=List[RunResponse])
async def get_runs(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SimulationRun)
        .where(SimulationRun.organization_id == current_user.organization_id)
        .order_by(SimulationRun.created_at.desc())
    )
    runs = result.scalars().all()
    return [
        RunResponse(
            id=r.id,
            scenario_id=r.scenario_id,
            scenario_name=r.scenario_name,
            status=r.status,
            events_generated=r.events_generated,
            organization_id=r.organization_id,
            error_message=r.error_message,
            started_at=r.started_at.isoformat() if r.started_at else None,
            completed_at=r.completed_at.isoformat() if r.completed_at else None
        )
        for r in runs
    ]


@router.get("/runs/{id}", response_model=RunResponse)
async def get_run(
    id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SimulationRun).where(
            SimulationRun.id == id,
            SimulationRun.organization_id == current_user.organization_id
        )
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation run not found"
        )
    return RunResponse(
        id=r.id,
        scenario_id=r.scenario_id,
        scenario_name=r.scenario_name,
        status=r.status,
        events_generated=r.events_generated,
        organization_id=r.organization_id,
        error_message=r.error_message,
        started_at=r.started_at.isoformat() if r.started_at else None,
        completed_at=r.completed_at.isoformat() if r.completed_at else None
    )
