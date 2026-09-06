import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_USERS } from '../../data/mockData';
import { Activity, Lock, Mail, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(email, password);
    if (!success) {
      setError('Invalid demo email or password. Please use one of the demo credentials below.');
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    login(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 px-4 text-slate-100 font-sans antialiased">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-xl shadow-blue-600/30 ring-1 ring-blue-400/30">
            <Activity className="h-8 w-8 text-white" />
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <h1 className="text-2xl font-black tracking-tight text-white">OR ReadySync</h1>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
              DEMO / MOCK DATA
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Operating Room Readiness Synchronization & Avoidable Idle Time Reduction
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white">Operations Demo Authentication</h2>
            <p className="text-[11px] text-slate-400">Sign in to access facility theatre readiness controls.</p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@orreadysync.demo"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] hover:from-blue-500 hover:to-indigo-500 active:scale-95"
            >
              <span>SIGN IN TO DASHBOARD</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              ⚡ One-Click Quick Fill Demo Accounts:
            </span>

            <div className="space-y-1.5">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.email}
                  onClick={() => fillDemoAccount(user.email, user.password)}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-left text-xs transition-colors hover:border-blue-500/40 hover:bg-slate-800/80"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 font-bold text-[10px]">
                      {user.initials}
                    </div>
                    <div>
                      <p className="font-bold text-white leading-none">{user.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{user.role}</p>
                    </div>
                  </div>
                  <UserCheck className="h-4 w-4 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>This prototype uses fictional demo data for demonstration purposes only.</p>
          <p>No real patient records, medical systems, or paid APIs are utilized.</p>
        </div>
      </div>
    </div>
  );
};
