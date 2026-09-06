import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Activity, CheckCircle } from 'lucide-react';

export const AboutModal: React.FC = () => {
  const { isAboutModalOpen, setIsAboutModalOpen } = useApp();

  if (!isAboutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={() => setIsAboutModalOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">About OR ReadySync</h2>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                DEMO / MOCK DATA
              </span>
              <span className="text-xs text-slate-400">Operating Room Readiness Synchronization</span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-sm text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 leading-relaxed text-slate-200">
            “OR ReadySync is a demonstration prototype designed to reduce avoidable operating-room idle time by synchronizing patient, staff, equipment and sterile-supply readiness. The prototype uses fictional data and lightweight rule-based AI to identify readiness risks, recommend actions and support escalation.”
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Demonstration Scope</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>Synchronizes 4 critical readiness domains: Patient, Staff, Equipment, and Sterile Supplies.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>Calculates Avoidable Idle Minutes = MAX(0, All Resources Ready Time - Scheduled Start).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>Uses browser-local rule-based AI engine with zero external paid APIs or backend requirements.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>Provides a Failure Test Center with 4 realistic operational failure scenarios for judge evaluation.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-300">
            <p className="font-semibold">Fictional Demo Environment:</p>
            <p className="mt-0.5 text-blue-300/80">
              All patient records (e.g. PAT-1024), staff rosters, equipment IDs, and hospital names are strictly synthetic demonstration data.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsAboutModalOpen(false)}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 shadow-md shadow-blue-600/20"
          >
            Got it, return to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
