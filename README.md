# OR ReadySync

## Operating Room Readiness Synchronization Platform

OR ReadySync is a web-based operating room readiness synchronization platform designed to reduce avoidable theatre idle time by coordinating the readiness of four critical resources:

- Patient
- Staff
- Equipment
- Sterile Supplies

The system provides a centralized workflow for monitoring theatre sessions, identifying readiness blockers, calculating avoidable idle time, managing operational alerts and escalations, testing failure scenarios, and measuring performance against a baseline.

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
10. Create and manage alerts.
11. Assign ownership to unresolved issues.
12. Support due times and escalation.
13. Test common operational failure scenarios.
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
Alert / Escalation
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

# 5. Readiness Calculation

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

The latest readiness time is:

```text
10:38
```

Therefore:

```text
Avoidable Idle Time = 10:38 - 10:10
                    = 28 minutes
```

The equipment is identified as the primary blocker because it is the final required resource to become ready.

---

# 6. Application Modules

## Dashboard

The Dashboard provides a centralized operational overview.

It presents information such as:

- Theatre sessions
- Readiness status
- Readiness score
- Avoidable idle minutes
- Active blockers
- High-priority actions
- Urgent issues
- Escalated cases
- Facility/session information

The dashboard is intended to help users identify sessions that require attention quickly.

---

## Theatre Schedule

The Theatre Schedule module provides an overview of planned operating-room sessions.

It includes information such as:

- Theatre/OR
- Scheduled start time
- Session information
- Facility
- Readiness state
- Session status
- Operational blockers

A session can be selected for detailed readiness analysis.

---

## Readiness Synchronizer

The Readiness Synchronizer is the core module of OR ReadySync.

It displays the readiness state of:

```text
Patient
Staff
Equipment
Sterile Supplies
```

The system determines:

- Overall readiness
- Latest resource readiness time
- Primary blocker
- Avoidable idle minutes
- Readiness score
- Operational recommendation

### Re-check Readiness

The application provides a:

```text
RE-CHECK READINESS
```

action.

The re-check recalculates the current readiness state and updates the analysis based on the current resource information.

---

# 7. Alerts & Escalation

The Alerts & Escalation module manages operational issues identified during readiness analysis.

An alert can contain:

- Issue description
- Priority
- Owner
- Due time
- Status
- Assignment
- Follow-up information
- Escalation state
- Resolution information

## Priority Levels

```text
Normal
Warning
Urgent
Escalated
```

## Alert Status

```text
Open
In Progress
Resolved
```

The purpose of this workflow is to ensure that a readiness blocker has an identifiable owner and can be followed through to resolution.

---

# 8. Failure Test Center

The Failure Test Center allows the readiness workflow to be tested under common operational failure conditions.

Supported scenarios include:

### Equipment Unavailable

Simulates a required equipment delay or unavailability.

Expected operational result:

```text
Equipment → Blocker
Session → Delayed / At Risk
Operational action → Required
```

### Staff Not Ready

Simulates unavailable or delayed staff.

```text
Staff → Blocker
Session → Delayed
Operational action → Required
```

### Patient Transfer Delayed

Simulates a patient transfer arriving later than required.

```text
Patient → Blocker
Session → Delayed
Idle time → Recalculated
```

### Sterile Supplies Not Ready

Simulates unavailable or delayed sterile supplies.

```text
Sterile Supplies → Blocker
Session → Delayed
Operational action → Required
```

These scenarios are intended to demonstrate how OR ReadySync responds to different readiness failures.

---

# 9. Baseline & Performance

OR ReadySync includes a performance analysis module to compare baseline theatre idle time against the idle time represented by the OR ReadySync workflow.

The system measures:

- Baseline idle minutes
- OR ReadySync idle minutes
- Minutes saved
- Improvement percentage

## Minutes Saved

```text
Minutes Saved =
Baseline Idle Minutes - OR ReadySync Idle Minutes
```

## Improvement Percentage

```text
Improvement % =
(
Baseline Idle Minutes - OR ReadySync Idle Minutes
)
/
Baseline Idle Minutes
× 100
```

The values are intended to demonstrate measurable operational improvement using the project's demonstration data.

### Current Demonstration Dataset

The current mock demonstration data represents:

```text
Baseline Idle Time       = 225 minutes
OR ReadySync Idle Time   = 90 minutes
Minutes Saved            = 135 minutes
Improvement              = 60%
```

These values are **prototype/demo results**, not results from a real hospital deployment or clinical study.

---

# 10. Error and Ambiguous-Case Handling

Operational data may sometimes be incomplete or produce ambiguous situations.

OR ReadySync is designed to distinguish between:

```text
Clearly Identifiable Blocker
        ↓
Operational Action

vs.

Insufficient / Ambiguous Information
        ↓
Human Review Required
```

The system should not treat incomplete information as proof of a specific operational cause.

This supports safer operational decision-making in the prototype.

---

# 11. End-to-End Workflow

A typical OR ReadySync workflow is:

```text
1. Select Theatre Session
          ↓
2. View Scheduled Start
          ↓
3. Check Patient Readiness
          ↓
4. Check Staff Readiness
          ↓
5. Check Equipment Readiness
          ↓
6. Check Sterile Supplies Readiness
          ↓
7. Synchronize Readiness
          ↓
8. Identify Blocker
          ↓
9. Calculate Avoidable Idle Time
          ↓
10. Create / Review Alert
          ↓
11. Assign Owner
          ↓
12. Escalate if Necessary
          ↓
13. Resolve Issue
          ↓
14. Re-check Readiness
          ↓
15. Measure Performance
```

This connects the major modules into a single operational workflow.

---

# 12. Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

## Development

- Visual Studio Code
- Git
- GitHub

## Deployment

- Vercel

## Data

- Mock/demo operational data
- Client-side application state
- Local browser persistence where applicable

---

# 13. Architecture

The current prototype follows a frontend-focused architecture:

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
│ Mock Data                               │
└───────────────────┬────────────────────┘
                    │
                    ↓
┌────────────────────────────────────────┐
│       Readiness Analysis Engine         │
│                                        │
│ Patient Readiness                      │
│ Staff Readiness                        │
│ Equipment Readiness                    │
│ Sterile Supply Readiness               │
│ Blocker Detection                      │
│ Idle-Time Calculation                  │
└───────────────────┬────────────────────┘
                    │
                    ↓
┌────────────────────────────────────────┐
│       Operational Workflow             │
│                                        │
│ Alerts → Assignment → Escalation       │
│             → Resolution               │
│                                        │
│ Baseline → Performance Measurement     │
└────────────────────────────────────────┘
```

---

# 14. Data Model

The prototype represents operational information around theatre sessions, including:

```text
Theatre
Session
Patient
Staff
Equipment
Sterile Supplies
Readiness Times
Delay Information
Alerts
Owners
Escalation Status
Performance Metrics
```

The application uses demonstration/mock information rather than real hospital records.

---

# 15. Project Status

## Core Functionality

- [x] Problem definition
- [x] Proposed solution
- [x] Theatre schedule
- [x] Patient readiness
- [x] Staff readiness
- [x] Equipment readiness
- [x] Sterile supply readiness
- [x] Readiness synchronization
- [x] Blocker identification
- [x] Avoidable idle-time calculation
- [x] Readiness status
- [x] Readiness score
- [x] Operational recommendations
- [x] Re-check readiness workflow

## Operational Management

- [x] Alerts
- [x] Alert priorities
- [x] Issue ownership
- [x] Due times
- [x] Follow-up information
- [x] Escalation workflow
- [x] Resolution workflow

## Failure Testing

- [x] Equipment unavailable scenario
- [x] Staff not ready scenario
- [x] Patient transfer delay scenario
- [x] Sterile supply delay scenario

## Performance

- [x] Baseline idle-time measurement
- [x] OR ReadySync idle-time measurement
- [x] Minutes saved
- [x] Improvement percentage
- [x] Performance dashboard

## Data & Prototype

- [x] Mock operational data
- [x] Client-side state management
- [x] Local persistence where applicable
- [x] Responsive interface
- [x] GitHub repository
- [x] Vercel deployment

---

# 16. Testing Approach

The project should be validated using both normal and failure scenarios.

## Normal Readiness

```text
All required resources ready before scheduled start
        ↓
READY
        ↓
0 avoidable idle minutes
```

## Single Resource Delay

```text
One required resource becomes ready after scheduled start
        ↓
DELAYED
        ↓
Blocker identified
        ↓
Idle time calculated
```

## Multiple Resource Delays

```text
Multiple resources delayed
        ↓
Latest required readiness time identified
        ↓
Primary blocker determined
        ↓
Idle time calculated
```

## Ambiguous Case

```text
Insufficient information
        ↓
Human review required
```

---

# 17. Important Scope and Limitations

OR ReadySync is an **academic software prototype**.

It currently:

- Uses mock/demo operational data.
- Does not connect to real hospital systems.
- Does not use real patient information.
- Does not provide clinical decision-making.
- Does not replace clinical or hospital staff.
- Does not integrate with real hospital scheduling systems.
- Does not provide production healthcare authentication.
- Uses rule-based operational readiness analysis.

The project demonstrates the proposed synchronization and operational workflow rather than claiming production hospital deployment.

---

# 18. Rule-Based Analysis

The readiness analysis in this prototype is based on deterministic rules and calculations.

It should therefore be described as:

**Operational Readiness Analysis Engine**

rather than claiming that the application uses a machine-learning model or generative AI.

The project does not include an AI chatbot.

---

# 19. Future Enhancements

Possible future enhancements include:

- Secure backend database
- Production authentication
- Role-based access control
- Real-time hospital system integration
- Hospital scheduling integration
- Staff roster integration
- Equipment tracking integration
- Real-time notifications
- SMS/email escalation
- Audit logging
- Historical analytics
- Predictive delay modelling
- Advanced analytics
- Healthcare security and privacy controls

These enhancements would be required before considering deployment in a real healthcare environment.

---

# 20. Academic Project Scope

OR ReadySync demonstrates a software-based approach to improving operating-room readiness coordination.

The project focuses on:

```text
Readiness Tracking
       +
Synchronization
       +
Blocker Detection
       +
Idle-Time Measurement
       +
Alert Management
       +
Escalation
       +
Performance Evaluation
```

The intended outcome is to provide better visibility into readiness blockers and demonstrate how improved coordination can reduce avoidable theatre idle time.

---

# 21. Running the Project Locally

## Clone the repository

```bash
git clone https://github.com/Amirdhadharshini/ORReadySync.git
```

## Open the project

```bash
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

The application will normally be available at:

```text
http://localhost:5173
```

---

# 22. Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

# 23. Deployment

The project is maintained in GitHub and deployed using Vercel.

Repository:

```text
https://github.com/Amirdhadharshini/ORReadySync
```

The application uses Vite for frontend development and production builds.

---

# 24. Evaluation Summary

OR ReadySync is designed to satisfy the main requirements of the operating-room readiness synchronization problem:

| Problem Requirement | Implementation |
|---|---|
| Theatre scheduling | Theatre Schedule |
| Patient readiness | Readiness Synchronizer |
| Staff readiness | Readiness Synchronizer |
| Equipment readiness | Readiness Synchronizer |
| Sterile supplies | Readiness Synchronizer |
| Resource synchronization | Readiness Analysis Engine |
| Blocker identification | Readiness Analysis |
| Idle-time calculation | Readiness Engine |
| Failure handling | Failure Test Center |
| Alert management | Alerts & Escalation |
| Ownership | Alert workflow |
| Due time | Alert workflow |
| Escalation | Alert workflow |
| Resolution | Alert workflow |
| Baseline comparison | Baseline & Performance |
| Minutes saved | Performance calculation |
| Improvement percentage | Performance calculation |
| Error/ambiguous cases | Operational analysis |
| End-to-end workflow | Integrated prototype |

---

# 25. Project Development Stage

The project was developed incrementally from:

```text
Problem Identification
        ↓
System Design
        ↓
UI Prototype
        ↓
Readiness Synchronization
        ↓
Blocker Detection
        ↓
Failure Handling
        ↓
Alerts & Escalation
        ↓
Performance Measurement
        ↓
Testing & Refinement
        ↓
Deployment
```

The current application represents a functional academic prototype rather than a production hospital information system.

---

## Author

**Amirdha Dharshini**

Academic Project: **OR ReadySync**

---

## License

This project is developed for academic, educational, and demonstration purposes.