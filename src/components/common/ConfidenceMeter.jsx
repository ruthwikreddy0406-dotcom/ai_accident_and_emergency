import React from 'react';

export default function ConfidenceMeter({ score, showLabel = true, className = '' }) {
  const percent = Math.min(100, Math.max(0, Math.round((score || 0) * 100)));

  let barColor = 'bg-sky-500';
  let textColor = 'text-sky-400';

  if (percent >= 75) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-400';
  } else if (percent >= 50) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-400';
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Candidate Score</span>
          <span className={`font-mono font-bold ${textColor}`}>{percent}%</span>
        </div>
      )}
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
