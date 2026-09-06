import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  TheatreSession, 
  OperationalAlert, 
  ActivePage, 
  ReadinessAnalysisResult,
  ResourceDetails,
  AuthUser
} from '../types';
import { loadSessions, saveSessions, loadAlerts, saveAlerts, resetDemoState, loadAuthUser, saveAuthUser } from '../services/storageService';
import { analyzeSessionReadiness } from '../services/aiEngine';
import { DEMO_USERS } from '../data/mockData';

interface AppContextType {
  user: AuthUser | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  sessions: TheatreSession[];
  alerts: OperationalAlert[];
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedSessionId: string;
  setSelectedSessionId: (id: string) => void;
  selectedSession: TheatreSession;
  runReadinessCheck: (sessionId: string) => ReadinessAnalysisResult;
  updateSessionResource: (sessionId: string, resourceKey: 'patient' | 'staff' | 'equipment' | 'sterileSupplies', updates: Partial<ResourceDetails>) => void;
  updateAlert: (alertId: string, updates: Partial<OperationalAlert>) => void;
  addAlertNote: (alertId: string, text: string, author: string) => void;
  resolveAlert: (alertId: string) => void;
  runScenario: (scenarioId: string) => void;
  resetScenario: (scenarioId: string) => void;
  resetAllData: () => void;
  activeScenarioId: string | null;
  isAboutModalOpen: boolean;
  setIsAboutModalOpen: (open: boolean) => void;
  navigateToSynchronizerForSession: (sessionId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(loadAuthUser);
  const [sessions, setSessions] = useState<TheatreSession[]>(loadSessions);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(loadAlerts);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('SES-103');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  useEffect(() => {
    saveAuthUser(user);
  }, [user]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

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
            return {
              ...a,
              priority: analysis.escalationLevel,
              issue: `${analysis.mainBlocker} readiness hold: ${delayReason || 'Delayed'}`,
              dueTime: analysis.allResourcesReadyTime,
              owner: alertOwner
            };
          }
          return a;
        }));
      } else {
        const newAlert: OperationalAlert = {
          id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
          sessionId: target.id,
          theatre: target.theatre,
          facility: target.facility,
          issue: `${analysis.mainBlocker} readiness hold: ${delayReason || 'Delayed readiness'}`,
          priority: analysis.escalationLevel,
          owner: alertOwner,
          dueTime: analysis.allResourcesReadyTime,
          status: 'OPEN',
          createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUpNotes: [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, ...updates } : a));
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
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a));

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

      setAlerts(prev => [
        {
          id: `ALT-SCEN-1`,
          sessionId: 'SES-103',
          theatre: 'OR-03',
          facility: 'St. Jude Memorial Hospital',
          issue: 'Scenario 1 Active: Infusion pump failed self-test, calibration hold',
          priority: 'URGENT',
          owner: 'Equipment Coordinator',
          dueTime: '10:38 AM',
          status: 'OPEN',
          createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUpNotes: [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

      setAlerts(prev => [
        {
          id: `ALT-SCEN-2`,
          sessionId: 'SES-102',
          theatre: 'OR-02',
          facility: 'St. Jude Memorial Hospital',
          issue: 'Scenario 2 Active: Anaesthesia lead delayed in Trauma Bay emergency',
          priority: 'URGENT',
          owner: 'Anaesthesia Operations Lead',
          dueTime: '09:40 AM',
          status: 'OPEN',
          createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUpNotes: [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

      setAlerts(prev => [
        {
          id: `ALT-SCEN-3`,
          sessionId: 'SES-104',
          theatre: 'OR-04',
          facility: 'Metro Health General',
          issue: 'Scenario 3 Active: Inter-facility transport gridlock (45 min delay)',
          priority: 'ESCALATED',
          owner: 'Inter-Facility Transport Control',
          dueTime: '12:15 PM',
          status: 'OPEN',
          createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUpNotes: [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

      setAlerts(prev => [
        {
          id: `ALT-SCEN-4`,
          sessionId: 'SES-105',
          theatre: 'OR-05',
          facility: 'Metro Health General',
          issue: 'Scenario 4 Active: Biological indicator hold on orthopaedic spinal tray',
          priority: 'URGENT',
          owner: 'Sterile Processing Supervisor',
          dueTime: '01:55 PM',
          status: 'OPEN',
          createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUpNotes: [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        runScenario,
        resetScenario,
        resetAllData,
        activeScenarioId,
        isAboutModalOpen,
        setIsAboutModalOpen,
        navigateToSynchronizerForSession
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
