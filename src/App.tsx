import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AboutModal } from './components/layout/AboutModal';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { TheatreSchedulePage } from './components/pages/TheatreSchedulePage';
import { ReadinessSynchronizerPage } from './components/pages/ReadinessSynchronizerPage';
import { AlertsEscalationPage } from './components/pages/AlertsEscalationPage';
import { FailureTestCenterPage } from './components/pages/FailureTestCenterPage';
import { BaselinePerformancePage } from './components/pages/BaselinePerformancePage';
import { MockDataPage } from './components/pages/MockDataPage';

const MainContent: React.FC = () => {
  const { activePage } = useApp();

  return (
    <main className="flex-1 overflow-y-auto bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl">
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'schedule' && <TheatreSchedulePage />}
        {activePage === 'synchronizer' && <ReadinessSynchronizerPage />}
        {activePage === 'alerts' && <AlertsEscalationPage />}
        {activePage === 'failure-center' && <FailureTestCenterPage />}
        {activePage === 'performance' && <BaselinePerformancePage />}
        {activePage === 'mock-data' && <MockDataPage />}
      </div>
    </main>
  );
};

const ProtectedAppLayout: React.FC = () => {
  const { user } = useApp();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
      <AboutModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <ProtectedAppLayout />
    </AppProvider>
  );
}

export default App;
