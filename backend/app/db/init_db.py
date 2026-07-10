import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.models.user import User, Organization
from app.models.simulation import SimulationRun
from app.core.security import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_data(db: AsyncSession) -> None:
    # 1. Create default organization if it doesn't exist
    org_name = "Sentinel HQ"
    from sqlalchemy import select
    org_result = await db.execute(select(Organization).where(Organization.name == org_name))
    org = org_result.scalar_one_or_none()

    if not org:
        logger.info("Creating default organization...")
        org = Organization(
            name=org_name,
            domain="sentinel.ai",
            industry="Cybersecurity"
        )
        db.add(org)
        await db.flush()
    else:
        logger.info(f"Default organization '{org_name}' already exists.")

    # 2. Create default admin user if it doesn't exist
    admin_email = "analyst@sentinel.cni"
    user_result = await db.execute(select(User).where(User.email == admin_email))
    user = user_result.scalar_one_or_none()

    if not user:
        logger.info("Creating default admin user...")
        user = User(
            name="CNI Lead Analyst",
            email=admin_email,
            hashed_password=hash_password("StrongSecureP@ssword1"),
            role="admin",
            is_active=True,
            organization_id=org.id
        )
        db.add(user)
        await db.flush()
    else:
        logger.info(f"Default admin user '{admin_email}' already exists.")

    # 3. Create default simulation runs to avoid cold start
    sim_result = await db.execute(select(SimulationRun))
    sim_runs = sim_result.scalars().all()

    if not sim_runs:
        logger.info("Seeding default simulation runs...")
        runs = [
            SimulationRun(
                scenario_id="ransomware",
                scenario_name="Ransomware Scenario",
                status="completed",
                events_generated=5,
                organization_id=org.id,
                started_at=datetime.now(timezone.utc),
                completed_at=datetime.now(timezone.utc),
                config={"SIMULATION_EVENT_DELAY_MS": 200}
            ),
            SimulationRun(
                scenario_id="ot_sabotage",
                scenario_name="OT Sabotage Scenario",
                status="completed",
                events_generated=5,
                organization_id=org.id,
                started_at=datetime.now(timezone.utc),
                completed_at=datetime.now(timezone.utc),
                config={"SIMULATION_EVENT_DELAY_MS": 200}
            )
        ]
        db.add_all(runs)
        await db.flush()
    else:
        logger.info("Simulation runs already present.")

    await db.commit()
    logger.info("Database seeding completed successfully.")


async def init_db() -> None:
    logger.info("Initializing database...")
    async with engine.begin() as conn:
        # Create all tables if they do not exist
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema created.")

    async with AsyncSessionLocal() as session:
        await seed_data(session)


if __name__ == "__main__":
    asyncio.run(init_db())
