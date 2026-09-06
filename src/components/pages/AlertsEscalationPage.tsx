import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import type { AlertPriority, AlertStatus, OperationalAlert } from '../../types';
import { 
  BellRing, 
  CheckCircle2, 
  MessageSquare, 
  ArrowUpRight,
  Check,
  Plus,
  X
} from 'lucide-react';

export const AlertsEscalationPage: React.FC = () => {
  const { alerts, sessions, updateAlert, addAlertNote, resolveAlert, navigateToSynchronizerForSession } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL_OPEN');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const [newAlertSessionId, setNewAlertSessionId] = useState<string>(sessions[0]?.id || 'SES-101');
  const [newAlertIssue, setNewAlertIssue] = useState<string>('');
  const [newAlertPriority, setNewAlertPriority] = useState<AlertPriority>('URGENT');
  const [newAlertOwner, setNewAlertOwner] = useState<string>('Equipment Coordinator');

  const filteredAlerts = alerts.filter(a => {
    if (filterStatus === 'ALL_OPEN') return a.status !== 'RESOLVED';
    if (filterStatus === 'RESOLVED') return a.status === 'RESOLVED';
    if (filterStatus === 'URGENT') return (a.priority === 'URGENT' || a.priority === 'ESCALATED') && a.status !== 'RESOLVED';
    return true;
  });

  const selectedAlert = alerts.find(a => a.id === selectedAlertId);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertId || !newNoteText.trim()) return;
    addAlertNote(selectedAlertId, newNoteText, 'Dr. Sarah Jenkins (OR Director)');
    setNewNoteText('');
  };

  const handleOwnerChange = (alertId: string, newOwner: string) => {
    if (!newOwner.trim()) return;
    updateAlert(alertId, { owner: newOwner });
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertIssue.trim()) return;

    const targetSession = sessions.find(s => s.id === newAlertSessionId) || sessions[0];
    const createdAlert: OperationalAlert = {
      id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
      sessionId: targetSession.id,
      theatre: targetSession.theatre,
      facility: targetSession.facility,
      issue: newAlertIssue.trim(),
      priority: newAlertPriority,
      owner: newAlertOwner,
      dueTime: targetSession.scheduledStart,
      status: 'OPEN',
      createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      followUpNotes: [
        {
          id: `NOTE-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Alert manually created by OR Director.',
          author: 'Dr. Sarah Jenkins'
        }
      ]
    };

    alerts.unshift(createdAlert);
    setSelectedAlertId(createdAlert.id);
    setIsCreateModalOpen(false);
    setNewAlertIssue('');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Alerts & Escalation Center</h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitor and resolve operational readiness bottlenecks before they cause idle room minutes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Alert</span>
          </button>

          <button
            onClick={() => setFilterStatus('ALL_OPEN')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
              filterStatus === 'ALL_OPEN'
                ? 'bg-blue-600 text-white'
                : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Open Alerts ({alerts.filter(a => a.status !== 'RESOLVED').length})
          </button>
          <button
            onClick={() => setFilterStatus('URGENT')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
              filterStatus === 'URGENT'
                ? 'bg-rose-600 text-white'
                : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Urgent / Escalated ({alerts.filter(a => (a.priority === 'URGENT' || a.priority === 'ESCALATED') && a.status !== 'RESOLVED').length})
          </button>
          <button
            onClick={() => setFilterStatus('RESOLVED')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
              filterStatus === 'RESOLVED'
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Resolved ({alerts.filter(a => a.status === 'RESOLVED').length})
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
            <div className="border-b border-slate-800 p-4">
              <h3 className="text-sm font-bold text-white">Active Operational Alerts Queue</h3>
            </div>

            <div className="divide-y divide-slate-800">
              {filteredAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 opacity-60 mb-2" />
                  <p className="text-sm font-semibold">No active alerts matching this filter.</p>
                </div>
              ) : (
                filteredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    className={`p-4 transition-colors cursor-pointer hover:bg-slate-800/40 ${
                      selectedAlertId === alert.id ? 'bg-slate-800/80 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-400">{alert.id}</span>
                        <span className="text-xs font-bold text-white">{alert.theatre}</span>
                        <span className="text-[10px] text-slate-400">({alert.facility})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={alert.priority} size="sm" />
                        <StatusBadge status={alert.status} size="sm" />
                      </div>
                    </div>

                    <p className="mt-2 text-xs font-medium text-slate-200">{alert.issue}</p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>Owner: <strong className="text-slate-300">{alert.owner}</strong></span>
                        <span>Due: <strong className="text-slate-300">{alert.dueTime}</strong></span>
                      </div>

                      {alert.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resolveAlert(alert.id);
                          }}
                          className="flex items-center gap-1 rounded-md bg-emerald-600/20 px-2.5 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          <span>Resolve Alert</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selectedAlert ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 font-bold">{selectedAlert.id}</span>
                  <h3 className="text-base font-extrabold text-white">{selectedAlert.theatre} Action Control</h3>
                </div>
                <button
                  onClick={() => navigateToSynchronizerForSession(selectedAlert.sessionId)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:underline"
                >
                  <span>Sync View</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Change Priority:</label>
                  <div className="mt-1.5 flex gap-1.5">
                    {(['NORMAL', 'WARNING', 'URGENT', 'ESCALATED'] as AlertPriority[]).map(p => (
                      <button
                        key={p}
                        onClick={() => updateAlert(selectedAlert.id, { priority: p })}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-colors ${
                          selectedAlert.priority === p
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Update Status:</label>
                  <div className="mt-1.5 flex gap-1.5">
                    {(['OPEN', 'IN_PROGRESS', 'RESOLVED'] as AlertStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          if (s === 'RESOLVED') resolveAlert(selectedAlert.id);
                          else updateAlert(selectedAlert.id, { status: s });
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-colors ${
                          selectedAlert.status === s
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Owner:</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      defaultValue={selectedAlert.owner}
                      onBlur={(e) => handleOwnerChange(selectedAlert.id, e.target.value)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                  <span>Follow-Up Audit Notes ({selectedAlert.followUpNotes.length})</span>
                </h4>

                <div className="mt-2 max-h-40 overflow-y-auto space-y-2 text-xs scrollbar-thin">
                  {selectedAlert.followUpNotes.map(n => (
                    <div key={n.id} className="rounded-lg bg-slate-950/60 p-2 border border-slate-800">
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                        <span>{n.author}</span>
                        <span>{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-slate-300">{n.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add operational note..."
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-500">
              <BellRing className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              <p className="text-xs font-medium">Select an alert from the left list to inspect details or assign ownership.</p>
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Custom Operational Alert</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold">Select Session:</label>
                <select
                  value={newAlertSessionId}
                  onChange={(e) => setNewAlertSessionId(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id} — {s.theatre} ({s.procedure})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Issue Description:</label>
                <input
                  type="text"
                  required
                  value={newAlertIssue}
                  onChange={(e) => setNewAlertIssue(e.target.value)}
                  placeholder="e.g. Anaesthesia cart delayed turnover..."
                  className="w-full mt-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Priority Level:</label>
                <select
                  value={newAlertPriority}
                  onChange={(e) => setNewAlertPriority(e.target.value as AlertPriority)}
                  className="w-full mt-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="WARNING">WARNING</option>
                  <option value="URGENT">URGENT</option>
                  <option value="ESCALATED">ESCALATED</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Assigned Owner:</label>
                <input
                  type="text"
                  value={newAlertOwner}
                  onChange={(e) => setNewAlertOwner(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
                >
                  Dispatch Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
