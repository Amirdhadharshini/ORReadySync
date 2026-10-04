import type { OperationalAlert, AlertPriority, EscalationHistory } from '../types';

const PRIORITY_RANKS: Record<AlertPriority, number> = {
  NORMAL: 0,
  WARNING: 1,
  URGENT: 2,
  ESCALATED: 3
};

/**
 * Calculates time-decay SLA escalation for an alert based on elapsed minutes from creation.
 * Rules:
 *  0 - 14 min: NORMAL
 * 15 - 29 min: WARNING (SLA Warning after 15m)
 * 30 - 44 min: URGENT (SLA Urgent after 30m)
 * 45+ min: ESCALATED (SLA Exceeded after 45m)
 */
export function evaluateAlertSLA(alert: OperationalAlert, nowMs: number = Date.now()): OperationalAlert {
  if (alert.status === 'RESOLVED') {
    return alert;
  }

  const createdMs = alert.createdAt ? new Date(alert.createdAt).getTime() : Date.now();
  const validCreatedMs = isNaN(createdMs) ? Date.now() : createdMs;
  const elapsedMinutes = Math.max(0, Math.floor((nowMs - validCreatedMs) / 60000));

  let targetPriority: AlertPriority = 'NORMAL';
  let reason = 'Initial alert creation';

  if (elapsedMinutes >= 45) {
    targetPriority = 'ESCALATED';
    reason = 'Escalation SLA exceeded (45m+ unresolved)';
  } else if (elapsedMinutes >= 30) {
    targetPriority = 'URGENT';
    reason = 'Urgent SLA exceeded (30m+ unresolved)';
  } else if (elapsedMinutes >= 15) {
    targetPriority = 'WARNING';
    reason = 'Warning SLA exceeded (15m+ unresolved)';
  }

  if (PRIORITY_RANKS[targetPriority] > PRIORITY_RANKS[alert.priority]) {
    const historyEntry: EscalationHistory = {
      id: `ESC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      previousPriority: alert.priority,
      newPriority: targetPriority,
      reason,
      triggeredBy: 'SLA Time-Decay Engine'
    };

    return {
      ...alert,
      priority: targetPriority,
      escalationLevel: targetPriority,
      escalatedAt: new Date().toISOString(),
      escalationHistory: [...(alert.escalationHistory || []), historyEntry]
    };
  }

  return alert;
}

export interface SLAInfo {
  elapsedMinutes: number;
  slaStatus: 'ON_TRACK' | 'WARNING' | 'BREACHED' | 'ESCALATED' | 'RESOLVED';
  nextPriority: AlertPriority | null;
  minutesRemaining: number;
  message: string;
}

export function getSLAInfo(alert: OperationalAlert, nowMs: number = Date.now()): SLAInfo {
  if (alert.status === 'RESOLVED') {
    return {
      elapsedMinutes: 0,
      slaStatus: 'RESOLVED',
      nextPriority: null,
      minutesRemaining: 0,
      message: 'Alert resolved. SLA tracking stopped.'
    };
  }

  const createdMs = alert.createdAt ? new Date(alert.createdAt).getTime() : Date.now();
  const validCreatedMs = isNaN(createdMs) ? Date.now() : createdMs;
  const elapsedMinutes = Math.max(0, Math.floor((nowMs - validCreatedMs) / 60000));

  if (alert.priority === 'ESCALATED' || elapsedMinutes >= 45) {
    return {
      elapsedMinutes,
      slaStatus: 'ESCALATED',
      nextPriority: null,
      minutesRemaining: 0,
      message: 'SLA Exceeded. Multiple escalation stages triggered.'
    };
  }

  if (elapsedMinutes >= 30) {
    const remaining = 45 - elapsedMinutes;
    return {
      elapsedMinutes,
      slaStatus: 'BREACHED',
      nextPriority: 'ESCALATED',
      minutesRemaining: remaining,
      message: `${remaining} min remaining before automatic escalation to ESCALATED`
    };
  }

  if (elapsedMinutes >= 15) {
    const remaining = 30 - elapsedMinutes;
    return {
      elapsedMinutes,
      slaStatus: 'WARNING',
      nextPriority: 'URGENT',
      minutesRemaining: remaining,
      message: `${remaining} min remaining before automatic escalation to URGENT`
    };
  }

  const remaining = 15 - elapsedMinutes;
  return {
    elapsedMinutes,
    slaStatus: 'ON_TRACK',
    nextPriority: 'WARNING',
    minutesRemaining: remaining,
    message: `${remaining} min remaining before automatic escalation to WARNING`
  };
}
