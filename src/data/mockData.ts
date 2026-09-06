import type { TheatreSession, OperationalAlert, FailureScenario, AuthUser } from '../types';

export interface DemoAccount extends AuthUser {
  password: string;
}

export const DEMO_USERS: DemoAccount[] = [
  {
    email: 'director@orreadysync.demo',
    password: 'demo123',
    name: 'Dr. Sarah Jenkins',
    role: 'Chief OR Director',
    initials: 'SJ'
  },
  {
    email: 'coordinator@orreadysync.demo',
    password: 'demo123',
    name: 'Marcus Vance',
    role: 'OR Operations Coordinator',
    initials: 'MV'
  },
  {
    email: 'equipment@orreadysync.demo',
    password: 'demo123',
    name: 'Elena Rostova',
    role: 'Biomedical Equipment Lead',
    initials: 'ER'
  }
];

export const INITIAL_SESSIONS: TheatreSession[] = [
  {
    id: 'SES-101',
    facility: 'St. Jude Memorial Hospital',
    theatre: 'OR-01',
    procedure: 'Total Knee Arthroplasty',
    patientId: 'PAT-1024',
    patientName: 'Fictional Patient A',
    scheduledStart: '08:00 AM',
    patient: {
      status: 'READY',
      expectedReadyTime: '07:50 AM',
      actualReadyTime: '07:48 AM',
      owner: 'Patient Pre-Op Care Unit'
    },
    staff: {
      status: 'READY',
      expectedReadyTime: '07:55 AM',
      actualReadyTime: '07:52 AM',
      owner: 'Surgical Team Alpha'
    },
    equipment: {
      status: 'READY',
      expectedReadyTime: '07:45 AM',
      actualReadyTime: '07:40 AM',
      owner: 'Biomedical Equipment Services'
    },
    sterileSupplies: {
      status: 'READY',
      expectedReadyTime: '07:40 AM',
      actualReadyTime: '07:35 AM',
      owner: 'Central Sterile Processing'
    },
    overallStatus: 'READY',
    readinessScore: 98,
    predictedIdleMinutes: 0,
    mainBlocker: 'None',
    aiRecommendation: 'All 4 resources are ready. Room setup complete for on-time start at 08:00 AM.',
    allReadyTime: '07:52 AM',
    baselineIdleMinutes: 15
  },
  {
    id: 'SES-102',
    facility: 'St. Jude Memorial Hospital',
    theatre: 'OR-02',
    procedure: 'Laparoscopic Cholecystectomy',
    patientId: 'PAT-2089',
    patientName: 'Fictional Patient B',
    scheduledStart: '09:15 AM',
    patient: {
      status: 'READY',
      expectedReadyTime: '09:05 AM',
      actualReadyTime: '09:02 AM',
      owner: 'Same-Day Surgery Suite'
    },
    staff: {
      status: 'AT_RISK',
      expectedReadyTime: '09:22 AM',
      delayReason: 'Attending Anaesthesiologist completing prior emergent intubation',
      owner: 'Anaesthesia Operations Lead'
    },
    equipment: {
      status: 'READY',
      expectedReadyTime: '08:50 AM',
      actualReadyTime: '08:45 AM',
      owner: 'Biomedical Equipment Services'
    },
    sterileSupplies: {
      status: 'READY',
      expectedReadyTime: '08:45 AM',
      actualReadyTime: '08:40 AM',
      owner: 'Central Sterile Processing'
    },
    overallStatus: 'AT_RISK',
    readinessScore: 78,
    predictedIdleMinutes: 7,
    mainBlocker: 'Staff',
    aiRecommendation: 'Staff ready time is 09:22 AM (7 min past scheduled 09:15 AM). Contact Anaesthesia Lead to confirm backup attending availability.',
    allReadyTime: '09:22 AM',
    baselineIdleMinutes: 25
  },
  {
    id: 'SES-103',
    facility: 'St. Jude Memorial Hospital',
    theatre: 'OR-03',
    procedure: 'Coronary Artery Bypass (CABG)',
    patientId: 'PAT-3142',
    patientName: 'Fictional Patient C',
    scheduledStart: '10:10 AM',
    patient: {
      status: 'READY',
      expectedReadyTime: '09:55 AM',
      actualReadyTime: '09:50 AM',
      owner: 'Cardiothoracic ICU Transport'
    },
    staff: {
      status: 'READY',
      expectedReadyTime: '10:00 AM',
      actualReadyTime: '09:58 AM',
      owner: 'Cardiac Surgical Team B'
    },
    equipment: {
      status: 'DELAYED',
      expectedReadyTime: '10:28 AM',
      delayReason: 'Smart infusion pump unavailable; awaiting rapid calibration cycle',
      owner: 'Equipment Coordinator'
    },
    sterileSupplies: {
      status: 'READY',
      expectedReadyTime: '09:40 AM',
      actualReadyTime: '09:35 AM',
      owner: 'Central Sterile Processing'
    },
    overallStatus: 'DELAYED',
    readinessScore: 46,
    predictedIdleMinutes: 18,
    mainBlocker: 'Equipment',
    aiRecommendation: 'Infusion pump calibration bottleneck causes 18 min idle time. Dispatch backup unit from Pavilion 4 Biomedical Depot immediately.',
    allReadyTime: '10:28 AM',
    baselineIdleMinutes: 45
  },
  {
    id: 'SES-104',
    facility: 'Metro Health General',
    theatre: 'OR-04',
    procedure: 'Craniotomy for Subdural Hematoma',
    patientId: 'PAT-4501',
    patientName: 'Fictional Patient D',
    scheduledStart: '11:30 AM',
    patient: {
      status: 'DELAYED',
      expectedReadyTime: '12:05 PM',
      delayReason: 'Inter-facility ambulance transfer delayed by highway traffic disruption',
      owner: 'Inter-Facility Transport Control'
    },
    staff: {
      status: 'READY',
      expectedReadyTime: '11:15 AM',
      actualReadyTime: '11:10 AM',
      owner: 'Neurosurgery Specialist Team'
    },
    equipment: {
      status: 'READY',
      expectedReadyTime: '11:00 AM',
      actualReadyTime: '10:55 AM',
      owner: 'Biomedical Equipment Services'
    },
    sterileSupplies: {
      status: 'READY',
      expectedReadyTime: '11:10 AM',
      actualReadyTime: '11:05 AM',
      owner: 'Central Sterile Processing'
    },
    overallStatus: 'ESCALATED',
    readinessScore: 32,
    predictedIdleMinutes: 35,
    mainBlocker: 'Patient',
    aiRecommendation: 'Critical patient transport delay of 35 mins. Escalate to Nursing Supervisor to prepare Holding Bay 2 and adjust scrub sequence.',
    allReadyTime: '12:05 PM',
    baselineIdleMinutes: 60
  },
  {
    id: 'SES-105',
    facility: 'Metro Health General',
    theatre: 'OR-05',
    procedure: 'Lumbar Spinal Fusion L4-L5',
    patientId: 'PAT-5820',
    patientName: 'Fictional Patient E',
    scheduledStart: '01:15 PM',
    patient: {
      status: 'READY',
      expectedReadyTime: '01:00 PM',
      actualReadyTime: '12:55 PM',
      owner: 'Orthopaedic Pre-Op Bay'
    },
    staff: {
      status: 'READY',
      expectedReadyTime: '01:05 PM',
      actualReadyTime: '01:00 PM',
      owner: 'Spine Surgical Unit'
    },
    equipment: {
      status: 'READY',
      expectedReadyTime: '01:00 PM',
      actualReadyTime: '12:50 PM',
      owner: 'Biomedical Equipment Services'
    },
    sterileSupplies: {
      status: 'DELAYED',
      expectedReadyTime: '01:38 PM',
      delayReason: 'Specialized spinal implant sterilization cycle incomplete in Autoclave 3',
      owner: 'Sterile Processing Supervisor'
    },
    overallStatus: 'DELAYED',
    readinessScore: 41,
    predictedIdleMinutes: 23,
    mainBlocker: 'Sterile Supplies',
    aiRecommendation: 'Autoclave sterilization hold causes 23 min theatre delay. Verify biologic indicator status with Sterile Processing Lead.',
    allReadyTime: '01:38 PM',
    baselineIdleMinutes: 50
  },
  {
    id: 'SES-106',
    facility: 'Mercy Surgical Center',
    theatre: 'OR-06',
    procedure: 'Anterior Cruciate Ligament (ACL) Repair',
    patientId: 'PAT-6711',
    patientName: 'Fictional Patient F',
    scheduledStart: '02:30 PM',
    patient: {
      status: 'READY',
      expectedReadyTime: '02:15 PM',
      actualReadyTime: '02:10 PM',
      owner: 'Outpatient Surgery Bay'
    },
    staff: {
      status: 'READY',
      expectedReadyTime: '02:20 PM',
      actualReadyTime: '02:15 PM',
      owner: 'Sports Med Surgical Team'
    },
    equipment: {
      status: 'READY',
      expectedReadyTime: '02:10 PM',
      actualReadyTime: '02:05 PM',
      owner: 'Biomedical Equipment Services'
    },
    sterileSupplies: {
      status: 'READY',
      expectedReadyTime: '02:15 PM',
      actualReadyTime: '02:10 PM',
      owner: 'Central Sterile Processing'
    },
    overallStatus: 'READY',
    readinessScore: 96,
    predictedIdleMinutes: 0,
    mainBlocker: 'None',
    aiRecommendation: 'All readiness checks passed. Room turnover verified for prompt 02:30 PM start.',
    allReadyTime: '02:15 PM',
    baselineIdleMinutes: 10
  },
  {
    id: 'SES-107',
    facility: 'Mercy Surgical Center',
    theatre: 'OR-07',
    procedure: 'Emergency Appendectomy',
    patientId: 'PAT-7933',
    patientName: 'Fictional Patient G',
    scheduledStart: '03:45 PM',
    patient: {
      status: 'AT_RISK',
      expectedReadyTime: '03:52 PM',
      delayReason: 'Pre-op lab workup (stat blood gas) pending final release',
      owner: 'Emergency Pre-Op Unit'
    },
    staff: {
      status: 'READY',
      expectedReadyTime: '03:35 PM',
      actualReadyTime: '03:30 PM',
      owner: 'On-Call General Surgical Team'
    },
    equipment: {
      status: 'READY',
      expectedReadyTime: '03:30 PM',
      actualReadyTime: '03:25 PM',
      owner: 'Biomedical Equipment Services'
    },
    sterileSupplies: {
      status: 'READY',
      expectedReadyTime: '03:35 PM',
      actualReadyTime: '03:30 PM',
      owner: 'Central Sterile Processing'
    },
    overallStatus: 'AT_RISK',
    readinessScore: 81,
    predictedIdleMinutes: 7,
    mainBlocker: 'Patient',
    aiRecommendation: 'Stat lab workup pending. Contact Pathology Lab to expedite blood gas results prior to 03:45 PM.',
    allReadyTime: '03:52 PM',
    baselineIdleMinutes: 20
  }
];

export const INITIAL_ALERTS: OperationalAlert[] = [
  {
    id: 'ALT-301',
    sessionId: 'SES-103',
    theatre: 'OR-03',
    facility: 'St. Jude Memorial Hospital',
    issue: 'Equipment delay: Smart infusion pump unavailable / undergoing calibration cycle',
    priority: 'URGENT',
    owner: 'Equipment Coordinator',
    dueTime: '10:28 AM',
    status: 'OPEN',
    createdTime: '09:42 AM',
    followUpNotes: [
      {
        id: 'N-1',
        timestamp: '09:45 AM',
        text: 'Automated alert generated by OR ReadySync Engine. 18 min idle time predicted.',
        author: 'OR ReadySync Engine'
      }
    ]
  },
  {
    id: 'ALT-302',
    sessionId: 'SES-104',
    theatre: 'OR-04',
    facility: 'Metro Health General',
    issue: 'Patient transfer delay: Inter-facility transport delayed by highway traffic disruption',
    priority: 'ESCALATED',
    owner: 'Inter-Facility Transport Control',
    dueTime: '12:05 PM',
    status: 'OPEN',
    createdTime: '10:50 AM',
    followUpNotes: [
      {
        id: 'N-2',
        timestamp: '10:52 AM',
        text: 'Patient ETA updated to 12:05 PM. Escalated due to >30 min idle time threshold.',
        author: 'OR ReadySync Engine'
      }
    ]
  },
  {
    id: 'ALT-303',
    sessionId: 'SES-105',
    theatre: 'OR-05',
    facility: 'Metro Health General',
    issue: 'Sterile supply delay: Specialized spinal implant sterilization incomplete in Autoclave 3',
    priority: 'URGENT',
    owner: 'Sterile Processing Supervisor',
    dueTime: '01:38 PM',
    status: 'IN_PROGRESS',
    createdTime: '11:15 AM',
    followUpNotes: [
      {
        id: 'N-3',
        timestamp: '11:20 AM',
        text: 'Sterile supervisor informed. Biologic indicator run accelerated.',
        author: 'Operating Room Coordinator'
      }
    ]
  },
  {
    id: 'ALT-304',
    sessionId: 'SES-102',
    theatre: 'OR-02',
    facility: 'St. Jude Memorial Hospital',
    issue: 'Staff readiness delay: Attending Anaesthesiologist completing emergent intubation',
    priority: 'WARNING',
    owner: 'Anaesthesia Operations Lead',
    dueTime: '09:22 AM',
    status: 'OPEN',
    createdTime: '08:50 AM',
    followUpNotes: []
  }
];

export const FAILURE_SCENARIOS: FailureScenario[] = [
  {
    id: 'SCENARIO-1',
    title: 'Scenario 1 — Equipment Unavailable',
    subtitle: 'Infusion Pump Calibration Hold',
    description: 'Simulates a critical biomedical equipment bottleneck in OR-03 where the required smart infusion pump fails pre-check and must undergo recalibration.',
    affectedSessionId: 'SES-103',
    expectedOutcome: [
      'Equipment status changes to DELAYED.',
      'Predicted idle time updates to 28 minutes.',
      'Session status transitions from AT_RISK to DELAYED / ESCALATED.',
      'AI Engine flags "Equipment" as Main Blocker.',
      'Urgent alert is dispatched and assigned to Equipment Coordinator.'
    ]
  },
  {
    id: 'SCENARIO-2',
    title: 'Scenario 2 — Staff Not Ready',
    subtitle: 'Anaesthesia Team Emergent Delay',
    description: 'Simulates a delay in OR-02 where the lead Anaesthesiologist is held up in an emergency procedure in the Trauma Bay.',
    affectedSessionId: 'SES-102',
    expectedOutcome: [
      'Staff status changes to DELAYED (ETA pushed by 32 minutes).',
      'AI recalculates All Resources Ready Time.',
      'Predicted idle minutes jump to 25 minutes.',
      'AI Engine identifies "Staff" as Main Blocker.',
      'Alert created and assigned to Anaesthesia Operations Lead.'
    ]
  },
  {
    id: 'SCENARIO-3',
    title: 'Scenario 3 — Patient Transfer Delay',
    subtitle: 'Inter-Facility Transport Gridlock',
    description: 'Simulates an inter-facility ambulance delay for OR-04 (Craniotomy patient PAT-4501 arriving from regional satellite campus).',
    affectedSessionId: 'SES-104',
    expectedOutcome: [
      'Patient readiness status switches to DELAYED.',
      'Expected arrival pushed from 11:30 AM to 12:15 PM (45 min delay).',
      'Overall session status changes to ESCALATED.',
      'AI Engine identifies "Patient" as Main Blocker.',
      'Escalation alert triggered for Inter-Facility Transport Control.'
    ]
  },
  {
    id: 'SCENARIO-4',
    title: 'Scenario 4 — Sterile Supplies Delay',
    subtitle: 'Surgical Tray Sterilization Cycle Hold',
    description: 'Simulates an unverified biological indicator on the primary orthopaedic surgical kit tray required for OR-05 (Spinal Fusion).',
    affectedSessionId: 'SES-105',
    expectedOutcome: [
      'Sterile Supplies status set to DELAYED.',
      'Expected tray release pushed back by 40 minutes.',
      'Predicted idle time updated to 38 minutes.',
      'AI identifies "Sterile Supplies" as Main Blocker.',
      'Urgent notification sent to Sterile Processing Supervisor.'
    ]
  }
];

export const ERROR_ANALYSIS_CASES = [
  {
    id: 'EA-1',
    caseTitle: 'Correctly Identified Equipment Blocker',
    sessionRef: 'OR-03 (SES-103)',
    category: 'Success',
    description: 'The smart infusion pump was undergoing recalibration. The readiness engine evaluated all 4 ready times, correctly singled out Equipment as the sole constraint delaying start by 18 minutes, and generated a targeted equipment swap prompt.',
    humanInterventionRequired: false
  },
  {
    id: 'EA-2',
    caseTitle: 'Correctly Detected Delayed Staff Readiness',
    sessionRef: 'OR-02 (SES-102)',
    category: 'Success',
    description: 'The attending anaesthesiologist was completing an emergency intubation. The system automatically adjusted predicted ready time and flagged an urgent staff gap before the patient entered theatre.',
    humanInterventionRequired: false
  },
  {
    id: 'EA-3',
    caseTitle: 'Correctly Detected Patient Transfer Delay',
    sessionRef: 'OR-04 (SES-104)',
    category: 'Success',
    description: 'Inter-facility transit traffic pushed patient arrival past scheduled start. System recalculated all resource dependencies and alerted transport control 40 minutes prior to room idle occurrence.',
    humanInterventionRequired: false
  },
  {
    id: 'EA-4',
    caseTitle: 'Ambiguous Case Requiring Human Review',
    sessionRef: 'OR-07 (SES-107)',
    category: 'Review Required',
    description: 'Stat lab workup delayed patient arrival by 7 minutes, but staff turnover was simultaneously 5 minutes behind schedule. The system identified dual overlapping delays and prioritized human clinical triage over automated room reassignment.',
    humanInterventionRequired: true
  }
];
