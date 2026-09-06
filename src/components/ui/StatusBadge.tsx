import React from 'react';
import type { ResourceStatus, SessionStatus, AlertPriority, AlertStatus } from '../../types';
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert, Clock, Check } from 'lucide-react';

interface StatusBadgeProps {
  status: ResourceStatus | SessionStatus | AlertPriority | AlertStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const upper = (status || '').toUpperCase();

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-300';
  let IconComponent = Clock;

  if (upper === 'READY' || upper === 'RESOLVED') {
    bgClass = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
    IconComponent = CheckCircle2;
  } else if (upper === 'AT_RISK' || upper === 'WARNING' || upper === 'IN_PROGRESS') {
    bgClass = 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
    IconComponent = AlertTriangle;
  } else if (upper === 'DELAYED' || upper === 'URGENT' || upper === 'OPEN') {
    bgClass = 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400';
    IconComponent = AlertCircle;
  } else if (upper === 'ESCALATED') {
    bgClass = 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 animate-pulse';
    IconComponent = ShieldAlert;
  } else if (upper === 'NORMAL') {
    bgClass = 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400';
    IconComponent = Check;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1 font-medium',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-semibold',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-bold'
  };

  const formattedText = upper.replace('_', ' ');

  return (
    <span className={`inline-flex items-center rounded-full border ${bgClass} ${sizeClasses[size]} tracking-wide`}>
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{formattedText}</span>
    </span>
  );
};
