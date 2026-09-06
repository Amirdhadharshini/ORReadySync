import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { 
  User, 
  Users, 
  Wrench, 
  Package, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  ChevronRight,
  Activity,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import type { ReadinessAnalysisResult, ResourceStatus } from '../../types';

export const ReadinessSynchronizerPage: React.FC = () => {
  const { 
    sessions, 
    selectedSessionId, 
    setSelectedSessionId, 
    selectedSession, 
    runReadinessCheck,
    updateSessionResource,
    setActivePage
  } = useApp();

  const [, setLastAnalysis] = useState<ReadinessAnalysisResult | null>(null);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [editingResourceKey, setEditingResourceKey] = useState<'patient' | 'staff' | 'equipment' | 'sterileSupplies' | null>(null);

  const handleRunCheck = () => {
    setIsRunningCheck(true);
    setShowSuccessMessage(false);
    setTimeout(() => {
      const result = runReadinessCheck(selectedSessionId);
      setLastAnalysis(result);
      setIsRunningCheck(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3500);
    }, 750);
  };

  const resourceCards = [
    {
      key: 'patient' as const,
      title: 'PATIENT',
      icon: User,
      details: selectedSession.patient
    },
    {
      key: 'staff' as const,
      title: 'STAFF',
      icon: Users,
      details: selectedSession.staff
    },
    {
      key: 'equipment' as const,
      title: 'EQUIPMENT',
      icon: Wrench,
      details: selectedSession.equipment
    },
    {
      key: 'sterileSupplies' as const,
      title: 'STERILE SUPPLIES',
      icon: Package,
      details: selectedSession.sterileSupplies
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Session Selector Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">Readiness Synchronizer</h1>
            <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
              CORE FEATURE
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Synchronizes 4-domain readiness times to prevent operating room idle minutes.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Session:</label>
          <select
            value={selectedSessionId}
            onChange={(e) => {
              setSelectedSessionId(e.target.value);
              setLastAnalysis(null);
              setEditingResourceKey(null);
              setShowSuccessMessage(false);
            }}
            className="rounded-xl border border-blue-500/30 bg-slate-950 px-4 py-2 text-sm font-bold text-white outline-none focus:border-blue-500"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.id} — {s.theatre} ({s.procedure})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Session Metadata Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="grid gap-4 sm:grid-cols-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Theatre / Facility</span>
            <p className="font-bold text-white text-sm">{selectedSession.theatre}</p>
            <p className="text-slate-400">{selectedSession.facility}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Procedure Name</span>
            <p className="font-bold text-white text-sm truncate">{selectedSession.procedure}</p>
            <p className="text-slate-400">Patient ID: {selectedSession.patientId}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Scheduled Theatre Start</span>
            <p className="font-bold text-blue-400 text-sm">{selectedSession.scheduledStart}</p>
            <p className="text-slate-400">Target Start Time</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Current Overall Status</span>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={selectedSession.overallStatus} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Large Readiness Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {resourceCards.map((card) => {
          const Icon = card.icon;
          const isBlocker = selectedSession.mainBlocker === (
            card.title === 'PATIENT' ? 'Patient' :
            card.title === 'STAFF' ? 'Staff' :
            card.title === 'EQUIPMENT' ? 'Equipment' : 'Sterile Supplies'
          );
          const isEditing = editingResourceKey === card.key;

          return (
            <div
              key={card.key}
              className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 flex flex-col justify-between ${
                isBlocker
                  ? 'border-rose-500/50 bg-gradient-to-b from-rose-950/20 to-slate-900 ring-1 ring-rose-500/40'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-slate-800 p-2 text-blue-400 border border-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">{card.title}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingResourceKey(isEditing ? null : card.key)}
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                      title="Adjust status & ready time"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <StatusBadge status={card.details.status} size="sm" />
                  </div>
                </div>

                {isBlocker && (
                  <div className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                    <AlertTriangle className="h-3 w-3" />
                    <span>MAIN BLOCKING RESOURCE</span>
                  </div>
                )}

                {/* Inline Editing Controls */}
                {isEditing ? (
                  <div className="mt-3 rounded-xl border border-blue-500/30 bg-slate-950 p-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-blue-400">Quick Adjust Status:</span>
                      <button
                        onClick={() => setEditingResourceKey(null)}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Done
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      {(['READY', 'AT_RISK', 'DELAYED'] as ResourceStatus[]).map(st => (
                        <button
                          key={st}
                          onClick={() => {
                            updateSessionResource(selectedSession.id, card.key, { status: st });
                          }}
                          className={`rounded px-1.5 py-1 text-[9px] font-bold ${
                            card.details.status === st ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400">Expected Time:</span>
                      <input
                        type="text"
                        defaultValue={card.details.expectedReadyTime}
                        onBlur={(e) => updateSessionResource(selectedSession.id, card.key, { expectedReadyTime: e.target.value })}
                        className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400">Delay Reason:</span>
                      <input
                        type="text"
                        defaultValue={card.details.delayReason || ''}
                        onBlur={(e) => updateSessionResource(selectedSession.id, card.key, { delayReason: e.target.value })}
                        placeholder="Add reason..."
                        className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Expected Ready:</span>
                      <span className="font-bold text-white">{card.details.expectedReadyTime}</span>
                    </div>

                    {card.details.actualReadyTime && (
                      <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                        <span className="text-slate-400">Actual Ready:</span>
                        <span className="font-semibold text-emerald-400">{card.details.actualReadyTime}</span>
                      </div>
                    )}

                    {card.details.delayReason && (
                      <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-amber-400">Delay Reason:</span>
                        <p className="mt-0.5 text-[11px] text-slate-300 leading-snug">{card.details.delayReason}</p>
                      </div>
                    )}

                    <div className="pt-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Responsible Owner:</span>
                      <p className="font-semibold text-blue-300 truncate">{card.details.owner}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Mark Ready Action Button */}
              {card.details.status !== 'READY' && !isEditing && (
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-end">
                  <button
                    onClick={() => updateSessionResource(selectedSession.id, card.key, { status: 'READY', delayReason: undefined })}
                    className="flex items-center gap-1 rounded bg-emerald-600/20 px-2 py-1 text-[10px] font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 transition-colors"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Mark Ready</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Trigger Action Section */}
      <div className="flex flex-col items-center justify-center py-2">
        <button
          onClick={handleRunCheck}
          disabled={isRunningCheck}
          className="group relative flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-105 hover:from-blue-500 hover:to-cyan-500 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
        >
          {isRunningCheck ? (
            <>
              <Sparkles className="h-6 w-6 text-cyan-300 animate-spin" />
              <span>CHECKING READINESS...</span>
            </>
          ) : (
            <>
              <RotateCcw className="h-5 w-5 text-cyan-300 transition-transform group-hover:rotate-180 duration-500" />
              <span>RE-CHECK READINESS</span>
            </>
          )}
        </button>

        {/* Completion Feedback Toast Message */}
        {showSuccessMessage && (
          <div className="mt-2.5 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Readiness check completed ✓</span>
          </div>
        )}
      </div>

      {/* Central Section: Readiness Analysis & Guidance Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white">Readiness Analysis</h3>
              <p className="text-xs text-slate-400">Mathematical calculation of resource dependency convergence</p>
            </div>
            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-mono font-semibold text-slate-300">
              Formula Engine v1.0
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 border border-slate-800">
              <span className="text-slate-400">Scheduled Theatre Start:</span>
              <span className="font-bold text-white text-sm">{selectedSession.scheduledStart}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-950/40 p-2.5 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Patient Ready</span>
                <p className="font-semibold text-slate-200">{selectedSession.patient.expectedReadyTime}</p>
              </div>
              <div className="rounded-lg bg-slate-950/40 p-2.5 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Staff Ready</span>
                <p className="font-semibold text-slate-200">{selectedSession.staff.expectedReadyTime}</p>
              </div>
              <div className="rounded-lg bg-slate-950/40 p-2.5 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Equipment Ready</span>
                <p className="font-semibold text-slate-200">{selectedSession.equipment.expectedReadyTime}</p>
              </div>
              <div className="rounded-lg bg-slate-950/40 p-2.5 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Sterile Supplies Ready</span>
                <p className="font-semibold text-slate-200">{selectedSession.sterileSupplies.expectedReadyTime}</p>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-300">All Resources Ready Time:</span>
                <span className="font-black text-white text-base">{selectedSession.allReadyTime}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Calculated as the latest readiness time among patient, staff, equipment, and sterile supplies.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Predicted Idle Mins</span>
                <p className={`mt-1 text-xl font-extrabold ${selectedSession.predictedIdleMinutes > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedSession.predictedIdleMinutes} m
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Readiness Score</span>
                <p className={`mt-1 text-xl font-extrabold ${selectedSession.readinessScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedSession.readinessScore}/100
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Main Blocker</span>
                <p className="mt-1 text-sm font-bold text-rose-400 truncate">
                  {selectedSession.mainBlocker}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">READINESS ANALYSIS</h3>
                  <p className="text-xs text-slate-400">Operational Reasoning & Escalation Guidance</p>
                </div>
              </div>
              <StatusBadge status={selectedSession.overallStatus} size="md" />
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Prediction Status</span>
                  <p className="font-bold text-white text-sm mt-0.5">{selectedSession.overallStatus}</p>
                </div>
                <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Main Blocker</span>
                  <p className="font-bold text-rose-400 text-sm mt-0.5">{selectedSession.mainBlocker}</p>
                </div>
                <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Predicted Idle Time</span>
                  <p className="font-bold text-amber-400 text-sm mt-0.5">{selectedSession.predictedIdleMinutes} minutes</p>
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-slate-950/80 p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Operational Recommendation:</span>
                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-200">
                  {selectedSession.aiRecommendation}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Escalation Status:</span>
              <StatusBadge
                status={selectedSession.predictedIdleMinutes >= 30 ? 'ESCALATED' : selectedSession.predictedIdleMinutes >= 15 ? 'URGENT' : 'NORMAL'}
                size="sm"
              />
            </div>

            <button
              onClick={() => setActivePage('alerts')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
            >
              <span>View Escalation Alerts</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
