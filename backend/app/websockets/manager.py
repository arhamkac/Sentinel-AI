from fastapi import WebSocket
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Store connections grouped by organization_id
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, organization_id: str):
        await websocket.accept()
        if organization_id not in self.active_connections:
            self.active_connections[organization_id] = []
        self.active_connections[organization_id].append(websocket)
        logger.info(
            f"WebSocket connection accepted for organization {organization_id}. "
            f"Active connections: {len(self.active_connections[organization_id])}"
        )

    def disconnect(self, websocket: WebSocket, organization_id: str):
        if organization_id in self.active_connections:
            if websocket in self.active_connections[organization_id]:
                self.active_connections[organization_id].remove(websocket)
                logger.info(
                    f"WebSocket disconnected for organization {organization_id}. "
                    f"Active remaining connections: {len(self.active_connections[organization_id])}"
                )
            if not self.active_connections[organization_id]:
                del self.active_connections[organization_id]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast_to_org(self, organization_id: str, message: dict):
        if organization_id in self.active_connections:
            disconnected_sockets = []
            for connection in self.active_connections[organization_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected_sockets.append(connection)
            for conn in disconnected_sockets:
                self.disconnect(conn, organization_id)


manager = ConnectionManager()
