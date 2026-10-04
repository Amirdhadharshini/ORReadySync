import React, { useState, useEffect } from 'react';
import type { 
  TheatreSession, 
  OperationalAlert, 
  ActivePage, 
  ReadinessAnalysisResult,
  ResourceDetails,
  AuthUser,
  TestExecutionResult,
  AlertPriority
} from '../types';
import { loadSessions, saveSessions, loadAlerts, saveAlerts, resetDemoState, loadAuthUser, saveAuthUser } from '../services/storageService';
import { analyzeSessionReadiness } from '../services/aiEngine';
import { evaluateAlertSLA } from '../services/slaEngine';
import { DEMO_USERS, DETERMINISTIC_TEST_CASES } from '../data/mockData';
import { AppContext } from './AppContextObject';

const TEST_RESULTS_KEY = 'or_readysync_test_results_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(loadAuthUser);
  const [sessions, setSessions] = useState<TheatreSession[]>(loadSessions);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(() => loadAlerts().map(alert => evaluateAlertSLA(alert)));
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('SES-103');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [testExecutionResults, setTestExecutionResults] = useState<Record<string, TestExecutionResult>>(() => {
    try {
      const raw = localStorage.getItem(TEST_RESULTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // fallback
    }
    return {};
  });

  useEffect(() => {
    saveAuthUser(user);
  }, [user]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem(TEST_RESULTS_KEY, JSON.stringify(testExecutionResults));
    } catch (e) {
      console.error('Failed to save test results', e);
    }
  }, [testExecutionResults]);

  const recheckSLA = () => {
    setAlerts(prev => prev.map(alert => evaluateAlertSLA(alert)));
  };

  const login = (email: string, pass: string): boolean => {
    const matched = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === pass
    );
    if (matched) {
      const authObj: AuthUser = {
        email: matched.email,
        name: matched.name,
        role: matched.role,
        initials: matched.initials
      };
      setUser(authObj);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    saveAuthUser(null);
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  const navigateToSynchronizerForSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActivePage('synchronizer');
  };

  const updateSessionResource = (
    sessionId: string, 
    resourceKey: 'patient' | 'staff' | 'equipment' | 'sterileSupplies', 
    updates: Partial<ResourceDetails>
  ) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const updatedResource = { ...s[resourceKey], ...updates };
        const updatedSession = { ...s, [resourceKey]: updatedResource };
        const analysis = analyzeSessionReadiness(updatedSession);
        return {
          ...updatedSession,
          allReadyTime: analysis.allResourcesReadyTime,
          predictedIdleMinutes: analysis.predictedIdleMinutes,
          readinessScore: analysis.readinessScore,
          overallStatus: analysis.overallStatus,
          mainBlocker: analysis.mainBlocker,
          aiRecommendation: analysis.aiRecommendation
        };
      }
      return s;
    }));
  };

  const runReadinessCheck = (sessionId: string): ReadinessAnalysisResult => {
    const target = sessions.find(s => s.id === sessionId);
    if (!target) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const analysis = analyzeSessionReadiness(target);

    const updatedSessions = sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          allReadyTime: analysis.allResourcesReadyTime,
          predictedIdleMinutes: analysis.predictedIdleMinutes,
          readinessScore: analysis.readinessScore,
          overallStatus: analysis.overallStatus,
          mainBlocker: analysis.mainBlocker,
          aiRecommendation: analysis.aiRecommendation
        };
      }
      return s;
    });

    setSessions(updatedSessions);

    if (analysis.escalationLevel === 'URGENT' || analysis.escalationLevel === 'ESCALATED' || analysis.overallStatus === 'DELAYED' || analysis.overallStatus === 'ESCALATED') {
      const existingAlert = alerts.find(a => a.sessionId === sessionId && a.status !== 'RESOLVED');

      const alertOwner = 
        analysis.mainBlocker === 'Patient' ? target.patient.owner :
        analysis.mainBlocker === 'Staff' ? target.staff.owner :
        analysis.mainBlocker === 'Equipment' ? target.equipment.owner :
        analysis.mainBlocker === 'Sterile Supplies' ? target.sterileSupplies.owner : 'OR Coordinator';

      const delayReason = 
        analysis.mainBlocker === 'Patient' ? target.patient.delayReason :
        analysis.mainBlocker === 'Staff' ? target.staff.delayReason :
        analysis.mainBlocker === 'Equipment' ? target.equipment.delayReason :
        analysis.mainBlocker === 'Sterile Supplies' ? target.sterileSupplies.delayReason : 'Resource readiness constraint';

      if (existingAlert) {
        setAlerts(prev => prev.map(a => {
          if (a.id === existingAlert.id) {
            const priorityChanged = a.priority !== analysis.escalationLevel;
            const history = [...(a.escalationHistory || [])];
            if (priorityChanged) {
              history.push({
                id: `ESC-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                previousPriority: a.priority,
                newPriority: analysis.escalationLevel,
                reason: `Priority updated via Readiness Analysis Engine (${analysis.mainBlocker} blocker)`,
                triggeredBy: 'Readiness Analysis Engine'
              });
            }
            return {
              ...a,
              priority: analysis.escalationLevel,
              escalationLevel: analysis.escalationLevel,
              issue: `${analysis.mainBlocker} readiness hold: ${delayReason || 'Delayed'}`,
              dueTime: analysis.allResourcesReadyTime,
              owner: alertOwner,
              escalationHistory: history
            };
          }
          return a;
        }));
      } else {
        const now = new Date();
        const newAlert: OperationalAlert = {
          id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
          sessionId: target.id,
          theatre: target.theatre,
          facility: target.facility,
          issue: `${analysis.mainBlocker} readiness hold: ${delayReason || 'Delayed readiness'}`,
          priority: analysis.escalationLevel,
          escalationLevel: analysis.escalationLevel,
          owner: alertOwner,
          dueTime: analysis.allResourcesReadyTime,
          status: 'OPEN',
          createdTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: now.toISOString(),
          escalationHistory: [
            {
              id: `ESC-${Date.now()}`,
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              previousPriority: 'NORMAL',
              newPriority: analysis.escalationLevel,
              reason: `Alert created by Readiness Analysis Engine (${analysis.mainBlocker} blocker)`,
              triggeredBy: 'Readiness Analysis Engine'
            }
          ],
          followUpNotes: [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: `Alert generated by Readiness Analysis Engine. ${analysis.predictedIdleMinutes} min idle predicted. Blocker: ${analysis.mainBlocker}`,
              author: user ? user.name : 'OR ReadySync Engine'
            }
          ]
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    }

    return analysis;
  };

  const updateAlert = (alertId: string, updates: Partial<OperationalAlert>) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        const updated = { ...a, ...updates };
        if (updates.priority && updates.priority !== a.priority) {
          const historyEntry = {
            id: `ESC-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            previousPriority: a.priority,
            newPriority: updates.priority as AlertPriority,
            reason: 'Priority level updated manually in control panel',
            triggeredBy: user ? user.name : 'User Manual Update'
          };
          updated.escalationLevel = updates.priority;
          updated.escalationHistory = [...(a.escalationHistory || []), historyEntry];
        }
        return updated;
      }
      return a;
    }));
  };

  const addAlertNote = (alertId: string, text: string, author: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        const newNote = {
          id: `NOTE-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text,
          author
        };
        return {
          ...a,
          followUpNotes: [...a.followUpNotes, newNote]
        };
      }
      return a;
    }));
  };

  const resolveAlert = (alertId: string) => {
    const targetAlert = alerts.find(a => a.id === alertId);
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        const resolvedHistory = [...(a.escalationHistory || []), {
          id: `ESC-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          previousPriority: a.priority,
          newPriority: a.priority,
          reason: 'Alert resolved by operational team',
          triggeredBy: user ? user.name : 'User Resolution'
        }];
        return { 
          ...a, 
          status: 'RESOLVED',
          resolvedAt: new Date().toISOString(),
          escalationHistory: resolvedHistory
        };
      }
      return a;
    }));

    if (targetAlert) {
      setSessions(prev => prev.map(s => {
        if (s.id === targetAlert.sessionId) {
          const isPatientReady = s.patient.status === 'READY';
          const isStaffReady = s.staff.status === 'READY';
          const isEquipReady = s.equipment.status === 'READY';
          const isSterileReady = s.sterileSupplies.status === 'READY';

          if (isPatientReady && isStaffReady && isEquipReady && isSterileReady) {
            return {
              ...s,
              overallStatus: 'READY',
              predictedIdleMinutes: 0,
              readinessScore: 95,
              mainBlocker: 'None'
            };
          } else {
            return {
              ...s,
              overallStatus: 'AT_RISK',
              readinessScore: Math.min(85, s.readinessScore + 15)
            };
          }
        }
        return s;
      }));
    }
  };

  const runScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);

    if (scenarioId === 'SCENARIO-1') {
      setSessions(prev => prev.map(s => {
        if (s.id === 'SES-103') {
          const updated = {
            ...s,
            equipment: {
              ...s.equipment,
              status: 'DELAYED' as const,
              expectedReadyTime: '10:38 AM',
              delayReason: 'Smart infusion pump failed self-test; emergency calibration in progress',
              owner: 'Equipment Coordinator'
            }
          };
          const analysis = analyzeSessionReadiness(updated);
          return {
            ...updated,
            allReadyTime: analysis.allResourcesReadyTime,
            predictedIdleMinutes: analysis.predictedIdleMinutes,
            readinessScore: analysis.readinessScore,
            overallStatus: analysis.overallStatus,
            mainBlocker: analysis.mainBlocker,
            aiRecommendation: analysis.aiRecommendation
          };
        }
        return s;
      }));

      const now = new Date();
      setAlerts(prev => [
        {
          id: `ALT-SCEN-1`,
          sessionId: 'SES-103',
          theatre: 'OR-03',
          facility: 'St. Jude Memorial Hospital',
          issue: 'Scenario 1 Active: Infusion pump failed self-test, calibration hold',
          priority: 'URGENT',
          escalationLevel: 'URGENT',
          owner: 'Equipment Coordinator',
          dueTime: '10:38 AM',
          status: 'OPEN',
          createdTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: now.toISOString(),
          escalationHistory: [
            {
              id: `ESC-SCEN-1`,
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              previousPriority: 'NORMAL',
              newPriority: 'URGENT',
              reason: 'Synthetic failure scenario injection (Equipment hold)',
              triggeredBy: 'Failure Test Center'
            }
          ],
          followUpNotes: [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: 'Failure Scenario 1 executed. Equipment flagged as main blocker.',
              author: 'Failure Test Center'
            }
          ]
        },
        ...prev
      ]);
    } else if (scenarioId === 'SCENARIO-2') {
      setSessions(prev => prev.map(s => {
        if (s.id === 'SES-102') {
          const updated = {
            ...s,
            staff: {
              ...s.staff,
              status: 'DELAYED' as const,
              expectedReadyTime: '09:40 AM',
              delayReason: 'Anaesthesia lead delayed in Trauma Bay emergency intubation',
              owner: 'Anaesthesia Operations Lead'
            }
          };
          const analysis = analyzeSessionReadiness(updated);
          return {
            ...updated,
            allReadyTime: analysis.allResourcesReadyTime,
            predictedIdleMinutes: analysis.predictedIdleMinutes,
            readinessScore: analysis.readinessScore,
            overallStatus: analysis.overallStatus,
            mainBlocker: analysis.mainBlocker,
            aiRecommendation: analysis.aiRecommendation
          };
        }
        return s;
      }));

      const now = new Date();
      setAlerts(prev => [
        {
          id: `ALT-SCEN-2`,
          sessionId: 'SES-102',
          theatre: 'OR-02',
          facility: 'St. Jude Memorial Hospital',
          issue: 'Scenario 2 Active: Anaesthesia lead delayed in Trauma Bay emergency',
          priority: 'URGENT',
          escalationLevel: 'URGENT',
          owner: 'Anaesthesia Operations Lead',
          dueTime: '09:40 AM',
          status: 'OPEN',
          createdTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: now.toISOString(),
          escalationHistory: [
            {
              id: `ESC-SCEN-2`,
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              previousPriority: 'NORMAL',
              newPriority: 'URGENT',
              reason: 'Synthetic failure scenario injection (Staff delay)',
              triggeredBy: 'Failure Test Center'
            }
          ],
          followUpNotes: [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: 'Failure Scenario 2 executed. Staff flagged as main blocker.',
              author: 'Failure Test Center'
            }
          ]
        },
        ...prev
      ]);
    } else if (scenarioId === 'SCENARIO-3') {
      setSessions(prev => prev.map(s => {
        if (s.id === 'SES-104') {
          const updated = {
            ...s,
            patient: {
              ...s.patient,
              status: 'DELAYED' as const,
              expectedReadyTime: '12:15 PM',
              delayReason: 'Regional highway ambulance collision gridlock delay',
              owner: 'Inter-Facility Transport Control'
            }
          };
          const analysis = analyzeSessionReadiness(updated);
          return {
            ...updated,
            allReadyTime: analysis.allResourcesReadyTime,
            predictedIdleMinutes: analysis.predictedIdleMinutes,
            readinessScore: analysis.readinessScore,
            overallStatus: 'ESCALATED',
            mainBlocker: analysis.mainBlocker,
            aiRecommendation: analysis.aiRecommendation
          };
        }
        return s;
      }));

      const now = new Date();
      setAlerts(prev => [
        {
          id: `ALT-SCEN-3`,
          sessionId: 'SES-104',
          theatre: 'OR-04',
          facility: 'Metro Health General',
          issue: 'Scenario 3 Active: Inter-facility transport gridlock (45 min delay)',
          priority: 'ESCALATED',
          escalationLevel: 'ESCALATED',
          owner: 'Inter-Facility Transport Control',
          dueTime: '12:15 PM',
          status: 'OPEN',
          createdTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: now.toISOString(),
          escalationHistory: [
            {
              id: `ESC-SCEN-3`,
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              previousPriority: 'NORMAL',
              newPriority: 'ESCALATED',
              reason: 'Synthetic failure scenario injection (Patient gridlock)',
              triggeredBy: 'Failure Test Center'
            }
          ],
          followUpNotes: [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: 'Failure Scenario 3 executed. Escalation triggered.',
              author: 'Failure Test Center'
            }
          ]
        },
        ...prev
      ]);
    } else if (scenarioId === 'SCENARIO-4') {
      setSessions(prev => prev.map(s => {
        if (s.id === 'SES-105') {
          const updated = {
            ...s,
            sterileSupplies: {
              ...s.sterileSupplies,
              status: 'DELAYED' as const,
              expectedReadyTime: '01:55 PM',
              delayReason: 'Autoclave biological indicator verification cycle hold',
              owner: 'Sterile Processing Supervisor'
            }
          };
          const analysis = analyzeSessionReadiness(updated);
          return {
            ...updated,
            allReadyTime: analysis.allResourcesReadyTime,
            predictedIdleMinutes: analysis.predictedIdleMinutes,
            readinessScore: analysis.readinessScore,
            overallStatus: analysis.overallStatus,
            mainBlocker: analysis.mainBlocker,
            aiRecommendation: analysis.aiRecommendation
          };
        }
        return s;
      }));

      const now = new Date();
      setAlerts(prev => [
        {
          id: `ALT-SCEN-4`,
          sessionId: 'SES-105',
          theatre: 'OR-05',
          facility: 'Metro Health General',
          issue: 'Scenario 4 Active: Biological indicator hold on orthopaedic spinal tray',
          priority: 'URGENT',
          escalationLevel: 'URGENT',
          owner: 'Sterile Processing Supervisor',
          dueTime: '01:55 PM',
          status: 'OPEN',
          createdTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: now.toISOString(),
          escalationHistory: [
            {
              id: `ESC-SCEN-4`,
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              previousPriority: 'NORMAL',
              newPriority: 'URGENT',
              reason: 'Synthetic failure scenario injection (Sterile hold)',
              triggeredBy: 'Failure Test Center'
            }
          ],
          followUpNotes: [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: 'Failure Scenario 4 executed. Sterile Supplies flagged as main blocker.',
              author: 'Failure Test Center'
            }
          ]
        },
        ...prev
      ]);
    }
  };

  const resetScenario = (_scenarioId: string) => {
    setActiveScenarioId(null);
    resetAllData();
  };

  const resetAllData = () => {
    const res = resetDemoState();
    setSessions(res.sessions);
    setAlerts(res.alerts);
    setActiveScenarioId(null);
    setSelectedSessionId('SES-103');
    setTestExecutionResults({});
    try {
      localStorage.removeItem(TEST_RESULTS_KEY);
    } catch {
      // ignore
    }
  };

  const runDeterministicTest = (testId: string): TestExecutionResult => {
    const testDef = DETERMINISTIC_TEST_CASES.find(t => t.id === testId);
    if (!testDef) {
      throw new Error(`Test definition ${testId} not found`);
    }

    const syntheticSession: TheatreSession = {
      id: testDef.affectedSessionId,
      facility: 'Test Hospital',
      theatre: 'OR-TEST',
      procedure: 'Deterministic Validation Procedure',
      patientId: 'PAT-TEST',
      patientName: 'Test Patient',
      scheduledStart: testDef.scheduledStartTime,
      patient: {
        status: testDef.initialResourceState.patientReady === testDef.scheduledStartTime ? 'READY' : 'DELAYED',
        expectedReadyTime: testDef.initialResourceState.patientReady,
        owner: 'Patient Transport'
      },
      staff: {
        status: testDef.initialResourceState.staffReady === testDef.scheduledStartTime ? 'READY' : 'DELAYED',
        expectedReadyTime: testDef.initialResourceState.staffReady,
        owner: 'Surgical Team'
      },
      equipment: {
        status: testDef.initialResourceState.equipmentReady === testDef.scheduledStartTime ? 'READY' : 'DELAYED',
        expectedReadyTime: testDef.initialResourceState.equipmentReady,
        owner: 'Biomedical Services'
      },
      sterileSupplies: {
        status: testDef.initialResourceState.sterileSuppliesReady === testDef.scheduledStartTime ? 'READY' : 'DELAYED',
        expectedReadyTime: testDef.initialResourceState.sterileSuppliesReady,
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

    const analysis = analyzeSessionReadiness(syntheticSession);

    const differences: string[] = [];
    if (analysis.mainBlocker !== testDef.expected.primaryBlocker) {
      differences.push(`Primary Blocker: expected "${testDef.expected.primaryBlocker}", got "${analysis.mainBlocker}"`);
    }
    if (analysis.overallStatus !== testDef.expected.sessionStatus) {
      differences.push(`Session Status: expected "${testDef.expected.sessionStatus}", got "${analysis.overallStatus}"`);
    }
    if (analysis.allResourcesReadyTime !== testDef.expected.allResourcesReadyTime) {
      differences.push(`All Ready Time: expected "${testDef.expected.allResourcesReadyTime}", got "${analysis.allResourcesReadyTime}"`);
    }
    if (analysis.predictedIdleMinutes !== testDef.expected.avoidableIdleMinutes) {
      differences.push(`Avoidable Idle Minutes: expected ${testDef.expected.avoidableIdleMinutes} min, got ${analysis.predictedIdleMinutes} min`);
    }

    const result: TestExecutionResult = {
      testId,
      passed: differences.length === 0,
      executedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actual: {
        primaryBlocker: analysis.mainBlocker,
        sessionStatus: analysis.overallStatus,
        allResourcesReadyTime: analysis.allResourcesReadyTime,
        avoidableIdleMinutes: analysis.predictedIdleMinutes,
        alertPriority: analysis.escalationLevel
      },
      differences
    };

    setTestExecutionResults(prev => ({
      ...prev,
      [testId]: result
    }));

    return result;
  };

  const runAllDeterministicTests = (): TestExecutionResult[] => {
    const results = DETERMINISTIC_TEST_CASES.map(tc => runDeterministicTest(tc.id));
    return results;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        sessions,
        alerts,
        activePage,
        setActivePage,
        selectedSessionId,
        setSelectedSessionId,
        selectedSession,
        runReadinessCheck,
        updateSessionResource,
        updateAlert,
        addAlertNote,
        resolveAlert,
        recheckSLA,
        runScenario,
        resetScenario,
        resetAllData,
        activeScenarioId,
        isAboutModalOpen,
        setIsAboutModalOpen,
        navigateToSynchronizerForSession,
        testExecutionResults,
        runDeterministicTest,
        runAllDeterministicTests
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
