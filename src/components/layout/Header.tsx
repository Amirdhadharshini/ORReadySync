import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { 
  Activity, 
  Bell, 
  Info, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  RotateCcw,
  X,
  ArrowRight,
  Check,
  LogOut
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, alerts, resetAllData, setIsAboutModalOpen, setActivePage, resolveAlert, navigateToSynchronizerForSession } = useApp();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const openAlerts = alerts.filter(a => a.status !== 'RESOLVED');

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 backdrop-blur-md">
      {/* Left section: Logo & Hospital Group */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('dashboard')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-md shadow-blue-500/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white">OR ReadySync</span>
              <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-500/20">
                PROTOTYPE
              </span>
            </div>
            <p className="text-xs text-slate-400">Hospital Operating Room Readiness Engine</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 md:flex">
          <Building2 className="h-3.5 w-3.5 text-blue-400" />
          <span className="font-medium text-slate-200">Apex Regional Hospital Network</span>
        </div>
      </div>

      {/* Middle section: Demo / Mock Data Notice & Date */}
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 lg:flex">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span>DEMO / MOCK DATA</span>
        </div>

        <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span>{currentDateStr}</span>
        </div>
      </div>

      {/* Right section: System Status, Notifications Dropdown, About, Profile, Logout */}
      <div className="flex items-center gap-3">
        {/* System Operational Badge */}
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 sm:flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>System Operational</span>
        </div>

        {/* Notifications Popover Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative rounded-lg border border-slate-800 bg-slate-800/80 p-2 text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            title="Operational Alerts"
          >
            <Bell className="h-4 w-4" />
            {openAlerts.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                {openAlerts.length}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-400" />
                  <span className="font-bold text-white text-sm">Active Alerts ({openAlerts.length})</span>
                </div>
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="rounded p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {openAlerts.length === 0 ? (
                <div className="py-6 text-center text-slate-500">
                  <p className="font-medium">No open operational alerts.</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2.5 scrollbar-thin">
                  {openAlerts.map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        navigateToSynchronizerForSession(alert.sessionId);
                        setIsNotificationOpen(false);
                      }}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 hover:border-blue-500/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{alert.theatre}</span>
                        <StatusBadge status={alert.priority} size="sm" />
                      </div>
                      <p className="mt-1 text-slate-300 leading-snug truncate">{alert.issue}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Owner: {alert.owner}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resolveAlert(alert.id);
                          }}
                          className="flex items-center gap-1 font-bold text-emerald-400 hover:underline"
                        >
                          <Check className="h-3 w-3" />
                          <span>Resolve</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 border-t border-slate-800 pt-2.5 text-center">
                <button
                  onClick={() => {
                    setActivePage('alerts');
                    setIsNotificationOpen(false);
                  }}
                  className="flex items-center justify-center gap-1 w-full text-xs font-bold text-blue-400 hover:underline"
                >
                  <span>Go to Alerts & Escalation Center</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* About Prototype Button */}
        <button
          onClick={() => setIsAboutModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-400 transition-all hover:bg-blue-500/20"
        >
          <Info className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">About</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={resetAllData}
          className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
          title="Reset Demo Data"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Reset</span>
        </button>

        {/* Logged in User Profile & Logout */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white ring-1 ring-slate-700">
            {user?.initials || 'DR'}
          </div>
          <div className="hidden text-left xl:block">
            <p className="text-xs font-semibold leading-none text-slate-200">{user?.name || 'Dr. Sarah Jenkins'}</p>
            <p className="mt-1 text-[10px] leading-none text-slate-400">{user?.role || 'Chief OR Director'}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
