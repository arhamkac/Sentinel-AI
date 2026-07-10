import pytest
from unittest.mock import AsyncMock
import httpx
from app.main import app
from app.db.session import get_db

@pytest.mark.asyncio
async def test_health_success():
    # Mock database session to succeed
    mock_db = AsyncMock()
    mock_db.execute.return_value = AsyncMock()

    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/health")
        
        assert response.status_code == 200
        assert response.json() == {"status": "healthy", "db": "connected"}
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_health_db_unreachable():
    # Mock database session to fail with connection drop exception
    mock_db = AsyncMock()
    mock_db.execute.side_effect = Exception("Database connection lost")

    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/health")
        
        assert response.status_code == 503
        assert response.json() == {"error": "Database connection failed"}
    finally:
        app.dependency_overrides.clear()
