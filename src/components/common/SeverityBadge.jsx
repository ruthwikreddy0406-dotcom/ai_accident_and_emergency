import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function SeverityBadge({ severity, className = '' }) {
  const s = (severity || 'MEDIUM').toUpperCase();

  if (s === 'HIGH') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <AlertTriangle className="w-3.5 h-3.5" />
        HIGH PRIORITY
      </span>
    );
  }

  if (s === 'MEDIUM') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <AlertCircle className="w-3.5 h-3.5" />
        MEDIUM PRIORITY
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
      <Info className="w-3.5 h-3.5" />
      LOW PRIORITY
    </span>
  );
}
