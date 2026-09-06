import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  trend?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
  onClick
}) => {
  const variantStyles = {
    blue: 'border-blue-500/20 bg-gradient-to-br from-blue-900/30 to-slate-900 text-blue-400',
    emerald: 'border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-slate-900 text-emerald-400',
    amber: 'border-amber-500/20 bg-gradient-to-br from-amber-900/30 to-slate-900 text-amber-400',
    rose: 'border-rose-500/20 bg-gradient-to-br from-rose-900/30 to-slate-900 text-rose-400',
    purple: 'border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-slate-900 text-purple-400',
    slate: 'border-slate-700/50 bg-slate-800/60 text-slate-300'
  };

  const iconBgStyles = {
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    slate: 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${variantStyles[variant]} ${
        onClick ? 'cursor-pointer hover:border-blue-400/40 hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`rounded-lg p-2 ${iconBgStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {trend && <span className="text-xs font-medium text-emerald-400">{trend}</span>}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400 truncate">{subtitle}</p>}
    </div>
  );
};
