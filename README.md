# OR ReadySync

## Operating Room Readiness Synchronization Platform

OR ReadySync is a web-based operating room readiness synchronization platform designed to reduce avoidable theatre idle time by coordinating the readiness of four critical resources:

- Patient
- Staff
- Equipment
- Sterile Supplies

The system provides a centralized workflow for monitoring theatre sessions, identifying readiness blockers, calculating avoidable idle time, managing operational alerts and escalations, executing deterministic failure test cases, and measuring performance against a baseline.

---

## 1. Problem Statement

Operating rooms can experience avoidable idle time when the patient, required staff, equipment, and sterile supplies are not ready at the same time.

This problem becomes particularly important during patient transfers and coordination between healthcare facilities, where delays can occur because:

- The patient has not arrived or is not ready.
- Required staff are unavailable or delayed.
- Surgical equipment is unavailable or not prepared.
- Sterile supplies are not ready.
- The responsible person for resolving a blocker is unclear.
- Escalation occurs too late.
- There is no single view of overall operating-room readiness.

OR ReadySync addresses this problem by synchronizing the readiness state of the required resources and identifying the resource that is preventing the theatre session from becoming ready.

---

# 2. Project Objectives

The main objectives of OR ReadySync are:

1. Monitor theatre schedules.
2. Track patient readiness.
3. Track staff readiness.
4. Track equipment readiness.
5. Track sterile supply readiness.
6. Synchronize the readiness of all required resources.
7. Identify the primary readiness blocker.
8. Calculate avoidable theatre idle time.
9. Provide operational recommendations.
10. Create and manage alerts with stateful escalation history.
11. Assign ownership to unresolved issues.
12. Support SLA time-based escalation rules (15-minute decay intervals).
13. Test common operational failure scenarios via a deterministic test suite.
14. Compare baseline performance with OR ReadySync performance.
15. Calculate minutes saved and percentage improvement.
16. Support error and ambiguous-case review.
17. Provide an end-to-end operational prototype.

---

# 3. Core Concept

An operating-room session is considered fully ready only when all required resources are ready.

The system monitors:

```text
Patient
   +
Staff
   +
Equipment
   +
Sterile Supplies
        ↓
Readiness Synchronization
        ↓
Overall Session Status
        ↓
Blocker Identification
        ↓
Avoidable Idle-Time Calculation
        ↓
Alert / SLA Escalation Engine
        ↓
Resolution
        ↓
Performance Measurement
```

---

# 4. Readiness Synchronization

OR ReadySync uses four readiness domains.

| Resource | Purpose |
|---|---|
| Patient | Determines whether the patient is ready for the scheduled procedure |
| Staff | Determines whether the required team is available |
| Equipment | Determines whether required equipment is available and ready |
| Sterile Supplies | Determines whether required sterile materials are ready |

The system compares the readiness time of each resource with the scheduled theatre start time.

---

# 5. Formal Data Schema

The application uses structured TypeScript data models and interfaces (`src/types/index.ts`) for all operational entities:

- **Theatre / Session Information (`TheatreSession`)**: Stores ID, facility, theatre, procedure, scheduled start time, overall status, readiness score, predicted idle minutes, primary blocker, and linked resources.
- **Resource Readiness (`ResourceDetails`)**: Tracks resource status (`READY`, `NOT_READY`, `DELAYED`, `AT_RISK`, `UNKNOWN`), expected ready time, actual ready time, delay reason, and assigned owner.
- **Alerts (`OperationalAlert`)**: Stores ID, session ID, theatre, facility, issue description, priority (`NORMAL`, `WARNING`, `URGENT`, `ESCALATED`), status (`OPEN`, `IN_PROGRESS`, `RESOLVED`), owner, creation timestamp (`createdAt`), due time, escalation level, escalation history, and follow-up audit notes.
- **Escalation History (`EscalationHistory`)**: Stateful log capturing timestamp, previous priority, new priority, escalation reason, and triggering source.
- **Failure Test Cases (`DeterministicTestCase` & `TestExecutionResult`)**: Strict schemas for expected vs. actual test assertions and PASS/FAIL reporting.

This formal data schema ensures consistent, stateful tracking across the application while remaining a clean, self-contained client-side prototype.

---

# 6. Readiness Calculation

## All Resources Ready Time

The complete session cannot become ready until the last required resource becomes ready.

```text
All Resources Ready Time =
MAX(
    Patient Ready Time,
    Staff Ready Time,
    Equipment Ready Time,
    Sterile Supplies Ready Time
)
```

## Avoidable Idle Minutes

```text
Avoidable Idle Minutes =
MAX(
    0,
    All Resources Ready Time - Scheduled Theatre Start Time
)
```

### Example

```text
Scheduled Theatre Start = 10:10

Patient Ready           = 09:50
Staff Ready             = 09:58
Equipment Ready         = 10:38
Sterile Supplies Ready  = 09:35
```

The latest readiness time is `10:38`. Therefore:

```text
Avoidable Idle Time = 10:38 - 10:10
                    = 28 minutes
```

Equipment is identified as the primary blocker because it is the final required resource to become ready.

---

# 7. Application Modules

## Dashboard

The Dashboard provides a centralized operational overview, presenting:

- Theatre sessions table & status gauges
- Overall OR Readiness Score (0–100%)
- Avoidable idle minutes & active blockers
- Unresolved high-priority actions
- Facility/session filtering

## Theatre Schedule

Overview of planned operating-room sessions across facilities, allowing filtering by status, theatre, or facility and one-click navigation to the synchronizer view.

## Readiness Synchronizer

The core synchronization view showing resource cards for Patient, Staff, Equipment, and Sterile Supplies with inline status editing, readiness calculations, operational recommendations, and a **RE-CHECK READINESS** action button.

---

# 8. Alerts & Escalation (SLA / Time-Based Escalation)

The Alerts & Escalation module manages operational readiness bottlenecks using an automated, time-based SLA decay workflow implemented in `src/services/slaEngine.ts`.

## SLA Escalation Workflow

Unresolved open alerts are evaluated based on elapsed time from `createdAt` and automatically progress through priority levels:

```text
NORMAL
  ↓ after 15 minutes unresolved
WARNING
  ↓ after another 15 minutes unresolved (30m total)
URGENT
  ↓ after another 15 minutes unresolved (45m total)
ESCALATED
```

## SLA Tracking & Information

For every alert, the control panel displays:

- **Current Priority**: `NORMAL`, `WARNING`, `URGENT`, or `ESCALATED`
- **Creation Time & Due Time**: `createdAt` ISO timestamp and target resolution time
- **SLA Status Badge**: `ON TRACK`, `WARNING`, `BREACHED`, `ESCALATED`, or `RESOLVED`
- **Time Remaining**: Countdown until the next escalation level (e.g. "12 min remaining until URGENT")
- **Escalation History Timeline**: Stateful log recording priority transitions (`previousPriority → newPriority`), timestamps, reasons, and triggering agents (`SLA Time-Decay Engine`, `User Manual Update`, `Readiness Analysis Engine`).
- **Resolution Behavior**: Resolving an alert (`RESOLVED`) immediately stops further SLA decay.
- **Manual SLA Re-Check**: A **"Re-check SLA"** action button allows immediate evaluation of SLA timers across all active alerts without server dependencies.

*Note: SLA evaluation runs entirely on the client side using browser time and deterministic logic.*

---

# 9. Failure Test Center

The Failure Test Center includes a suite of **deterministic test cases (TEST-001 to TEST-005)** alongside interactive synthetic failure scenario runners.

## Deterministic Test Cases

| Test Case | Description | Expected Outcome |
|---|---|---|
| **TEST-001 — Patient Transit Delay** | Patient arrival delayed to 10:20 AM for a 10:00 AM start | Primary Blocker = **Patient**, Session Status = **DELAYED**, Avoidable Idle = **20 min** |
| **TEST-002 — Missing Autoclave Equipment Batch** | Infusion pump calibration batch delayed to 10:30 AM | Primary Blocker = **Equipment**, Session Status = **DELAYED**, Avoidable Idle = **30 min** |
| **TEST-003 — Staff Not Ready** | Anaesthesia team arrival delayed to 10:25 AM | Primary Blocker = **Staff**, Session Status = **DELAYED**, Avoidable Idle = **25 min** |
| **TEST-004 — Sterile Supplies Delayed** | Biological indicator verification delays tray release to 10:15 AM | Primary Blocker = **Sterile Supplies**, Session Status = **DELAYED**, Avoidable Idle = **15 min** |
| **TEST-005 — All Resources Ready** | Positive control test with all resources ready by 09:50 AM | Primary Blocker = **None**, Session Status = **READY**, Avoidable Idle = **0 min** |

## Test Execution & Pass/Fail Validation

- **Expected vs. Actual Comparison**: Compares actual primary blocker, session status, all ready time, and idle minutes against test assertions.
- **PASS/FAIL Badges**: Reports `✓ PASS` (emerald) or `✗ FAIL` (rose) with assertion discrepancy details if any value differs.
- **"RUN ALL TESTS"**: Executes all 5 test cases deterministically and displays a summary header (e.g. `5 Tests | 5 Passed | 0 Failed | 100% Pass Rate`).

---

# 10. Baseline & Performance

The Baseline & Performance module measures operational improvement by comparing historical baseline idle time against OR ReadySync synchronized idle time.

## Metrics Formulas

```text
Minutes Saved = Baseline Idle Minutes - OR ReadySync Idle Minutes

Improvement % = ((Baseline Idle Minutes - OR ReadySync Idle Minutes) / Baseline Idle Minutes) × 100
```

### Current Demonstration Dataset

```text
Baseline Idle Time       = 225 minutes
OR ReadySync Idle Time   = 90 minutes
Minutes Saved            = 135 minutes
Improvement              = 60%
```

*These values represent prototype demonstration results calculated from mock operational data.*

---

# 11. Error and Ambiguous-Case Handling

The system distinguishes between clear single-resource bottlenecks and overlapping/incomplete data cases:

```text
Clearly Identifiable Blocker → Targeted Operational Prompt

vs.

Overlapping / Ambiguous Delays → Human Review Required (Clinical Triage)
```

---

# 12. End-to-End Workflow

```text
1. Select Theatre Session
          ↓
2. Check Resource Readiness (Patient, Staff, Equipment, Sterile Supplies)
          ↓
3. Synchronize Readiness & Calculate Avoidable Idle Time
          ↓
4. Identify Primary Blocker & Generate Recommendation
          ↓
5. Create / Review Operational Alert
          ↓
6. Assign Owner & Track SLA Time-Decay Escalation (15m intervals)
          ↓
7. Record Stateful Escalation History
          ↓
8. Resolve Issue & Stop SLA Decay
          ↓
9. Re-check Readiness & Measure Baseline Performance
```

---

# 13. Technology Stack

## Frontend
- **React** (v19)
- **TypeScript** (v6)
- **Vite** (v8)
- **Tailwind CSS** (v4)
- **lucide-react** icons

## Architecture & Data
- **Client-Side State Management**: React Context (`AppContext`, `useApp`)
- **Deterministic Calculation Engine**: `src/services/aiEngine.ts`
- **Client-Side SLA Escalation Engine**: `src/services/slaEngine.ts`
- **Data Model**: Structured TypeScript interfaces (`src/types/index.ts`)
- **Persistence**: Browser `localStorage`

---

# 14. Architecture

```text
┌────────────────────────────────────────┐
│             OR ReadySync UI             │
│                                        │
│ Dashboard                              │
│ Theatre Schedule                       │
│ Readiness Synchronizer                 │
│ Alerts & Escalation                    │
│ Failure Test Center                    │
│ Baseline & Performance                 │
│ Mock Data                              │
└───────────────────┬────────────────────┘
                    │
                    ↓
┌────────────────────────────────────────┐
│       Readiness Analysis Engine        │
│       (`src/services/aiEngine.ts`)     │
│                                        │
│ Blocker Detection & Idle-Time Calc     │
└───────────────────┬────────────────────┘
                    │
                    ↓
┌────────────────────────────────────────┐
│      SLA & Time-Decay Escalation       │
│      (`src/services/slaEngine.ts`)     │
│                                        │
│ 15m Decay Rules & History Logging      │
└───────────────────┬────────────────────┘
                    │
                    ↓
┌────────────────────────────────────────┐
│       Operational Workflow             │
│                                        │
│ Alerts → Assignment → Escalation       │
│    → Resolution → Re-check Readiness   │
└────────────────────────────────────────┘
```

---

# 15. Data Model

The project represents operational healthcare data through formal TypeScript schemas including:

- Theatre
- Session
- Patient
- Staff
- Equipment
- Sterile Supplies
- Readiness Times
- Delay Information
- Alerts
- Owners
- SLA State
- Escalation Status
- Escalation History
- Failure Test Cases
- Performance Metrics

*The project uses synthetic mock operational data stored locally in browser state.*

---

# 16. Project Status

## Core Functionality
- [x] Problem definition & solution scope
- [x] Theatre schedule & session management
- [x] 4 Resource readiness domains (Patient, Staff, Equipment, Sterile Supplies)
- [x] Readiness synchronization engine
- [x] Primary blocker identification
- [x] Avoidable idle-time calculation
- [x] OR Readiness score (0–100%)
- [x] Operational recommendations
- [x] Re-check readiness workflow

## Operational Management & SLA
- [x] Formal TypeScript data schema
- [x] Stateful alert/escalation tracking
- [x] SLA time-based escalation (15m intervals: Normal → Warning → Urgent → Escalated)
- [x] Escalation history tracking with timestamps and reasons
- [x] Issue owner assignment
- [x] Due times & countdown timers
- [x] Manual "Re-check SLA" action
- [x] Resolution workflow (stops SLA decay)

## Failure Testing
- [x] Deterministic failure test suite (TEST-001 to TEST-005)
- [x] TEST-001 Patient Transit Delay
- [x] TEST-002 Missing Autoclave Equipment Batch
- [x] TEST-003 Staff Not Ready
- [x] TEST-004 Sterile Supplies Delayed
- [x] TEST-005 All Resources Ready (Positive Control)
- [x] Expected vs actual assertion comparison
- [x] PASS/FAIL test reporting & summary runner

## Performance & Quality
- [x] Baseline vs synchronized performance comparison
- [x] Minutes saved & percentage improvement calculations
- [x] Zero TypeScript errors (`npm run build` passing)
- [x] Clean linter compliance (`npm run lint` passing with 0 warnings, 0 errors)

---

# 17. Testing Approach

The project is validated using:

1. **Deterministic Test Suite (TEST-001 to TEST-005)**: Evaluates patient transit delay, missing autoclave batch, staff delay, sterile supply hold, and all-resources-ready positive control against expected assertions.
2. **Interactive Failure Injection**: Synthetic scenario runners in the Failure Test Center.
3. **Build & Lint Verification**:
   - `npm run build` → Successful production bundle compilation (0 errors).
   - `npm run lint` → 0 warnings and 0 errors via `oxlint`.

---

# 18. Important Scope and Limitations

OR ReadySync is an **academic software prototype**.

It currently:

- Uses mock/demo operational data.
- Does not connect to real hospital servers or external APIs.
- Does not use real patient health records (HIPAA synthetic data only).
- Does not provide clinical decision-making or medical diagnoses.
- Does not replace clinical or hospital staff.
- Operates 100% on the client side via React and `localStorage`.

---

# 19. Running the Project Locally

## Clone the repository
```bash
git clone https://github.com/Amirdhadharshini/ORReadySync.git
cd ORReadySync
```

## Install dependencies
```bash
npm install
```

## Start the development server
```bash
npm run dev
```

Available at `http://localhost:5173`.

## Production Build & Linting
```bash
npm run build
npm run lint
```

---

# 20. Deployment

Repository:
```text
https://github.com/Amirdhadharshini/ORReadySync
```

The application is deployed on Vercel as a Vite React application.

---

## Author

**Amirdha Dharshini**  
Academic Project: **OR ReadySync**

---

## License

This project is developed for academic, educational, and demonstration purposes.