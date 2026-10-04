import { createContext } from 'react';
import type { 
  TheatreSession, 
  OperationalAlert, 
  ActivePage, 
  ReadinessAnalysisResult,
  ResourceDetails,
  AuthUser,
  TestExecutionResult
} from '../types';

export interface AppContextType {
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
  recheckSLA: () => void;
  runScenario: (scenarioId: string) => void;
  resetScenario: (scenarioId: string) => void;
  resetAllData: () => void;
  activeScenarioId: string | null;
  isAboutModalOpen: boolean;
  setIsAboutModalOpen: (open: boolean) => void;
  navigateToSynchronizerForSession: (sessionId: string) => void;
  testExecutionResults: Record<string, TestExecutionResult>;
  runDeterministicTest: (testId: string) => TestExecutionResult;
  runAllDeterministicTests: () => TestExecutionResult[];
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
