import { describe, it, expect } from 'vitest';
import { evaluateAlertSLA, getSLAInfo } from '../services/slaEngine';
import type { OperationalAlert } from '../types';

describe('slaEngine — Time-Decay Alert Escalation Rules', () => {
  const baseAlert: OperationalAlert = {
    id: 'ALT-TEST-101',
    sessionId: 'SES-103',
    theatre: 'OR-03',
    facility: 'St. Jude Memorial Hospital',
    issue: 'Equipment delay: Infusion pump calibration hold',
    priority: 'NORMAL',
    escalationLevel: 'NORMAL',
    owner: 'Equipment Coordinator',
    dueTime: '10:28 AM',
    status: 'OPEN',
    createdTime: '10:00 AM',
    createdAt: new Date('2026-10-05T10:00:00.000Z').toISOString(),
    escalationHistory: [],
    followUpNotes: []
  };

  const createTime = new Date('2026-10-05T10:00:00.000Z').getTime();

  it('keeps alert at NORMAL priority when elapsed time is 0-14 minutes', () => {
    const elevenMinsLater = createTime + 11 * 60 * 1000;
    const evaluated = evaluateAlertSLA(baseAlert, elevenMinsLater);
    expect(evaluated.priority).toBe('NORMAL');
    expect(evaluated.escalationHistory.length).toBe(0);

    const info = getSLAInfo(baseAlert, elevenMinsLater);
    expect(info.slaStatus).toBe('ON_TRACK');
    expect(info.nextPriority).toBe('WARNING');
    expect(info.minutesRemaining).toBe(4);
  });

  it('escalates alert from NORMAL to WARNING after 15 minutes unresolved', () => {
    const sixteenMinsLater = createTime + 16 * 60 * 1000;
    const evaluated = evaluateAlertSLA(baseAlert, sixteenMinsLater);
    expect(evaluated.priority).toBe('WARNING');
    expect(evaluated.escalationHistory.length).toBe(1);
    expect(evaluated.escalationHistory[0].newPriority).toBe('WARNING');
    expect(evaluated.escalationHistory[0].reason).toContain('Warning SLA exceeded');

    const info = getSLAInfo(evaluated, sixteenMinsLater);
    expect(info.slaStatus).toBe('WARNING');
    expect(info.nextPriority).toBe('URGENT');
  });

  it('escalates alert to URGENT after 30 minutes unresolved', () => {
    const thirtyTwoMinsLater = createTime + 32 * 60 * 1000;
    const evaluated = evaluateAlertSLA(baseAlert, thirtyTwoMinsLater);
    expect(evaluated.priority).toBe('URGENT');
    expect(evaluated.escalationHistory[0].newPriority).toBe('URGENT');

    const info = getSLAInfo(evaluated, thirtyTwoMinsLater);
    expect(info.slaStatus).toBe('BREACHED');
    expect(info.nextPriority).toBe('ESCALATED');
  });

  it('escalates alert to ESCALATED after 45 minutes unresolved', () => {
    const fiftyMinsLater = createTime + 50 * 60 * 1000;
    const evaluated = evaluateAlertSLA(baseAlert, fiftyMinsLater);
    expect(evaluated.priority).toBe('ESCALATED');
    expect(evaluated.escalationHistory[0].newPriority).toBe('ESCALATED');

    const info = getSLAInfo(evaluated, fiftyMinsLater);
    expect(info.slaStatus).toBe('ESCALATED');
    expect(info.nextPriority).toBeNull();
  });

  it('immediately stops SLA escalation for RESOLVED alerts', () => {
    const resolvedAlert: OperationalAlert = {
      ...baseAlert,
      status: 'RESOLVED',
      priority: 'WARNING'
    };

    const twoHoursLater = createTime + 120 * 60 * 1000;
    const evaluated = evaluateAlertSLA(resolvedAlert, twoHoursLater);
    expect(evaluated.priority).toBe('WARNING'); // Unchanged
    expect(evaluated.escalationHistory.length).toBe(0);

    const info = getSLAInfo(resolvedAlert, twoHoursLater);
    expect(info.slaStatus).toBe('RESOLVED');
    expect(info.message).toContain('tracking stopped');
  });
});
