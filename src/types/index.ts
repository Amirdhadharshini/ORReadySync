export type ResourceStatus = 'READY' | 'AT_RISK' | 'DELAYED';
export type SessionStatus = 'READY' | 'AT_RISK' | 'DELAYED' | 'ESCALATED';
export type AlertPriority = 'NORMAL' | 'WARNING' | 'URGENT' | 'ESCALATED';
export type AlertStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type MainBlockerType = 'Patient' | 'Staff' | 'Equipment' | 'Sterile Supplies' | 'None';

export interface ResourceDetails {
  status: ResourceStatus;
  expectedReadyTime: string; // e.g. "10:10 AM"
  actualReadyTime?: string; // e.g. "10:28 AM"
  delayReason?: string;
  owner: string; // Responsible team/person
}

export interface TheatreSession {
  id: string; // e.g. "SES-101"
  facility: string; // e.g. "St. Jude Memorial Hospital"
  theatre: string; // e.g. "OR-01"
  procedure: string; // e.g. "Total Knee Arthroplasty"
  patientId: string; // e.g. "PAT-1024"
  patientName: string; // e.g. "Eleanor Vance"
  scheduledStart: string; // e.g. "10:10 AM"
  
  patient: ResourceDetails;
  staff: ResourceDetails;
  equipment: ResourceDetails;
  sterileSupplies: ResourceDetails;
  
  overallStatus: SessionStatus;
  readinessScore: number; // 0-100
  predictedIdleMinutes: number;
  mainBlocker: MainBlockerType;
  aiRecommendation: string;
  allReadyTime: string; // Latest ready time calculated
  
  baselineIdleMinutes: number; // For baseline vs prototype metrics comparison
}

export interface AlertNote {
  id: string;
  timestamp: string;
  text: string;
  author: string;
}

export interface OperationalAlert {
  id: string; // e.g. "ALT-301"
  sessionId: string;
  theatre: string;
  facility: string;
  issue: string;
  priority: AlertPriority;
  owner: string;
  dueTime: string;
  status: AlertStatus;
  createdTime: string;
  followUpNotes: AlertNote[];
}

export interface FailureScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  affectedSessionId: string;
  expectedOutcome: string[];
}

export interface ReadinessAnalysisResult {
  allResourcesReadyTime: string;
  predictedIdleMinutes: number;
  readinessScore: number;
  overallStatus: SessionStatus;
  mainBlocker: MainBlockerType;
  aiRecommendation: string;
  escalationLevel: AlertPriority;
}

export interface AuthUser {
  email: string;
  name: string;
  role: string;
  initials: string;
}

export type ActivePage = 
  | 'dashboard'
  | 'schedule'
  | 'synchronizer'
  | 'alerts'
  | 'failure-center'
  | 'performance'
  | 'mock-data';
