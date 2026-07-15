# Sentinel AI
**Autonomous Cyber Decision Intelligence Platform for CNI**

Sentinel AI is a Next-Generation Security Information and Event Management (SIEM) and SOAR (Security Orchestration, Automation, and Response) platform specifically built for Critical National Infrastructure (CNI). It integrates AI-driven correlation, predictive analytics, and real-time visualization to defend both IT networks and OT/SCADA environments against advanced persistent threats (APTs).

## Key Features

1. **AI-Powered Threat Investigation**: Chat with an autonomous AI agent capable of mapping incidents to the MITRE ATT&CK framework, predicting attacker paths, and generating automated containment playbooks.
2. **Unified IT/OT Telemetry**: Monitor classic IT events (Auth, File, Network) alongside industrial OT telemetry (Modbus, DNP3, SCADA) in a single pane of glass.
3. **Attack Graph Visualization**: Visualize lateral movement, credential dumping, and exploitation paths through interactive graph interfaces.
4. **Digital Twin Simulator**: Launch controlled red-team scenarios (like Ransomware or OT Grid Sabotage) against a simulated digital twin to test playbooks and train analysts.

## Architecture

- **Frontend**: React (Vite) + TypeScript + TailwindCSS. Uses Framer Motion for micro-animations and ReactFlow for the Attack Graph.
- **Backend**: FastAPI (Python 3.11) + SQLAlchemy (asyncPG). Real-time event streaming via WebSockets.
- **Database**: PostgreSQL 15.
- **AI Core**: Integrates with LLMs to power the reasoning engine (Attribution, Prediction, and SOAR Playbooks).

## Quick Start

### 1. Backend (API & DB)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations and seed the database
alembic upgrade head
python -m app.db.init_db

# Start the server
uvicorn app.main:app --reload
```

### 2. Frontend (UI)
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` to access the Sentinel AI console.

---
*Developed for Critical National Infrastructure Defense.*
