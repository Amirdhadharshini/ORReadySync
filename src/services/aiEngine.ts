import type { TheatreSession, ReadinessAnalysisResult, MainBlockerType, SessionStatus, AlertPriority } from '../types';

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
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

export function formatMinutesToTime(totalMinutes: number): string {
  let hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
  const hoursStr = hours < 10 ? `0${hours}` : `${hours}`;

  return `${hoursStr}:${minsStr} ${period}`;
}

export function analyzeSessionReadiness(session: TheatreSession): ReadinessAnalysisResult {
  const scheduledMinutes = parseTimeToMinutes(session.scheduledStart);

  const patientMins = parseTimeToMinutes(session.patient.expectedReadyTime);
  const staffMins = parseTimeToMinutes(session.staff.expectedReadyTime);
  const equipmentMins = parseTimeToMinutes(session.equipment.expectedReadyTime);
  const sterileMins = parseTimeToMinutes(session.sterileSupplies.expectedReadyTime);

  const maxReadyMinutes = Math.max(patientMins, staffMins, equipmentMins, sterileMins);
  const allResourcesReadyTime = formatMinutesToTime(maxReadyMinutes);

  const predictedIdleMinutes = Math.max(0, maxReadyMinutes - scheduledMinutes);

  let mainBlocker: MainBlockerType = 'None';
  let maxTimeForBlocker = scheduledMinutes;

  const checkResource = (type: MainBlockerType, mins: number, status: string) => {
    if (status === 'DELAYED' || status === 'AT_RISK' || mins > maxTimeForBlocker) {
      if (mins > maxTimeForBlocker || mainBlocker === 'None' || status === 'DELAYED') {
        mainBlocker = type;
        maxTimeForBlocker = mins;
      }
    }
  };

  checkResource('Patient', patientMins, session.patient.status);
  checkResource('Staff', staffMins, session.staff.status);
  checkResource('Equipment', equipmentMins, session.equipment.status);
  checkResource('Sterile Supplies', sterileMins, session.sterileSupplies.status);

  if (
    session.patient.status === 'READY' &&
    session.staff.status === 'READY' &&
    session.equipment.status === 'READY' &&
    session.sterileSupplies.status === 'READY' &&
    predictedIdleMinutes === 0
  ) {
    mainBlocker = 'None';
  }

  let score = 100;
  score -= predictedIdleMinutes * 2;

  const deductStatus = (status: string) => {
    if (status === 'DELAYED') score -= 18;
    if (status === 'AT_RISK') score -= 8;
  };

  deductStatus(session.patient.status);
  deductStatus(session.staff.status);
  deductStatus(session.equipment.status);
  deductStatus(session.sterileSupplies.status);

  const readinessScore = Math.max(0, Math.min(100, Math.round(score)));

  let overallStatus: SessionStatus = 'READY';
  let escalationLevel: AlertPriority = 'NORMAL';

  if (predictedIdleMinutes === 0 && mainBlocker === 'None') {
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
    session.patient.status === 'DELAYED' ||
    session.staff.status === 'DELAYED' ||
    session.equipment.status === 'DELAYED' ||
    session.sterileSupplies.status === 'DELAYED'
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
  if (overallStatus === 'READY') {
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
