import React from 'react';
import { Clock, CheckCircle2, XCircle, Send, CheckCheck, Archive } from 'lucide-react';

export default function StatusBadge({ status, className = '' }) {
  const st = (status || 'DETECTED').toUpperCase();

  const config = {
    DETECTED: {
      label: 'DETECTED',
      icon: Clock,
      style: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    },
    NEEDS_REVIEW: {
      label: 'NEEDS REVIEW',
      icon: Clock,
      style: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    VERIFIED: {
      label: 'HUMAN VERIFIED',
      icon: CheckCircle2,
      style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    FALSE_POSITIVE: {
      label: 'FALSE POSITIVE',
      icon: XCircle,
      style: 'bg-slate-700/40 text-slate-400 border-slate-600/40',
    },
    RESPONSE_REQUESTED: {
      label: 'RESPONSE REQUESTED',
      icon: Send,
      style: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    },
    RESPONSE_ACKNOWLEDGED: {
      label: 'ACKNOWLEDGED',
      icon: CheckCheck,
      style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    },
    RESOLVED: {
      label: 'RESOLVED',
      icon: CheckCircle2,
      style: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    },
    CLOSED: {
      label: 'CLOSED',
      icon: Archive,
      style: 'bg-slate-800 text-slate-500 border-slate-700',
    },
  };

  const item = config[st] || config.DETECTED;
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${item.style} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {item.label}
    </span>
  );
}
