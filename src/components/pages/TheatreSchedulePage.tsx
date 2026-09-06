import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Search, Clock, ArrowUpRight, User, Users, Wrench, Package } from 'lucide-react';

export const TheatreSchedulePage: React.FC = () => {
  const { sessions, navigateToSynchronizerForSession } = useApp();
  const [filterFacility, setFilterFacility] = useState<string>('ALL');
  const [filterTheatre, setFilterTheatre] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const facilities = Array.from(new Set(sessions.map(s => s.facility)));
  const theatres = Array.from(new Set(sessions.map(s => s.theatre)));

  const filteredSessions = sessions.filter(s => {
    if (filterFacility !== 'ALL' && s.facility !== filterFacility) return false;
    if (filterTheatre !== 'ALL' && s.theatre !== filterTheatre) return false;
    if (filterStatus !== 'ALL' && s.overallStatus !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.theatre.toLowerCase().includes(q) ||
        s.procedure.toLowerCase().includes(q) ||
        s.patientId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Theatre Schedule</h1>
          <p className="mt-1 text-sm text-slate-400">
            View upcoming operating room schedules and predicted idle time across facilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold text-blue-400">
            {filteredSessions.length} Sessions Loaded
          </span>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4 sm:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search procedure, ID, theatre..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={filterFacility}
            onChange={(e) => setFilterFacility(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Facilities</option>
            {facilities.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <select
            value={filterTheatre}
            onChange={(e) => setFilterTheatre(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Theatres</option>
            {theatres.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">READY</option>
            <option value="AT_RISK">AT RISK</option>
            <option value="DELAYED">DELAYED</option>
            <option value="ESCALATED">ESCALATED</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map(session => (
          <div
            key={session.id}
            onClick={() => navigateToSynchronizerForSession(session.id)}
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-200 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">{session.id}</span>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {session.theatre} — {session.procedure}
                  </h3>
                  <p className="text-xs text-slate-400">{session.facility}</p>
                </div>
                <StatusBadge status={session.overallStatus} size="sm" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Scheduled Start</span>
                  <p className="font-bold text-slate-200">{session.scheduledStart}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Patient ID</span>
                  <p className="font-bold text-slate-200">{session.patientId}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <User className="h-3.5 w-3.5 text-blue-400" />
                    <span>Patient Ready:</span>
                  </div>
                  <span className="font-semibold text-slate-200">{session.patient.expectedReadyTime}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Users className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Staff Ready:</span>
                  </div>
                  <span className="font-semibold text-slate-200">{session.staff.expectedReadyTime}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Wrench className="h-3.5 w-3.5 text-amber-400" />
                    <span>Equipment Ready:</span>
                  </div>
                  <span className="font-semibold text-slate-200">{session.equipment.expectedReadyTime}</span>
                </div>

                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Package className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Sterile Ready:</span>
                  </div>
                  <span className="font-semibold text-slate-200">{session.sterileSupplies.expectedReadyTime}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-800 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-slate-400">Predicted Idle:</span>
                <span className={`font-bold ${session.predictedIdleMinutes > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {session.predictedIdleMinutes} mins
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                <span>Sync Check</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
