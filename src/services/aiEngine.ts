import type { TheatreSession, ReadinessAnalysisResult, MainBlockerType, SessionStatus, AlertPriority } from '../types';

/**
 * Parses a standard 12-hour time string (e.g. "10:10 AM" or "02:30 PM") into minutes from midnight.
 * Robustly handles missing, empty, or malformed time strings by returning 0 minutes.
 * 
 * @param timeStr Standard formatted time string (e.g. "09:45 AM")
 * @returns Total minutes from 00:00 (0 to 1439)
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Formats total minutes from midnight into a standard 12-hour display string (e.g. 630 -> "10:30 AM").
 * 
 * @param totalMinutes Total minutes from midnight
 * @returns Formatted time string (e.g. "10:30 AM")
 */
export function formatMinutesToTime(totalMinutes: number): string {
  if (isNaN(totalMinutes) || totalMinutes < 0) return '12:00 AM';
  let hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
  const hoursStr = hours < 10 ? `0${hours}` : `${hours}`;

  return `${hoursStr}:${minsStr} ${period}`;
}

/**
 * Core Operational Readiness Analysis Engine.
 * Synchronizes readiness across 4 domains (Patient, Staff, Equipment, Sterile Supplies).
 * 
 * Logic Rules:
 * 1. OR READY = Patient Ready AND Staff Ready AND Equipment Ready AND Sterile Supplies Ready.
 * 2. All Resources Ready Time = MAX(Patient Ready, Staff Ready, Equipment Ready, Sterile Supplies Ready).
 * 3. Avoidable Idle Minutes = MAX(0, All Resources Ready Time - Scheduled Theatre Start Time).
 * 4. Primary Blocker = Resource requiring the longest time to become ready or flagged DELAYED/AT_RISK.
 * 5. Ambiguous Data Rule = Unknown, missing, or conflicting resource data must NEVER be silently treated as READY.
 *    Flagged as AMBIGUOUS / AT_RISK requiring human clinical triage.
 * 
 * @param session Theatre session operational entity
 * @returns Deterministic analysis result including blocker, idle time, score, and recommendations.
 */
export function analyzeSessionReadiness(session: TheatreSession): ReadinessAnalysisResult {
  if (!session) {
    return {
      allResourcesReadyTime: '12:00 AM',
      predictedIdleMinutes: 0,
      readinessScore: 0,
      overallStatus: 'AT_RISK',
      mainBlocker: 'None',
      aiRecommendation: 'INVALID SESSION: Session entity is null or undefined.',
      escalationLevel: 'URGENT'
    };
  }

  const scheduledMinutes = parseTimeToMinutes(session.scheduledStart);

  // Safely extract resource ready times with fallbacks
  const patientMins = parseTimeToMinutes(session.patient?.expectedReadyTime || '');
  const staffMins = parseTimeToMinutes(session.staff?.expectedReadyTime || '');
  const equipmentMins = parseTimeToMinutes(session.equipment?.expectedReadyTime || '');
  const sterileMins = parseTimeToMinutes(session.sterileSupplies?.expectedReadyTime || '');

  // Detect unknown, missing, or ambiguous readiness statuses
  const unknownDomains: string[] = [];
  if (!session.patient || session.patient.status === 'UNKNOWN' || !session.patient.status) unknownDomains.push('Patient');
  if (!session.staff || session.staff.status === 'UNKNOWN' || !session.staff.status) unknownDomains.push('Staff');
  if (!session.equipment || session.equipment.status === 'UNKNOWN' || !session.equipment.status) unknownDomains.push('Equipment');
  if (!session.sterileSupplies || session.sterileSupplies.status === 'UNKNOWN' || !session.sterileSupplies.status) unknownDomains.push('Sterile Supplies');

  const hasAmbiguousData = unknownDomains.length > 0;

  const maxReadyMinutes = Math.max(patientMins, staffMins, equipmentMins, sterileMins);
  const allResourcesReadyTime = formatMinutesToTime(maxReadyMinutes);

  const predictedIdleMinutes = Math.max(0, maxReadyMinutes - scheduledMinutes);

  let mainBlocker: MainBlockerType = 'None';
  let maxTimeForBlocker = scheduledMinutes;

  const checkResource = (type: MainBlockerType, mins: number, status?: string) => {
    if (status === 'DELAYED' || status === 'AT_RISK' || status === 'UNKNOWN' || status === 'NOT_READY' || mins > maxTimeForBlocker) {
      if (mins > maxTimeForBlocker || mainBlocker === 'None' || status === 'DELAYED' || status === 'UNKNOWN') {
        mainBlocker = type;
        maxTimeForBlocker = mins;
      }
    }
  };

  checkResource('Patient', patientMins, session.patient?.status);
  checkResource('Staff', staffMins, session.staff?.status);
  checkResource('Equipment', equipmentMins, session.equipment?.status);
  checkResource('Sterile Supplies', sterileMins, session.sterileSupplies?.status);

  // Strictly enforce: OR READY = ALL 4 READY & ZERO IDLE
  if (
    session.patient?.status === 'READY' &&
    session.staff?.status === 'READY' &&
    session.equipment?.status === 'READY' &&
    session.sterileSupplies?.status === 'READY' &&
    predictedIdleMinutes === 0 &&
    !hasAmbiguousData
  ) {
    mainBlocker = 'None';
  }

  // Calculate Readiness Score (0 to 100)
  let score = 100;
  score -= predictedIdleMinutes * 2;

  const deductStatus = (status?: string) => {
    if (status === 'DELAYED') score -= 18;
    if (status === 'AT_RISK') score -= 8;
    if (status === 'NOT_READY') score -= 15;
    if (status === 'UNKNOWN') score -= 20;
  };

  deductStatus(session.patient?.status);
  deductStatus(session.staff?.status);
  deductStatus(session.equipment?.status);
  deductStatus(session.sterileSupplies?.status);

  const readinessScore = Math.max(0, Math.min(100, Math.round(score)));

  let overallStatus: SessionStatus = 'READY';
  let escalationLevel: AlertPriority = 'NORMAL';

  if (hasAmbiguousData) {
    overallStatus = 'AT_RISK';
    escalationLevel = 'URGENT';
  } else if (predictedIdleMinutes === 0 && mainBlocker === 'None') {
    overallStatus = 'READY';
    escalationLevel = 'NORMAL';
  } else if (predictedIdleMinutes > 0 && predictedIdleMinutes <= 14) {
    overallStatus = 'AT_RISK';
    escalationLevel = 'WARNING';
  } else if (predictedIdleMinutes >= 15 && predictedIdleMinutes <= 29) {
    overallStatus = 'DELAYED';
    escalationLevel = 'URGENT';
  } else {
    overallStatus = 'ESCALATED';
    escalationLevel = 'ESCALATED';
  }

  if (
    session.patient?.status === 'DELAYED' ||
    session.staff?.status === 'DELAYED' ||
    session.equipment?.status === 'DELAYED' ||
    session.sterileSupplies?.status === 'DELAYED'
  ) {
    if (predictedIdleMinutes >= 30) {
      overallStatus = 'ESCALATED';
      escalationLevel = 'ESCALATED';
    } else {
      overallStatus = 'DELAYED';
      if (escalationLevel === 'NORMAL' || escalationLevel === 'WARNING') {
        escalationLevel = 'URGENT';
      }
    }
  }

  let aiRecommendation = '';
  if (hasAmbiguousData) {
    aiRecommendation = `AMBIGUOUS DATA WARNING: Incomplete or unknown readiness status detected for domain(s): ${unknownDomains.join(', ')}. Manual clinical review and triage required immediately before theatre start.`;
  } else if (overallStatus === 'READY') {
    aiRecommendation = `All 4 readiness domains synchronized. Proceed with standard pre-op checklist for scheduled ${session.scheduledStart} start.`;
  } else {
    let blockerDetails = null;
    const blockerStr: string = mainBlocker;

    if (blockerStr === 'Patient') blockerDetails = session.patient;
    else if (blockerStr === 'Staff') blockerDetails = session.staff;
    else if (blockerStr === 'Equipment') blockerDetails = session.equipment;
    else if (blockerStr === 'Sterile Supplies') blockerDetails = session.sterileSupplies;

    const ownerName = blockerDetails ? blockerDetails.owner : 'Department Supervisor';
    const delayReason = blockerDetails?.delayReason || `${mainBlocker} readiness pending`;

    if (predictedIdleMinutes > 30) {
      aiRecommendation = `CRITICAL DELAY DETECTED: Main Blocker is ${mainBlocker} (${delayReason}). Expected ready time is ${allResourcesReadyTime} (${predictedIdleMinutes} min idle). Immediately contact ${ownerName} and activate emergency room reassignment protocol.`;
    } else if (predictedIdleMinutes >= 15) {
      aiRecommendation = `URGENT ACTION REQUIRED: ${mainBlocker} is bottlenecking OR readiness (${delayReason}). Predicted idle duration: ${predictedIdleMinutes} minutes. Contact ${ownerName} to expedite readiness before ${allResourcesReadyTime}.`;
    } else {
      aiRecommendation = `MODERATE RISK: ${mainBlocker} ready time (${allResourcesReadyTime}) exceeds scheduled start by ${predictedIdleMinutes} minutes. Alert ${ownerName} to monitor progress and minimize turnover delay.`;
    }
  }

  return {
    allResourcesReadyTime,
    predictedIdleMinutes,
    readinessScore,
    overallStatus,
    mainBlocker,
    aiRecommendation,
    escalationLevel
  };
}
