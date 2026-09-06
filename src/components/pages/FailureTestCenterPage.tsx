import React from 'react';
import { useApp } from '../../context/AppContext';
import { FAILURE_SCENARIOS } from '../../data/mockData';
import { 
  FlaskConical, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Wrench,
  Users,
  User,
  Package
} from 'lucide-react';

export const FailureTestCenterPage: React.FC = () => {
  const { runScenario, resetScenario, resetAllData, activeScenarioId, setActivePage } = useApp();

  const iconMap: Record<string, React.ElementType> = {
    'SCENARIO-1': Wrench,
    'SCENARIO-2': Users,
    'SCENARIO-3': User,
    'SCENARIO-4': Package
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">Failure Test Center</h1>
            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-400 border border-purple-500/30">
              JUDGE DEMONSTRATION LAB
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Inject synthetic operational bottlenecks to demonstrate real-time AI recalculation, alerts, and escalation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetAllData}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>RESET ALL DEMO DATA</span>
          </button>
        </div>
      </div>

      {activeScenarioId && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 animate-bounce" />
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Active Synthetic Failure Injection</span>
              <p className="text-sm font-semibold text-white">
                {FAILURE_SCENARIOS.find(s => s.id === activeScenarioId)?.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => resetScenario(activeScenarioId)}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-500"
            >
              RESET SCENARIO
            </button>
            <button
              onClick={() => setActivePage('synchronizer')}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <span>View Synchronizer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {FAILURE_SCENARIOS.map(scenario => {
          const Icon = iconMap[scenario.id] || FlaskConical;
          const isActive = activeScenarioId === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`rounded-2xl border p-6 shadow-sm transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'border-amber-500/50 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 ring-2 ring-amber-500/40'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-800 p-2.5 text-blue-400 border border-slate-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">{scenario.title}</h3>
                      <p className="text-xs text-blue-400 font-semibold">{scenario.subtitle}</p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                      RUNNING
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                      READY TO TEST
                    </span>
                  )}
                </div>

                <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                  {scenario.description}
                </p>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Expected System Behaviors:</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {scenario.expectedOutcome.map((outcome, oIdx) => (
                      <li key={oIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-[11px] text-slate-400 font-medium">Affects Target Session: {scenario.affectedSessionId}</span>

                <div className="flex items-center gap-2">
                  {isActive ? (
                    <button
                      onClick={() => resetScenario(scenario.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => runScenario(scenario.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-md transition-all hover:bg-blue-500"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>RUN SCENARIO</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
