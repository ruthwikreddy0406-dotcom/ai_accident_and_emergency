import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'neutral',
  onClick
}) {
  const badgeColors = {
    positive: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    info: 'bg-cyan-500/15 text-brand-glow border-cyan-500/30',
    neutral: 'bg-charcoal-700/50 text-slate-300 border-charcoal-600'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-navy-900/80 border border-charcoal-800 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-200 hover:border-charcoal-700 ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-brand-blue/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-charcoal-800/80 text-brand-cyan border border-charcoal-700">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{value}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {subtitle && <p className="text-xs text-slate-400 leading-snug">{subtitle}</p>}
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColors[badgeType] || badgeColors.neutral}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
