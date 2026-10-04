import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import { FAILURE_SCENARIOS, DETERMINISTIC_TEST_CASES } from '../../data/mockData';
import { 
  FlaskConical, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Wrench,
  Users,
  User,
  Package,
  Check,
  Zap,
  BookOpen
} from 'lucide-react';

export const FailureTestCenterPage: React.FC = () => {
  const { 
    runScenario, 
    resetScenario, 
    resetAllData, 
    activeScenarioId, 
    setActivePage,
    testExecutionResults,
    runDeterministicTest,
    runAllDeterministicTests
  } = useApp();

  const [activeTab, setActiveTab] = useState<'DETERMINISTIC' | 'SCENARIOS'>('DETERMINISTIC');

  const iconMap: Record<string, React.ElementType> = {
    'TEST-001': User,
    'TEST-002': Wrench,
    'TEST-003': Users,
    'TEST-004': Package,
    'TEST-005': CheckCircle2,
    'SCENARIO-1': Wrench,
    'SCENARIO-2': Users,
    'SCENARIO-3': User,
    'SCENARIO-4': Package
  };

  const executedCount = Object.keys(testExecutionResults).length;
  const passedCount = Object.values(testExecutionResults).filter(r => r.passed).length;
  const failedCount = executedCount - passedCount;
  const passRate = executedCount > 0 ? Math.round((passedCount / executedCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">Failure Test Center</h1>
            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-400 border border-purple-500/30">
              DETERMINISTIC TESTING LAB
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Execute deterministic test cases (TEST-001 to TEST-005) or inject synthetic failure scenarios to validate readiness engine algorithms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => runAllDeterministicTests()}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-purple-500 transition-colors"
          >
            <Zap className="h-4 w-4 fill-current" />
            <span>RUN ALL TESTS</span>
          </button>

          <button
            onClick={resetAllData}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>RESET DEMO DATA</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('DETERMINISTIC')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'DETERMINISTIC'
              ? 'bg-purple-600 text-white shadow-md'
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Deterministic Test Suite (TEST-001 - TEST-005)
        </button>

        <button
          onClick={() => setActiveTab('SCENARIOS')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'SCENARIOS'
              ? 'bg-purple-600 text-white shadow-md'
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Interactive Synthetic Scenarios
        </button>
      </div>

      {/* Test Execution Summary Banner */}
      {executedCount > 0 && activeTab === 'DETERMINISTIC' && (
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-3 ${failedCount === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
              {failedCount === 0 ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Deterministic Test Execution Summary</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {executedCount} of {DETERMINISTIC_TEST_CASES.length} test cases executed. All assertions evaluated deterministically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-extrabold">
            <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-400 text-[10px] font-bold">TOTAL</span>
              <span className="text-white text-base">{DETERMINISTIC_TEST_CASES.length} Tests</span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
              <span className="block text-emerald-400 text-[10px] font-bold">PASSED</span>
              <span className="text-emerald-300 text-base">{passedCount} Passed</span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-xl bg-rose-950/50 border border-rose-500/30">
              <span className="block text-rose-400 text-[10px] font-bold">FAILED</span>
              <span className="text-rose-300 text-base">{failedCount} Failed</span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-xl bg-purple-950/50 border border-purple-500/30">
              <span className="block text-purple-400 text-[10px] font-bold">PASS RATE</span>
              <span className="text-purple-300 text-base">{passRate}% Pass Rate</span>
            </div>
          </div>
        </div>
      )}

      {/* Deterministic Tests View */}
      {activeTab === 'DETERMINISTIC' && (
        <div className="space-y-6">
          <div className="grid gap-6">
            {DETERMINISTIC_TEST_CASES.map(test => {
              const Icon = iconMap[test.id] || FlaskConical;
              const result = testExecutionResults[test.id];

              return (
                <div
                  key={test.id}
                  className={`rounded-2xl border p-6 shadow-sm transition-all bg-slate-900 ${
                    result?.passed
                      ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/10 via-slate-900 to-slate-900'
                      : result && !result.passed
                      ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/10 via-slate-900 to-slate-900'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-800 p-2.5 text-purple-400 border border-slate-700">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-purple-400">{test.id}</span>
                          <h3 className="text-base font-extrabold text-white">{test.name}</h3>
                        </div>
                        <p className="text-xs text-slate-400">{test.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {result ? (
                        result.passed ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-extrabold text-emerald-400 border border-emerald-500/40">
                            <Check className="h-4 w-4" />
                            <span>✓ PASS</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3.5 py-1 text-xs font-extrabold text-rose-400 border border-rose-500/40">
                            <XCircle className="h-4 w-4" />
                            <span>✗ FAIL</span>
                          </span>
                        )
                      ) : (
                        <span className="rounded-full bg-slate-800 px-3.5 py-1 text-xs font-semibold text-slate-400">
                          NOT RUN YET
                        </span>
                      )}

                      <button
                        onClick={() => runDeterministicTest(test.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Run Test</span>
                      </button>
                    </div>
                  </div>

                  {/* Purpose & Expected Documentation */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Purpose & Expected Behavior Documentation</span>
                    </div>
                    <p className="text-xs text-slate-300">{test.purpose}</p>

                    <div className="pt-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Expected Results:</span>
                      <ul className="mt-1 grid sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                        {test.expected.expectedOutcome.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Expected vs Actual Results Table */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300">Deterministic Result Comparison</h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-bold block">PRIMARY BLOCKER</span>
                        <div className="mt-1 space-y-0.5">
                          <span className="block text-[11px] text-slate-400">Exp: <strong className="text-slate-200">{test.expected.primaryBlocker}</strong></span>
                          <span className="block text-[11px]">
                            Act: <strong className={result?.actual.primaryBlocker === test.expected.primaryBlocker ? 'text-emerald-400' : result ? 'text-rose-400' : 'text-slate-400'}>
                              {result ? result.actual.primaryBlocker : '—'}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-bold block">SESSION STATUS</span>
                        <div className="mt-1 space-y-0.5">
                          <span className="block text-[11px] text-slate-400">Exp: <strong className="text-slate-200">{test.expected.sessionStatus}</strong></span>
                          <span className="block text-[11px]">
                            Act: <strong className={result?.actual.sessionStatus === test.expected.sessionStatus ? 'text-emerald-400' : result ? 'text-rose-400' : 'text-slate-400'}>
                              {result ? result.actual.sessionStatus : '—'}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-bold block">ALL READY TIME</span>
                        <div className="mt-1 space-y-0.5">
                          <span className="block text-[11px] text-slate-400">Exp: <strong className="text-slate-200">{test.expected.allResourcesReadyTime}</strong></span>
                          <span className="block text-[11px]">
                            Act: <strong className={result?.actual.allResourcesReadyTime === test.expected.allResourcesReadyTime ? 'text-emerald-400' : result ? 'text-rose-400' : 'text-slate-400'}>
                              {result ? result.actual.allResourcesReadyTime : '—'}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-bold block">AVOIDABLE IDLE TIME</span>
                        <div className="mt-1 space-y-0.5">
                          <span className="block text-[11px] text-slate-400">Exp: <strong className="text-slate-200">{test.expected.avoidableIdleMinutes} min</strong></span>
                          <span className="block text-[11px]">
                            Act: <strong className={result?.actual.avoidableIdleMinutes === test.expected.avoidableIdleMinutes ? 'text-emerald-400' : result ? 'text-rose-400' : 'text-slate-400'}>
                              {result ? `${result.actual.avoidableIdleMinutes} min` : '—'}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {result && !result.passed && result.differences.length > 0 && (
                      <div className="mt-2 rounded-lg bg-rose-950/30 p-2.5 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                        <span className="font-bold block text-rose-400">Detected Assertion Discrepancies:</span>
                        {result.differences.map((diff, dIdx) => (
                          <p key={dIdx} className="text-[11px]">• {diff}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Synthetic Scenarios View */}
      {activeTab === 'SCENARIOS' && (
        <div className="space-y-6">
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
      )}
    </div>
  );
};
