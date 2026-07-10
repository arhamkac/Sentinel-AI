import logging
from fastapi import FastAPI, Depends, HTTPException, WebSocket, Query, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.core.dependencies import get_ws_user
from app.websockets.manager import manager
from app.api.v1.endpoints import auth, simulator, events, incidents

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health Check
@app.get("/health")
@app.get("/api/v1/health")
async def health(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "db": "connected"}
    except Exception:
        logger.exception("Database health check failed")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "Database connection failed"}
        )


# WebSocket Real-Time Ingestion / Streams
@app.websocket("/ws/events")
@app.websocket("/api/v1/ws/events")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str | None = Query(None),
    db: AsyncSession = Depends(get_db)
):
    user = await get_ws_user(token=token, db=db)
    if not user:
        logger.warning("Rejected WebSocket connection: invalid or missing token.")
        # Code 4001 for Unauthorized handshake
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, user.organization_id)
    try:
        while True:
            # Maintain connection, wait for message (keep-alive)
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except Exception:
        pass
    finally:
        manager.disconnect(websocket, user.organization_id)


# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(simulator.router, prefix="/api/v1/simulator", tags=["simulator"])
app.include_router(events.router, prefix="/api/v1/events", tags=["events"])
app.include_router(incidents.router, prefix="/api/v1/incidents", tags=["incidents"])
