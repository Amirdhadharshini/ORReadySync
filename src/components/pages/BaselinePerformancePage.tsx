import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KpiCard } from '../ui/KpiCard';
import { ERROR_ANALYSIS_CASES } from '../../data/mockData';
import { 
  BarChart3, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  Award,
  Printer,
  X
} from 'lucide-react';

export const BaselinePerformancePage: React.FC = () => {
  const { sessions } = useApp();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const totalSessionsTested = sessions.length;
  const totalPrototypeIdle = sessions.reduce((acc, s) => acc + s.predictedIdleMinutes, 0);
  const totalBaselineIdle = sessions.reduce((acc, s) => acc + s.baselineIdleMinutes, 0);
  const minutesSaved = Math.max(0, totalBaselineIdle - totalPrototypeIdle);
  const improvementPct = totalBaselineIdle > 0 ? ((minutesSaved / totalBaselineIdle) * 100).toFixed(1) : '0';

  const maxIdleForBar = Math.max(totalBaselineIdle, totalPrototypeIdle, 1);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">Baseline & Performance Analysis</h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              MEASURABLE RESULTS
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Comparing manual operational scheduling (Baseline) vs. OR ReadySync 4-domain automated readiness synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Generate Executive Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Baseline Idle Minutes"
          value={`${totalBaselineIdle} m`}
          subtitle="Manual scheduling baseline"
          icon={Clock}
          variant="slate"
        />
        <KpiCard
          title="Prototype Idle Minutes"
          value={`${totalPrototypeIdle} m`}
          subtitle="OR ReadySync synchronized"
          icon={BarChart3}
          variant="purple"
        />
        <KpiCard
          title="Minutes Saved"
          value={`${minutesSaved} m`}
          subtitle="Avoidable idle time eliminated"
          icon={TrendingDown}
          variant="emerald"
        />
        <KpiCard
          title="Efficiency Improvement"
          value={`${improvementPct}%`}
          subtitle="Reduction in theatre idle time"
          icon={Award}
          variant="blue"
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white">Avoidable Operating-Room Idle Minutes Comparison</h2>
          <p className="text-xs text-slate-400">
            Direct trial performance comparison across identical surgical schedules.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-slate-300">Baseline (Manual / Basic Scheduling)</span>
              <span className="text-slate-400">{totalBaselineIdle} Idle Minutes</span>
            </div>
            <div className="h-8 w-full rounded-xl bg-slate-800 p-1">
              <div
                className="h-full rounded-lg bg-gradient-to-r from-slate-600 to-slate-500 flex items-center justify-end pr-3 text-xs font-bold text-white shadow-inner transition-all duration-500"
                style={{ width: `${(totalBaselineIdle / maxIdleForBar) * 100}%` }}
              >
                {totalBaselineIdle} mins
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Delays are discovered reactively when patient or equipment is missing at scheduled start.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-blue-400">OR ReadySync (4-Domain Synchronized Prototype)</span>
              <span className="text-emerald-400">{totalPrototypeIdle} Idle Minutes ({improvementPct}% lower)</span>
            </div>
            <div className="h-8 w-full rounded-xl bg-slate-800 p-1">
              <div
                className="h-full rounded-lg bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 flex items-center justify-end pr-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-500"
                style={{ width: `${(totalPrototypeIdle / maxIdleForBar) * 100}%` }}
              >
                {totalPrototypeIdle} mins
              </div>
            </div>
            <p className="mt-1 text-[11px] text-emerald-400 font-semibold">
              ★ {minutesSaved} avoidable idle minutes saved! Early bottleneck detection enables proactive triage.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Session-by-Session Trial Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2 font-bold">Session ID</th>
                  <th className="px-4 py-2 font-bold">Theatre</th>
                  <th className="px-4 py-2 font-bold">Procedure</th>
                  <th className="px-4 py-2 font-bold">Baseline Idle</th>
                  <th className="px-4 py-2 font-bold">OR ReadySync Idle</th>
                  <th className="px-4 py-2 font-bold text-right">Minutes Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {sessions.map(s => {
                  const saved = Math.max(0, s.baselineIdleMinutes - s.predictedIdleMinutes);
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-bold text-blue-400">{s.id}</td>
                      <td className="px-4 py-2.5 font-bold text-white">{s.theatre}</td>
                      <td className="px-4 py-2.5 text-slate-300">{s.procedure}</td>
                      <td className="px-4 py-2.5 text-slate-400">{s.baselineIdleMinutes} mins</td>
                      <td className="px-4 py-2.5 font-bold text-slate-200">{s.predictedIdleMinutes} mins</td>
                      <td className="px-4 py-2.5 text-right font-bold text-emerald-400">+{saved} mins</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-extrabold text-white">Error Analysis & Human Escalation Boundaries</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Evaluating AI decision precision, success cases, and human-in-the-loop escalation rules.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {ERROR_ANALYSIS_CASES.map(item => (
            <div
              key={item.id}
              className={`rounded-xl border p-4 text-xs space-y-2 ${
                item.humanInterventionRequired
                  ? 'border-amber-500/30 bg-amber-500/10'
                  : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.humanInterventionRequired ? (
                    <HelpCircle className="h-4 w-4 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                  <span className="font-bold text-white">{item.caseTitle}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{item.sessionRef}</span>
              </div>

              <p className="text-slate-300 leading-relaxed">{item.description}</p>

              {item.humanInterventionRequired && (
                <div className="rounded-lg bg-amber-500/20 p-2 text-[11px] font-semibold text-amber-300 border border-amber-500/30">
                  ⚠️ Human Intervention Rationale: Operational ambiguity requires human clinical judgment rather than unverified automated reassignment.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Executive Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Executive Performance Summary Report</h3>
                <p className="text-xs text-slate-400">Apex Regional Hospital Network • OR ReadySync v1.0</p>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                <h4 className="font-bold text-blue-300 text-sm">Trial Key Metric Findings</h4>
                <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                  <div className="rounded bg-slate-900 p-2">
                    <span className="text-[10px] text-slate-400">Sessions</span>
                    <p className="font-bold text-white text-base">{totalSessionsTested}</p>
                  </div>
                  <div className="rounded bg-slate-900 p-2">
                    <span className="text-[10px] text-slate-400">Baseline Idle</span>
                    <p className="font-bold text-slate-300 text-base">{totalBaselineIdle}m</p>
                  </div>
                  <div className="rounded bg-slate-900 p-2">
                    <span className="text-[10px] text-slate-400">Prototype Idle</span>
                    <p className="font-bold text-purple-400 text-base">{totalPrototypeIdle}m</p>
                  </div>
                  <div className="rounded bg-slate-900 p-2">
                    <span className="text-[10px] text-slate-400">Total Saved</span>
                    <p className="font-bold text-emerald-400 text-base">+{minutesSaved}m ({improvementPct}%)</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Operational Conclusion:</h4>
                <p className="leading-relaxed">
                  By evaluating Patient, Staff, Equipment, and Sterile Supply readiness simultaneously, OR ReadySync eliminates uncoordinated room holding delays, reducing overall avoidable theatre idle minutes by {improvementPct}%.
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Official Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
