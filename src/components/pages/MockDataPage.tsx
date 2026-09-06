import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, User, Users, Wrench, Package, Calendar } from 'lucide-react';

export const MockDataPage: React.FC = () => {
  const { sessions } = useApp();
  const [activeTab, setActiveTab] = useState<'schedules' | 'patients' | 'staff' | 'equipment' | 'sterile'>('schedules');

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">Synthetic Mock Data Registry</h1>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
              FICTIONAL DEMO DATA ONLY
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Transparent view of synthetic patient identifiers, staff rosters, biomedical equipment status, and sterile supply trays.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-center gap-3">
        <ShieldAlert className="h-6 w-6 text-amber-400 shrink-0" />
        <div>
          <span className="font-bold uppercase tracking-wider text-amber-400">HIPAA & Prototype Disclaimer:</span>
          <p className="mt-0.5 text-slate-300">
            This prototype operates strictly on fictional demonstration data. All patient codes (e.g. PAT-1024), staff names, equipment serials, and hospital facilities are 100% synthetic. No real patient data or external integrations are utilized.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'schedules', label: 'Theatre Schedules', icon: Calendar },
          { id: 'patients', label: 'Patient Readiness', icon: User },
          { id: 'staff', label: 'Staff Rosters', icon: Users },
          { id: 'equipment', label: 'Equipment Registry', icon: Wrench },
          { id: 'sterile', label: 'Sterile Kits', icon: Package }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
        {activeTab === 'schedules' && (
          <div className="p-4 overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-3">Operating Room Master Schedule</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Session ID</th>
                  <th className="p-3">Facility</th>
                  <th className="p-3">Theatre</th>
                  <th className="p-3">Procedure</th>
                  <th className="p-3">Scheduled Start</th>
                  <th className="p-3">Baseline Idle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-blue-400">{s.id}</td>
                    <td className="p-3">{s.facility}</td>
                    <td className="p-3 font-bold text-white">{s.theatre}</td>
                    <td className="p-3">{s.procedure}</td>
                    <td className="p-3 font-semibold text-slate-200">{s.scheduledStart}</td>
                    <td className="p-3 text-slate-400">{s.baselineIdleMinutes} mins</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="p-4 overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-3">Fictional Patient Readiness Records</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Patient Code</th>
                  <th className="p-3">Session ID</th>
                  <th className="p-3">Expected Ready</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Delay Reason</th>
                  <th className="p-3">Care Unit Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-blue-400">{s.patientId}</td>
                    <td className="p-3 font-mono text-slate-400">{s.id}</td>
                    <td className="p-3 font-bold text-white">{s.patient.expectedReadyTime}</td>
                    <td className="p-3">
                      <span className={`font-bold ${s.patient.status === 'READY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {s.patient.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{s.patient.delayReason || 'On schedule'}</td>
                    <td className="p-3 font-semibold text-blue-300">{s.patient.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="p-4 overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-3">Surgical Team Rosters & Readiness</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Theatre</th>
                  <th className="p-3">Assigned Team / Owner</th>
                  <th className="p-3">Expected Ready</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Delay Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">{s.theatre}</td>
                    <td className="p-3 font-semibold text-blue-300">{s.staff.owner}</td>
                    <td className="p-3 font-bold text-slate-200">{s.staff.expectedReadyTime}</td>
                    <td className="p-3 font-bold">{s.staff.status}</td>
                    <td className="p-3 text-slate-400">{s.staff.delayReason || 'Team prepped'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="p-4 overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-3">Biomedical Equipment Tracking Registry</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Theatre</th>
                  <th className="p-3">Equipment Unit Status</th>
                  <th className="p-3">Expected Ready</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Calibration / Delay Notes</th>
                  <th className="p-3">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">{s.theatre}</td>
                    <td className="p-3 text-slate-300">Smart Infusion & Surgical Tower</td>
                    <td className="p-3 font-bold text-slate-200">{s.equipment.expectedReadyTime}</td>
                    <td className="p-3 font-bold">{s.equipment.status}</td>
                    <td className="p-3 text-slate-400">{s.equipment.delayReason || 'Self-test passed'}</td>
                    <td className="p-3 font-semibold text-blue-300">{s.equipment.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'sterile' && (
          <div className="p-4 overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-3">Central Sterile Supply Trays</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Theatre</th>
                  <th className="p-3">Sterile Kit Tray</th>
                  <th className="p-3">Expected Delivery</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Autoclave Cycle Notes</th>
                  <th className="p-3">Sterile Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">{s.theatre}</td>
                    <td className="p-3 text-slate-300">{s.procedure} Pack</td>
                    <td className="p-3 font-bold text-slate-200">{s.sterileSupplies.expectedReadyTime}</td>
                    <td className="p-3 font-bold">{s.sterileSupplies.status}</td>
                    <td className="p-3 text-slate-400">{s.sterileSupplies.delayReason || 'Sterilizer verified'}</td>
                    <td className="p-3 font-semibold text-blue-300">{s.sterileSupplies.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
