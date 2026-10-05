import { describe, it, expect } from 'vitest';
import { parseTimeToMinutes, formatMinutesToTime, analyzeSessionReadiness } from '../services/aiEngine';
import type { TheatreSession } from '../types';

describe('aiEngine — Time Parsing & Formatting Utilities', () => {
  it('correctly parses morning and afternoon time strings into minutes', () => {
    expect(parseTimeToMinutes('08:00 AM')).toBe(480);
    expect(parseTimeToMinutes('10:10 AM')).toBe(610);
    expect(parseTimeToMinutes('12:00 PM')).toBe(720);
    expect(parseTimeToMinutes('01:30 PM')).toBe(810);
    expect(parseTimeToMinutes('12:00 AM')).toBe(0);
  });

  it('gracefully handles missing, empty, or malformed time input', () => {
    expect(parseTimeToMinutes('')).toBe(0);
    expect(parseTimeToMinutes('INVALID_TIME')).toBe(0);
    // @ts-expect-error testing invalid runtime type
    expect(parseTimeToMinutes(null)).toBe(0);
  });

  it('correctly formats minutes from midnight into 12-hour display time', () => {
    expect(formatMinutesToTime(480)).toBe('08:00 AM');
    expect(formatMinutesToTime(610)).toBe('10:10 AM');
    expect(formatMinutesToTime(720)).toBe('12:00 PM');
    expect(formatMinutesToTime(810)).toBe('01:30 PM');
    expect(formatMinutesToTime(0)).toBe('12:00 AM');
  });
});

describe('aiEngine — Readiness Analysis & Blocker Identification', () => {
  const baseSession: TheatreSession = {
    id: 'SES-TEST-01',
    facility: 'St. Jude Memorial Hospital',
    theatre: 'OR-01',
    procedure: 'Total Knee Arthroplasty',
    patientId: 'PAT-101',
    patientName: 'John Doe',
    scheduledStart: '10:00 AM',
    patient: { status: 'READY', expectedReadyTime: '09:50 AM', owner: 'Pre-Op Bay' },
    staff: { status: 'READY', expectedReadyTime: '09:55 AM', owner: 'Surgical Team Alpha' },
    equipment: { status: 'READY', expectedReadyTime: '09:45 AM', owner: 'Biomedical Services' },
    sterileSupplies: { status: 'READY', expectedReadyTime: '09:40 AM', owner: 'Sterile Processing' },
    overallStatus: 'READY',
    readinessScore: 100,
    predictedIdleMinutes: 0,
    mainBlocker: 'None',
    aiRecommendation: '',
    allReadyTime: '09:55 AM',
    baselineIdleMinutes: 30
  };

  it('evaluates fully synchronized session as READY with 0 idle minutes and None blocker', () => {
    const res = analyzeSessionReadiness(baseSession);
    expect(res.overallStatus).toBe('READY');
    expect(res.predictedIdleMinutes).toBe(0);
    expect(res.mainBlocker).toBe('None');
    expect(res.readinessScore).toBe(100);
    expect(res.escalationLevel).toBe('NORMAL');
  });

  it('detects single Equipment blocker when equipment ready time is 10:30 AM for 10:00 AM start', () => {
    const session: TheatreSession = {
      ...baseSession,
      equipment: {
        status: 'DELAYED',
        expectedReadyTime: '10:30 AM',
        delayReason: 'Smart infusion pump calibration hold',
        owner: 'Equipment Coordinator'
      }
    };
    const res = analyzeSessionReadiness(session);
    expect(res.overallStatus).toBe('ESCALATED');
    expect(res.predictedIdleMinutes).toBe(30);
    expect(res.mainBlocker).toBe('Equipment');
    expect(res.allResourcesReadyTime).toBe('10:30 AM');
    expect(res.escalationLevel).toBe('ESCALATED');
  });

  it('detects single Patient blocker when patient arrival is delayed to 10:20 AM', () => {
    const session: TheatreSession = {
      ...baseSession,
      patient: {
        status: 'DELAYED',
        expectedReadyTime: '10:20 AM',
        delayReason: 'Ambulance transfer traffic delay',
        owner: 'Transport Control'
      }
    };
    const res = analyzeSessionReadiness(session);
    expect(res.overallStatus).toBe('DELAYED');
    expect(res.predictedIdleMinutes).toBe(20);
    expect(res.mainBlocker).toBe('Patient');
    expect(res.allResourcesReadyTime).toBe('10:20 AM');
  });

  it('detects Staff delay as primary blocker', () => {
    const session: TheatreSession = {
      ...baseSession,
      staff: {
        status: 'DELAYED',
        expectedReadyTime: '10:25 AM',
        delayReason: 'Anaesthesiologist held in Trauma Bay emergency',
        owner: 'Anaesthesia Lead'
      }
    };
    const res = analyzeSessionReadiness(session);
    expect(res.mainBlocker).toBe('Staff');
    expect(res.predictedIdleMinutes).toBe(25);
  });

  it('detects Sterile Supplies delay as primary blocker', () => {
    const session: TheatreSession = {
      ...baseSession,
      sterileSupplies: {
        status: 'DELAYED',
        expectedReadyTime: '10:15 AM',
        delayReason: 'Autoclave biological indicator hold',
        owner: 'Sterile Supervisor'
      }
    };
    const res = analyzeSessionReadiness(session);
    expect(res.mainBlocker).toBe('Sterile Supplies');
    expect(res.predictedIdleMinutes).toBe(15);
  });

  it('resolves multiple simultaneous blockers to the resource requiring the longest ready time', () => {
    const session: TheatreSession = {
      ...baseSession,
      patient: { status: 'DELAYED', expectedReadyTime: '10:15 AM', owner: 'Transport' },
      equipment: { status: 'DELAYED', expectedReadyTime: '10:45 AM', owner: 'Biomed' }
    };
    const res = analyzeSessionReadiness(session);
    expect(res.mainBlocker).toBe('Equipment'); // 10:45 > 10:15
    expect(res.predictedIdleMinutes).toBe(45);
    expect(res.allResourcesReadyTime).toBe('10:45 AM');
  });

  it('flags ambiguous/unknown resource status and requires clinical review', () => {
    const session: TheatreSession = {
      ...baseSession,
      equipment: { status: 'UNKNOWN', expectedReadyTime: '10:00 AM', owner: 'Biomed' }
    };
    const res = analyzeSessionReadiness(session);
    expect(res.overallStatus).toBe('AT_RISK');
    expect(res.escalationLevel).toBe('URGENT');
    expect(res.aiRecommendation).toContain('AMBIGUOUS DATA WARNING');
  });
});
