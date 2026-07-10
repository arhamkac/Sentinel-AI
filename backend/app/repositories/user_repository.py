from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, Organization


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, user_id: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.flush()
        return user

    async def get_organization(self, org_id: str) -> Optional[Organization]:
        result = await self.db.execute(select(Organization).where(Organization.id == org_id))
        return result.scalar_one_or_none()

    async def get_organization_by_name(self, name: str) -> Optional[Organization]:
        result = await self.db.execute(select(Organization).where(Organization.name == name))
        return result.scalar_one_or_none()

    async def create_organization(self, organization: Organization) -> Organization:
        self.db.add(organization)
        await self.db.flush()
        return organization
