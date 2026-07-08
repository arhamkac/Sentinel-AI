# Sentinel AI: Autonomous Cyber Decision Intelligence Platform for CNI
## Developer Engineering Handbook & Complete 3-Day Sprint Workflow

This document serves as the master engineering blueprint and test manual for building, running, and validating **Sentinel AI**. It defines the precise responsibilities, daily workflows, optimizations, verification gates, and test cases for both **Developer A (Backend & AI)** and **Developer B (Frontend & UI/UX)** over a 3-day development cycle.

---

# 📅 DAY 1: Foundation, High-Throughput Ingestion & High-Fidelity UI

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                 DAY 1                                   │
├────────────────────────────────────────┬────────────────────────────────┤
│      Developer A (Backend Core)        │    Developer B (UI & Layout)   │
├────────────────────────────────────────┼────────────────────────────────┤
│ 🔹 Task A1: FastAPI App & DB Schemas   │ 🔹 Task B1: CSS Design Tokens  │
│ 🔹 Task A2: JWT Auth & Session Control │ 🔹 Task B2: App Shell Layout   │
│ 🔹 Task A3: WebSocket manager          │ 🔹 Task B3: Scrolling Log View │
│ 🔹 Task A4: IT/OT Telemetry Simulator  │ 🔹 Task B4: Anomaly Pulse Graph│
└────────────────────────────────────────┴────────────────────────────────┘
```

---

## 👤 Developer A (Backend) — Day 1 Workflow

### Task A1: Core API Setup, Database Models & Alembic Schemas
*   **Goal:** Initialize the database and launch the core API framework.
*   **What to Do:** 
    1. Initialize the FastAPI instance in [main.py](file:///E:/Sentinel-AI/backend/app/main.py). Setup logging (using Structlog or Python's standard logging) and configure CORS policy allowing frontend origins.
    2. Write model classes in `backend/app/models/` mapping:
       *   `User` & `Organization` (in `user.py`)
       *   `SecurityEvent` (in `event.py` - must hold fields for both IT features and OT telemetry indexes: function codes, Modbus point indexes, protocol type)
       *   `Incident` (in `incident.py`)
       *   `SimulationRun` (in `simulation.py`)
    3. Setup a database seeder script in `backend/app/db/init_db.py` that populates a default corporate org and default admin user, and adds default simulation run profiles to avoid cold start issues.
*   **What to Use:** FastAPI, SQLAlchemy (asyncPG driver for asynchronous queries), Alembic (migrations).
*   **How to Make it Better:** Use connection pool parameters `pool_size=20`, `max_overflow=30`, and enable `pool_pre_ping=True` to prevent connection drops. Add indexing on `security_events.timestamp`, `security_events.organization_id`, and `security_events.severity` to ensure fast queries.
*   **How to Know it is Correct:** The database tables are successfully generated. Submitting a `GET /health` request returns a `200 OK` code along with database verification.
*   **How to Test, Verify & Improve:**
    *   Initialize the migration environment:
        ```bash
        cd backend
        alembic init alembic
        alembic revision --autogenerate -m "Initial migrations"
        alembic upgrade head
        ```
    *   Verify the seeder script executes successfully:
        ```bash
        python -m app.db.init_db
        ```
*   **Possible Test Cases:**
    *   *Test Case 1 (Health Success):* `GET /health` ➜ Check status code is `200` and response body is `{"status": "healthy", "db": "connected"}`.
    *   *Test Case 2 (Database Unreachable):* Force stop your local PostgreSQL server, then send a `GET /health` request. Verify that the response code shifts to `503 Service Unavailable` and returns `{"error": "Database connection failed"}` without crashing the server process.

---

### Task A2: Secure Authentication & Session Management
*   **Goal:** Set up secure session state management using JSON Web Tokens (JWT).
*   **What to Do:**
    1. Implement JWT creation, password hashing, and token verification utilities in `backend/app/core/security.py`.
    2. Build [auth.py](file:///E:/Sentinel-AI/backend/app/api/v1/endpoints/auth.py) exposing `/login` and `/register`. Expose a `/me` endpoint that returns active session credentials using token dependencies.
*   **What to Use:** `passlib` with `bcrypt` schemas for hashing passwords; `python-jose` for generating and verifying signature tokens.
*   **How to Make it Better:** Enforce password complexity policies at the API level (minimum 8 characters, containing uppercase, lowercase, numeric, and special characters) using Pydantic regex validators. Add a token expiration time limit (e.g. access tokens expire in 30 minutes, refresh tokens in 7 days).
*   **How to Know it is Correct:** Accessing protected API endpoints without a valid authorization header returns `401 Unauthorized`. Submitting a correct JWT token in the header (`Authorization: Bearer <token>`) returns a `200 OK` response with details for the current user.
*   **How to Test, Verify & Improve:**
    *   Submit a registration query:
        ```bash
        curl -X POST http://localhost:8000/api/v1/auth/register \
          -H "Content-Type: application/json" \
          -d '{"email":"analyst@sentinel.cni", "password":"StrongSecureP@ssword1", "name":"CNI Lead Analyst"}'
        ```
    *   Verify authentication logic works and returns valid tokens:
        ```bash
        curl -X POST http://localhost:8000/api/v1/auth/login \
          -d "username=analyst@sentinel.cni&password=StrongSecureP@ssword1"
        ```
*   **Possible Test Cases:**
    *   *Test Case 1 (Weak Password):* Submit a password registration payload with a weak string (e.g. `12345`). Confirm the API returns a `422 Unprocessable Entity` status code explaining the password complexity rules.
    *   *Test Case 2 (SQL Injection email):* Attempt registration with an email value containing SQL payload parameters (e.g., `' OR 1=1; --`). Verify the database sanitizes inputs through SQLAlchemy query binds.
    *   *Test Case 3 (Expired Token):* Generate a token with a `-5 minutes` expiration value. Verify that submitting this token to the protected `/api/v1/users/me` endpoint returns `401 Unauthorized` with the error `Signature has expired`.

---

### Task A3: Real-Time WebSocket Manager
*   **Goal:** Build a publisher broker supporting multi-channel logs broadcasting.
*   **What to Do:**
    1. Create a connection broker class in `backend/app/websockets/manager.py` to store active websocket connections.
    2. Build subscription channels based on Organization IDs so data does not leak across different tenants.
    3. Expose a WebSocket route at `/api/v1/ws/events`.
*   **What to Use:** FastAPI's `WebSocket` class.
*   **How to Make it Better:** Add token verification checking to the WebSocket handshake query string (e.g., `/ws/events?token=<JWT>`). Implement a ping/pong heartbeat interval to automatically prune dead socket connections.
*   **How to Know it is Correct:** Connecting web clients receive streamed JSON lines on channel broadcasts, and disconnection events are handled cleanly without memory leaks.
*   **How to Test, Verify & Improve:**
    *   Use a WebSocket test client (e.g., Python's `websockets` library or Postman) to connect to `ws://localhost:8000/api/v1/ws/events?token=<valid_token>`.
    *   Verify connectivity, then disconnect the client and inspect server console logs to check that the client is removed from the active connection pool.
*   **Possible Test Cases:**
    *   *Test Case 1 (Unauthorized Handshake):* Attempt connecting with a missing or invalid token. Verify the server immediately closes the socket connection with code `4001` (Unauthorized).
    *   *Test Case 2 (Broadcasting Leakage):* Open two connections using tokens associated with different organizations (Org A and Org B). Broadcast an event matching Org A. Confirm that the Org B client does not receive the message payload.

---

### Task A4: Asynchronous CNI (IT/OT) Telemetry Simulator
*   **Goal:** Build a simulator that generates realistic IT and OT telemetry streams.
*   **What to Do:**
    1. Implement a background task manager in `backend/app/services/simulator/service.py` containing scenario timelines:
       *   **Ransomware Scenario:** Spear-phishing macro execution ➜ local PowerShell download ➜ host credential dumping ➜ lateral movement to file server ➜ mass encryption of files.
       *   **OT Sabotage Scenario:** Initial login on IT endpoint ➜ remote control command execution accessing SCADA console ➜ invalid DNP3 function code injections ➜ substation breaker status trip.
    2. Expose the execution route at `POST /api/v1/simulator/run`. When triggered, run the simulation logic as a background task. For each step, insert an event into the DB, and broadcast the payload via the WebSocket Manager.
*   **What to Use:** FastAPI `BackgroundTasks` or Celery.
*   **How to Make it Better:** Add configurable time delays between steps (e.g. `SIMULATION_EVENT_DELAY_MS` in settings) to model low-and-slow stealthy APT intrusions.
*   **How to Know it is Correct:** Triggering the simulation results in a steady stream of events flowing to the DB and broadcast over the WebSocket channel.
*   **How to Test, Verify & Improve:**
    *   Trigger the simulator via the API, then count the database records to confirm they match the expected count for the scenario:
        ```bash
        curl -X POST http://localhost:8000/api/v1/simulator/run -H "Content-Type: application/json" -d '{"scenario_id": "ot_sabotage"}'
        ```
*   **Possible Test Cases:**
    *   *Test Case 1 (Duplicate Simulation Run):* Trigger a simulation while another run is active. Verify the API handles this request (either runs them concurrently without key conflicts, or rejects the new run with a `409 Conflict` message).
    *   *Test Case 2 (Malformed Scenario ID):* Submit a payload with `{"scenario_id": "invalid_id"}`. Verify the response code is `404 Not Found` with a clear explanation of available scenario profiles.

---

## 👤 Developer B (Frontend) — Day 1 Workflow

### Task B1: CSS Design Tokens & Base Theme Configuration
*   **Goal:** Create a high-fidelity, cyber-resilient dark mode design system.
*   **What to Do:**
    1. Define tailwind CSS color tokens in `frontend/src/index.css` supporting dark mode variables (glowing neons, deep tech blues, dark surfaces, and alert indicators).
    2. Create css component class templates for glassmorphism containers:
       ```css
       .glass-card {
         background: rgba(10, 18, 36, 0.45);
         backdrop-filter: blur(8px);
         border: 1px solid rgba(22, 32, 48, 0.5);
         box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
       }
       ```
    3. Setup font families supporting monospace data readouts (e.g., JetBrains Mono, Fira Code) and title layouts (e.g., Orbitron, Inter).
*   **What to Use:** Tailwind CSS, PostCSS.
*   **How to Make it Better:** Add CSS keyframe configurations for warnings and alert pulses:
    ```css
    @keyframes danger-pulse {
      0%, 100% { box-shadow: 0 0 4px rgba(255, 77, 109, 0.2); }
      50% { box-shadow: 0 0 16px rgba(255, 77, 109, 0.6); }
    }
    .pulse-danger { animation: danger-pulse 2s infinite; }
    ```
*   **How to Know it is Correct:** Component panels render with dark semi-transparent glassmorphic backgrounds, clear text contrast, and smooth transitions on hover.
*   **How to Test, Verify & Improve:**
    *   Build standard layouts using custom CSS components. Inspect the DOM in the browser to confirm CSS classes resolve correctly and no styling errors occur.
*   **Possible Test Cases:**
    *   *Test Case 1 (High contrast validation):* Test colors using accessibility extensions (e.g. Lighthouse) to confirm text contrast ratios meet WCAG AA standards.
    *   *Test Case 2 (Flexbox Overflow):* Inspect custom CSS classes inside nested flex grids to confirm titles truncate (`truncate`) instead of breaking page layouts on small viewports.

---

### Task B2: Core Shell Layout & Base Routing Structure
*   **Goal:** Implement a responsive interface shell with protected routes.
*   **What to Do:**
    1. Setup the global App Shell framework in `frontend/src/components/layout/AppShell.tsx` housing the layout, primary sidebar navigation, and user status indicators.
    2. Register route guards (`ProtectedRoute.tsx`) utilizing Zustand stores (`auth.store.ts`) to verify session state before allowing page access.
*   **What to Use:** React Router, Zustand.
*   **How to Make it Better:** Add micro-interactions on nav links (transitions, indicator bars, scale changes).
*   **How to Know it is Correct:** Unauthenticated users are redirected to `/login`, and logged-in users access internal pages without issue.
*   **How to Test, Verify & Improve:**
    *   Verify the router hooks function:
        ```typescript
        // Simulate non-auth state in store, verify redirection:
        authStore.setState({ isAuthenticated: false, token: null });
        // Navigation to /dashboard should redirect user to /login
        ```
*   **Possible Test Cases:**
    *   *Test Case 1 (Deep Link Redirection):* Access the deep link `http://localhost:5173/ai-investigation/42` without active credentials. Confirm the system redirects you to `/login`, saves the redirect path, and successfully routes you back after authentication.

---

### Task B3: High-Performance Scrolling Log View
*   **Goal:** Build a logs console showing incoming telemetry in real-time.
*   **What to Do:**
    1. Implement a log visualizer stream in `frontend/src/features/dashboard/components/LiveEventStream.tsx`.
    2. Incorporate filter parameters so users can toggle between IT, OT, and correlated security alerts.
*   **What to Use:** React windowing tools (e.g. `react-window` or virtualized list utilities) to prevent render overhead when processing thousands of items.
*   **How to Make it Better:** Highlight IT logs (e.g., AD logs in cool blue) and OT SCADA logs (e.g., DNP3 command runs in industrial amber/orange) with custom labels.
*   **How to Know it is Correct:** Logs scroll smoothly as new events arrive via WebSockets, and user interactions (filtering, freezing the scroll) remain responsive.
*   **How to Test, Verify & Improve:**
    *   Feed a mock array of 1,000 logs into the component. Verify that the frame rate remains stable.
*   **Possible Test Cases:**
    *   *Test Case 1 (Log Freeze Action):* Scroll up into the log list manually. Confirm the viewport freezes new scroll tracking to allow copy/paste, and displays a warning banner ("Log stream paused. Click to resume").

---

### Task B4: Anomaly Risk Pulse Waveform Component
*   **Goal:** Build a telemetry rate and risk level waveform visualizer.
*   **What to Do:**
    1. Design an animated dashboard canvas widget showing real-time event counts and threat risk metrics.
    2. Animate sine-wave line elements using SVG path calculators to represent baseline vs observed states.
*   **What to Use:** HTML Canvas or SVG paths.
*   **How to Make it Better:** Set the wave amplitude and frequency to scale dynamically based on the current telemetry rates and risk levels.
*   **How to Know it is Correct:** The wave animations scale smoothly with changing event rates without causing layout shifts.
*   **How to Test, Verify & Improve:**
    *   Verify responsiveness by testing component rendering across mobile, tablet, and desktop display resolutions.
*   **Possible Test Cases:**
    *   *Test Case 1 (Zero Activity):* Zero out telemetry inputs. Verify that the waveform scales down to a flat baseline line rather than throwing coordinate errors.
    *   *Test Case 2 (High Risk Spikes):* Set risk scores above `0.85`. Confirm the observed wave turns red, and the border triggers a pulsing shadow indicator.

---
---

# 📅 DAY 2: Behavioral AI Engine, Correlation & Multi-Agent Investigators

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                 DAY 2                                   │
├────────────────────────────────────────┬────────────────────────────────┤
│      Developer A (Backend Core)        │    Developer B (UI & Layout)   │
├────────────────────────────────────────┼────────────────────────────────┤
│ 🔹 Task A5: Isolation Forest Model     │ 🔹 Task B5: ReactFlow Attack   │
│ 🔹 Task A6: Correlation Clustering     │            Graph Implementation│
│ 🔹 Task A7: Multi-Agent AI Investigator│ 🔹 Task B6: AI Chat & Sidebar  │
│            (MITRE, predictions, SOAR)  │ 🔹 Task B7: Vulnerability View │
└────────────────────────────────────────┴────────────────────────────────┘
```

---

## 👤 Developer A (Backend) — Day 2 Workflow

### Task A5: Unsupervised Behavior Anomaly Scorer (Isolation Forest)
*   **Goal:** Train and deploy an Isolation Forest pipeline to score event risk.
*   **What to Do:**
    1. Implement the ML anomaly pipeline in `backend/app/services/ml/service.py`.
    2. Convert incoming event properties (categorical dimensions: process name, endpoint IP, username) into numeric indices.
    3. Train the Isolation Forest model on historical baseline event logs.
    4. Expose a scoring method that computes an anomaly score (`0.0` to `1.0`) for new events.
*   **What to Use:** `scikit-learn` (IsolationForest), `numpy`.
*   **How to Make it Better:** Save the trained model parameters to a pickle/joblib file on local storage to avoid training overhead on every application reboot. Include defensive checks to re-initialize the baseline if the model file is missing.
*   **How to Know it is Correct:** Nominal operations yield scores below the threshold; anomalous activities (e.g. unknown remote administrative logins) yield scores above the threshold.
*   **How to Test, Verify & Improve:**
    *   Run unit tests:
        ```bash
        pytest backend/tests/unit/test_ml.py
        ```
*   **Possible Test Cases:**
    *   *Test Case 1 (Nominal Event):* Input an event mirroring baseline data (e.g. `user="r.sharma", process="chrome.exe"`). Verify that the model returns an anomaly score `< 0.3`.
    *   *Test Case 2 (Extreme Outlier Event):* Input an anomalous event (e.g. `user="SYSTEM", process="vssadmin.exe", raw_data={"command_line": "delete shadows /all"}`). Verify that the model returns a score `> 0.8`.

---

### Task A6: IT/OT Cross-Plane Incident Correlation Engine
*   **Goal:** Cluster related alerts into structured Incident records.
*   **What to Do:**
    1. Write the correlation logic in `backend/app/services/ai/correlation.py`.
    2. On receiving a high-risk event, query the active incidents created within a 15-minute window.
    3. Check if the incoming event shares the same host or user context as an active incident. If so, link the event to it.
    4. If no active match exists, create a new `Incident` record in the database.
*   **What to Use:** SQLAlchemy query logic, Python datetime filters.
*   **How to Make it Better:** Use window-based clustering algorithms to prevent duplicate alerts.
*   **How to Know it is Correct:** Sequential events (e.g., AD logon anomaly followed by SCADA command changes) on the same host map to a single incident ID.
*   **How to Test, Verify & Improve:**
    *   Run unit tests:
        ```bash
        pytest backend/tests/unit/test_correlation.py
        ```
*   **Possible Test Cases:**
    *   *Test Case 1 (Inside Correlation Window):* Insert Event 1 at `T+0` and Event 2 at `T+5 minutes` on the same host. Verify both events share the same `incident_id`.
    *   *Test Case 2 (Outside Correlation Window):* Insert Event 1 at `T+0` and Event 2 at `T+20 minutes` on the same host. Verify Event 2 triggers a new `Incident` record.

---

### Task A7: Multi-Agent AI Investigator & Threat Predictor
*   **Goal:** Build AI agents to attribute threats, predict attack paths, and generate response actions.
*   **What to Do:**
    1. Implement the agent coordinator in `backend/app/services/ai/service.py`.
    2. Integrate with the OpenRouter API.
    3. Define three distinct system prompts:
       *   **Attribution Agent:** Maps event signatures to MITRE ATT&CK techniques, CERT-In bulletins, and actor profiles.
       *   **Predictive Agent:** Computes the threat actor's likely next actions and confidence metrics.
       *   **SOAR Response Agent:** Generates playbooks of containment actions.
*   **What to Use:** OpenRouter API (Qwen-2.5/DeepSeek model integrations), JSON parse structures.
*   **How to Make it Better:** Use structured JSON outputs from the LLM to populate database fields, avoiding raw text parsing errors.
*   **How to Know it is Correct:** Triggering the AI agent updates the incident record with the threat narrative, predictions, and recommendations.
*   **How to Test, Verify & Improve:**
    *   Mock the API responses to test formatting logic:
        ```bash
        pytest backend/tests/unit/test_ai_agent.py
        ```
*   **Possible Test Cases:**
    *   *Test Case 1 (LLM JSON Schema Validation):* Mock the LLM returning malformed JSON. Verify the agent coordinator handles the parsing failure, logs the error, and falls back to a template response instead of crashing.
    *   *Test Case 2 (MITRE Code Extraction):* Verify that the AI agent successfully extracts MITRE technique codes (e.g., `T1486`) from logs and formats them correctly.

---

## 👤 Developer B (Frontend) — Day 2 Workflow

### Task B5: ReactFlow Attack Graph Implementation
*   **Goal:** Build an interactive canvas mapping the attack chain.
*   **What to Do:**
    1. Implement the attack path graph in `frontend/src/pages/AttackGraphPage.tsx` using ReactFlow.
    2. Fetch incident details from `/api/v1/incidents/{id}/graph`.
    3. Build a translator to map incident entities into ReactFlow node and edge structures.
    4. Style node cards based on entity types (blue for IT hosts, orange for OT SCADA).
*   **What to Use:** ReactFlow, Lucide Icons.
*   **How to Make it Better:** Use animated edges to show the direction of the attack path.
*   **How to Know it is Correct:** The graph displays the attack path clearly, scaling automatically to fit the screen.
*   **How to Test, Verify & Improve:**
    *   Mount the graph component with a mock data array. Verify nodes render in the correct positions.
*   **Possible Test Cases:**
    *   *Test Case 1 (Circular Dependencies):* Mock an incident that loops back (e.g. Host A ➜ Host B ➜ Host A). Verify that ReactFlow renders the loop without crashing the rendering process.

---

### Task B6: Interactive Analyst Chat Console
*   **Goal:** Create a chatbot interface for the incident investigation panel.
*   **What to Do:**
    1. Implement the chat interface in [AIInvestigationPage.tsx](file:///E:/Sentinel-AI/frontend/src/pages/AIInvestigationPage.tsx).
    2. Connect inputs to the `/api/v1/ai/chat` endpoint.
    3. Add starter prompts (e.g., "What techniques did the attacker use?").
*   **What to Use:** Framer Motion, Zustand state stores.
*   **How to Make it Better:** Style assistant messages in a terminal-like block, formatting lists and code snippets.
*   **How to Know it is Correct:** Users can query the AI analyst, receive formatted responses, and view source citations.
*   **How to Test, Verify & Improve:**
    *   Submit queries to the chatbot and verify that markdown elements render correctly.
*   **Possible Test Cases:**
    *   *Test Case 1 (Empty Prompt):* Attempt to submit an empty query. Verify that the submit button is disabled.
    *   *Test Case 2 (Network Disconnection):* Simulate a network drop during a chat request. Confirm that the UI displays a clean reconnection banner.

---

### Task B7: Government Vulnerability Prioritization Widget
*   **Goal:** Build a dashboard widget ranking assets based on vulnerability risk.
*   **What to Do:**
    1. Create a prioritization table in `frontend/src/features/dashboard/components/VulnerabilityPrioritizer.tsx`.
    2. Display CVE metrics and network topology risks.
*   **What to Use:** Tailwind CSS tables, Lucide Icons.
*   **How to Make it Better:** Add color-coded indicators for risk severity (red for critical exploits, blue for medium/low issues).
*   **How to Know it is Correct:** The table displays high-risk assets first, prioritizing them based on exploitability metrics.
*   **How to Test, Verify & Improve:**
    *   Confirm that clicking column headers correctly sorts table items by risk level or asset name.
*   **Possible Test Cases:**
    *   *Test Case 1 (Zero Vulns):* Load the table with zero active vulnerabilities. Verify that the component displays a clean status message.

---
---

# 📅 DAY 3: SOAR Orchestration, Reports & Platform Verification

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                 DAY 3                                   │
├────────────────────────────────────────┬────────────────────────────────┤
│      Developer A (Backend Core)        │    Developer B (UI & Layout)   │
├────────────────────────────────────────┼────────────────────────────────┤
│ 🔹 Task A8: SOAR Remediation APIs      │ 🔹 Task B8: Human Escalation   │
│ 🔹 Task A9: Executive PDF Report API   │            Gates & Playbooks   │
│ 🔹 Task A10: DB Query Optimization     │ 🔹 Task B9: Twin Simulation    │
│            & Index Tuning              │            Control Widgets     │
└────────────────────────────────────────┴────────────────────────────────┘
```

---

## 👤 Developer A (Backend) — Day 3 Workflow

### Task A8: SOAR Containment Playbooks & Execution APIs
*   **Goal:** Build API endpoints to execute containment actions (SOAR playbooks).
*   **What to Do:**
    1. Build the endpoint router in `backend/app/api/v1/endpoints/incidents.py`.
    2. Implement `POST /api/v1/incidents/{id}/remediate`.
    3. Define playbook actions:
       *   `isolate_endpoint` (updates database host state to `isolated`).
       *   `block_ip` (adds target IP to firewall block list model).
       *   `revoke_credentials` (sets user active state to `false`).
*   **What to Use:** SQLAlchemy, Pydantic validation structures.
*   **How to Make it Better:** Log all containment actions to an audit trail table to ensure auditability.
*   **How to Know it is Correct:** Triggering containment actions updates the database status of target hosts or users.
*   **How to Test, Verify & Improve:**
    *   Verify the endpoint updates host state:
        ```bash
        curl -X POST http://localhost:8000/api/v1/incidents/1/remediate \
          -H "Content-Type: application/json" \
          -d '{"action": "isolate_endpoint", "target": "WS-07"}'
        ```
*   **Possible Test Cases:**
    *   *Test Case 1 (Invalid Action):* Submit an unsupported action (e.g. `reboot_router`). Verify the API returns `400 Bad Request` with list of valid options.

---

### Task A9: Executive Report Generator API
*   **Goal:** Build an endpoint to generate and download PDF reports.
*   **What to Do:**
    1. Implement the report router in `backend/app/api/v1/endpoints/reports.py` exposing `GET /reports/{incident_id}`.
    2. Gather incident details, timeline events, and mapped MITRE techniques.
    3. Generate a structured PDF containing headers, timelines, and remediation summaries.
*   **What to Use:** Python PDF libraries (e.g., `ReportLab` or FPDF).
*   **How to Make it Better:** Add customizable branding (e.g., government agency headers) and digital signatures.
*   **How to Know it is Correct:** Accessing the endpoint returns a valid PDF attachment with correct incident data.
*   **How to Test, Verify & Improve:**
    *   Verify that requesting a report returns a PDF payload:
        ```bash
        curl -I http://localhost:8000/api/v1/reports/1
        # Check Content-Type is application/pdf
        ```
*   **Possible Test Cases:**
    *   *Test Case 1 (Non-existent Incident ID):* Request a report for a missing ID. Verify the API returns a `404 Not Found` response code.

---

### Task A10: DB Query Index Tuning & Performance Profiling
*   **Goal:** Optimize database query times and performance profiles.
*   **What to Do:**
    1. Review slow queries using Postgres `EXPLAIN ANALYZE` logs.
    2. Add indexes on fields commonly used for filtering (e.g., `incident_id`, `is_simulated`).
*   **What to Use:** PostgreSQL shell commands, SQLAlchemy explain tools.
*   **How to Make it Better:** Use composite indexes for queries that filter on multiple columns (e.g., `organization_id` + `timestamp`).
*   **How to Know it is Correct:** Query times remain low even with large databases.
*   **How to Test, Verify & Improve:**
    *   Profile database query times using slow-query logging.
*   **Possible Test Cases:**
    *   *Test Case 1 (Large Dataset Queries):* Seed 50,000 logs into the database. Run `GET /api/v1/events` and confirm response times remain under 200ms.

---

## 👤 Developer B (Frontend) — Day 3 Workflow

### Task B8: Human-in-the-Loop Escalation Gates & Playbooks
*   **Goal:** Implement confirmation dialogs for SOAR playbook actions.
*   **What to Do:**
    1. Design playbooks widgets in `frontend/src/features/incidents/components/SOARPlaybook.tsx`.
    2. Add toggle buttons for containment actions, opening validation dialogs before sending API requests.
*   **What to Use:** Zustand state stores, Framer Motion modals.
*   **How to Make it Better:** Add warning overlays highlighting the impact of the containment action (e.g., "Isolating WS-07 will terminate active network connections").
*   **How to Know it is Correct:** Clicking containment actions opens a validation dialog, and confirming triggers the corresponding API requests.
*   **How to Test, Verify & Improve:**
    *   Verify that clicking cancel aborts requests, and confirming triggers the correct API calls.
*   **Possible Test Cases:**
    *   *Test Case 1 (Dialog Abort):* Open the confirmation dialog and click Cancel. Verify no requests are sent and the dialog closes cleanly.

---

### Task B9: Digital Twin Simulation Controls
*   **Goal:** Add dashboard controls for launching Red Team simulation scenarios.
*   **What to Do:**
    1. Implement control widgets in `frontend/src/features/simulator/components/TwinControls.tsx`.
    2. Let users trigger scenario simulations and preview hypothetical attack paths on the ReactFlow canvas.
*   **What to Use:** React Flow, Tailwind UI.
*   **How to Make it Better:** Add interactive sliders to adjust simulation delay times.
*   **How to Know it is Correct:** Adjusting simulation controls triggers simulator tasks with correct timing and paths.
*   **How to Test, Verify & Improve:**
    *   Trigger scenarios from the UI and verify that events scroll into the console dashboard as expected.
*   **Possible Test Cases:**
    *   *Test Case 1 (Active Simulation State):* Verify that triggering a simulation disables the launch controls until the current run completes.

---

## 🏁 Final Integration Verification Checklist

Before pushing code to staging, verify the complete pipeline using the steps below:

```
[ Step 1 ] Boot Database Server ➜ postgresql://localhost:5432/sentinel_ai
[ Step 2 ] Run Python Migrations ➜ alembic upgrade head
[ Step 3 ] Run Database Seeder ➜ python -m app.db.init_db
[ Step 4 ] Launch API Servers ➜ uvicorn app.main:app --port 8000
[ Step 5 ] Launch Frontend Client ➜ npm run dev (http://localhost:5173)
[ Step 6 ] Run End-to-End Simulation ➜ Log In ➜ Trigger Scenario ➜ Verify Live Feeds & AI Narrative Graph
```
