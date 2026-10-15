import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Video, Film, AlertTriangle, Map,
  Ambulance, BarChart3, Camera, Bell, Settings,
  ChevronLeft, ChevronRight, Presentation, ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/monitoring', label: 'Live Monitoring', icon: Video },
    { to: '/video-analysis', label: 'Video Analysis Studio', icon: Film, badge: 'AI' },
    { to: '/incidents', label: 'Incident Registry', icon: AlertTriangle },
    { to: '/map', label: 'Interactive GIS Map', icon: Map },
    { to: '/response', label: 'Response Coordination', icon: Ambulance, badge: 'Workflow' },
    { to: '/analytics', label: 'Analytics & Models', icon: BarChart3 },
    { to: '/cameras', label: 'Camera Network', icon: Camera },
    { to: '/notifications', label: 'Notification Center', icon: Bell },
    { to: '/presentation', label: 'Hackathon Presentation', icon: Presentation, badge: 'Demo' },
    { to: '/settings', label: 'Settings & Architecture', icon: Settings },
  ];

  return (
    <aside
      className={`h-[calc(100vh-4rem)] bg-slate-900/60 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 sticky top-16 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          {!collapsed ? 'Command Center' : 'Menu'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && (
                <span className="flex-1 truncate tracking-tight">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Safety Notice & Collapse Toggle */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {!collapsed && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-tight">
              AI detections are probabilistic predictions. Human verification required before emergency actions.
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
