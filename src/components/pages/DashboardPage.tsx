import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KpiCard } from '../ui/KpiCard';
import { StatusBadge } from '../ui/StatusBadge';
import { 
  CalendarDays, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight,
  Filter,
  Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { sessions, alerts, navigateToSynchronizerForSession, setActivePage } = useApp();
  const [filterFacility, setFilterFacility] = useState<string>('ALL');

  const totalSessions = sessions.length;
  const readySessions = sessions.filter(s => s.overallStatus === 'READY').length;
  const atRiskSessions = sessions.filter(s => s.overallStatus === 'AT_RISK').length;
  const delayedSessions = sessions.filter(s => s.overallStatus === 'DELAYED' || s.overallStatus === 'ESCALATED').length;
  const totalIdleMinutes = sessions.reduce((acc, s) => acc + s.predictedIdleMinutes, 0);

  const unresolvedAlerts = alerts.filter(a => a.status !== 'RESOLVED');
  const highPriorityAlerts = unresolvedAlerts.filter(a => a.priority === 'URGENT' || a.priority === 'ESCALATED');

  const averageReadinessScore = Math.round(
    sessions.reduce((acc, s) => acc + s.readinessScore, 0) / (totalSessions || 1)
  );

  const filteredSessions = filterFacility === 'ALL'
    ? sessions
    : sessions.filter(s => s.facility === filterFacility);

  const facilities = Array.from(new Set(sessions.map(s => s.facility)));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Hospital Operations Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time synchronization of Patients, Staff, Equipment, and Sterile Supplies across all facilities.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 shadow-inner">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border-4 border-blue-500/40">
            <span className="text-xl font-black text-blue-400">{averageReadinessScore}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">OR Readiness Score</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {averageReadinessScore >= 85 ? 'Optimal Preparedness' : averageReadinessScore >= 70 ? 'Moderate Readiness' : 'Critical Bottlenecks Present'}
            </p>
            <p className="text-[10px] text-slate-400">Scale: 0–100 (Higher is ready)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <KpiCard
          title="Total Sessions"
          value={totalSessions}
          subtitle="Scheduled today"
          icon={CalendarDays}
          variant="slate"
        />
        <KpiCard
          title="Ready Sessions"
          value={readySessions}
          subtitle="On-time readiness"
          icon={CheckCircle2}
          variant="emerald"
        />
        <KpiCard
          title="At Risk Sessions"
          value={atRiskSessions}
          subtitle="Minor ready shift"
          icon={AlertTriangle}
          variant="amber"
        />
        <KpiCard
          title="Delayed Sessions"
          value={delayedSessions}
          subtitle="Resource bottlenecks"
          icon={AlertCircle}
          variant="rose"
        />
        <KpiCard
          title="Avoidable Idle Mins"
          value={`${totalIdleMinutes}m`}
          subtitle="Target: 0 mins"
          icon={Clock}
          variant="purple"
          trend="vs 240m baseline"
        />
        <KpiCard
          title="High Priority Actions"
          value={highPriorityAlerts.length}
          subtitle="Unresolved alerts"
          icon={ShieldAlert}
          variant={highPriorityAlerts.length > 0 ? "rose" : "slate"}
          onClick={() => setActivePage('alerts')}
        />
      </div>

      {highPriorityAlerts.length > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-300">
                  Unresolved High-Priority Actions ({highPriorityAlerts.length})
                </h3>
                <p className="text-xs text-slate-300">
                  Immediate operational intervention required to prevent cascading theatre idle time.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActivePage('alerts')}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-rose-500"
            >
              <span>Manage Escalations</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {highPriorityAlerts.slice(0, 2).map(alert => (
              <div
                key={alert.id}
                onClick={() => navigateToSynchronizerForSession(alert.sessionId)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border border-rose-500/20 bg-slate-900/80 p-3 text-xs transition-colors hover:border-rose-400/50 cursor-pointer min-h-full"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white">{alert.theatre} ({alert.facility})</span>
                    <StatusBadge status={alert.priority} size="sm" />
                  </div>
                  <p className="text-slate-300 truncate text-xs">{alert.issue}</p>
                </div>
                <div className="min-w-0 sm:text-right shrink-0 sm:max-w-[45%]">
                  <span className="text-[11px] font-medium text-slate-400 block truncate sm:whitespace-normal sm:break-words">
                    Owner: <strong className="text-slate-300 font-semibold">{alert.owner}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-800 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Today’s Theatre Sessions</h2>
            <p className="text-xs text-slate-400">Click any session row to inspect four-domain readiness calculations.</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterFacility}
              onChange={(e) => setFilterFacility(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Facilities</option>
              {facilities.map(fac => (
                <option key={fac} value={fac}>{fac}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5 font-bold">Session ID</th>
                <th className="px-4 py-3.5 font-bold">Theatre / Facility</th>
                <th className="px-4 py-3.5 font-bold">Procedure & Patient</th>
                <th className="px-4 py-3.5 font-bold">Scheduled</th>
                <th className="px-4 py-3.5 font-bold">Patient</th>
                <th className="px-4 py-3.5 font-bold">Staff</th>
                <th className="px-4 py-3.5 font-bold">Equipment</th>
                <th className="px-4 py-3.5 font-bold">Sterile</th>
                <th className="px-4 py-3.5 font-bold">Overall Status</th>
                <th className="px-4 py-3.5 font-bold">Score</th>
                <th className="px-4 py-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredSessions.map(session => (
                <tr
                  key={session.id}
                  onClick={() => navigateToSynchronizerForSession(session.id)}
                  className="transition-colors hover:bg-slate-800/50 cursor-pointer"
                >
                  <td className="px-4 py-3.5 font-bold text-blue-400">{session.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white">{session.theatre}</div>
                    <div className="text-[10px] text-slate-400">{session.facility}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-200 max-w-[160px] truncate">{session.procedure}</div>
                    <div className="text-[10px] text-slate-400">ID: {session.patientId}</div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-300">{session.scheduledStart}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={session.patient.status} size="sm" showIcon={false} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={session.staff.status} size="sm" showIcon={false} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={session.equipment.status} size="sm" showIcon={false} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={session.sterileSupplies.status} size="sm" showIcon={false} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={session.overallStatus} size="sm" />
                    {session.predictedIdleMinutes > 0 && (
                      <span className="ml-1 text-[10px] text-amber-400 font-bold">+{session.predictedIdleMinutes}m idle</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`font-bold ${session.readinessScore >= 80 ? 'text-emerald-400' : session.readinessScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {session.readinessScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-300 hover:bg-blue-500/20">
                      Sync Check
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
