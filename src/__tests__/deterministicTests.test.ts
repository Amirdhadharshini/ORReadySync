import { describe, it, expect } from 'vitest';
import { DETERMINISTIC_TEST_CASES } from '../data/mockData';
import { analyzeSessionReadiness, parseTimeToMinutes } from '../services/aiEngine';
import type { TheatreSession, ResourceStatus } from '../types';

describe('Deterministic Failure Test Suite (TEST-001 to TEST-005)', () => {
  DETERMINISTIC_TEST_CASES.forEach(testCase => {
    it(`executes ${testCase.id} — ${testCase.name} and satisfies all expected assertions`, () => {
      const getResourceStatus = (readyTime: string, schedTime: string): ResourceStatus => {
        const readyMins = parseTimeToMinutes(readyTime);
        const schedMins = parseTimeToMinutes(schedTime);
        return readyMins <= schedMins ? 'READY' : 'DELAYED';
      };

      const syntheticSession: TheatreSession = {
        id: testCase.affectedSessionId,
        facility: 'St. Jude Memorial Hospital',
        theatre: 'OR-TEST',
        procedure: 'Validation Procedure',
        patientId: 'PAT-TEST',
        patientName: 'Synthetic Test Patient',
        scheduledStart: testCase.scheduledStartTime,
        patient: {
          status: getResourceStatus(testCase.initialResourceState.patientReady, testCase.scheduledStartTime),
          expectedReadyTime: testCase.initialResourceState.patientReady,
          owner: 'Patient Transport'
        },
        staff: {
          status: getResourceStatus(testCase.initialResourceState.staffReady, testCase.scheduledStartTime),
          expectedReadyTime: testCase.initialResourceState.staffReady,
          owner: 'Surgical Team'
        },
        equipment: {
          status: getResourceStatus(testCase.initialResourceState.equipmentReady, testCase.scheduledStartTime),
          expectedReadyTime: testCase.initialResourceState.equipmentReady,
          owner: 'Biomedical Services'
        },
        sterileSupplies: {
          status: getResourceStatus(testCase.initialResourceState.sterileSuppliesReady, testCase.scheduledStartTime),
          expectedReadyTime: testCase.initialResourceState.sterileSuppliesReady,
          owner: 'Sterile Processing'
        },
        overallStatus: 'AT_RISK',
        readinessScore: 50,
        predictedIdleMinutes: 0,
        mainBlocker: 'None',
        aiRecommendation: '',
        allReadyTime: '',
        baselineIdleMinutes: 30
      };

      const result = analyzeSessionReadiness(syntheticSession);

      expect(result.mainBlocker).toBe(testCase.expected.primaryBlocker);
      expect(result.overallStatus).toBe(testCase.expected.sessionStatus);
      expect(result.allResourcesReadyTime).toBe(testCase.expected.allResourcesReadyTime);
      expect(result.predictedIdleMinutes).toBe(testCase.expected.avoidableIdleMinutes);
    });
  });
});
