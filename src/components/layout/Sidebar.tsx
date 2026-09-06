import React from 'react';
import { useApp } from '../../context/AppContext';
import type { ActivePage } from '../../types';
import {
  LayoutDashboard,
  CalendarDays,
  Layers,
  BellRing,
  FlaskConical,
  BarChart3,
  Database,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, alerts, sessions } = useApp();

  const openAlertsCount = alerts.filter(a => a.status !== 'RESOLVED').length;
  const delayedSessionsCount = sessions.filter(s => s.overallStatus === 'DELAYED' || s.overallStatus === 'ESCALATED').length;

  const navItems: Array<{
    id: ActivePage;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeVariant?: 'rose' | 'amber' | 'blue';
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'schedule',
      label: 'Theatre Schedule',
      icon: CalendarDays,
      badge: delayedSessionsCount > 0 ? `${delayedSessionsCount} Delayed` : undefined,
      badgeVariant: 'amber'
    },
    {
      id: 'synchronizer',
      label: 'Readiness Synchronizer',
      icon: Layers,
      badge: 'Main Feature',
      badgeVariant: 'blue'
    },
    {
      id: 'alerts',
      label: 'Alerts & Escalation',
      icon: BellRing,
      badge: openAlertsCount > 0 ? openAlertsCount : undefined,
      badgeVariant: 'rose'
    },
    {
      id: 'failure-center',
      label: 'Failure Test Center',
      icon: FlaskConical
    },
    {
      id: 'performance',
      label: 'Baseline & Performance',
      icon: BarChart3
    },
    {
      id: 'mock-data',
      label: 'Mock Data',
      icon: Database
    }
  ];

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 px-3 py-6 min-h-[calc(100vh-4rem)]">
      <div className="mb-4 px-3">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">OPERATIONS MANAGEMENT</h3>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeVariant === 'rose'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : item.badgeVariant === 'amber'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`h-3.5 w-3.5 opacity-0 transition-opacity ${isActive ? 'opacity-100' : 'group-hover:opacity-60'}`} />
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-800/80 pt-4 px-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-xs font-semibold text-slate-300">KPI Focus</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Reducing avoidable operating room idle minutes via 4-domain readiness sync.
          </p>
        </div>
      </div>
    </aside>
  );
};
