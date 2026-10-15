import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Wrench,
  Fuel,
  Receipt,
  Lightbulb,
  Settings as SettingsIcon,
  X,
  Gauge
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ isOpen, onClose }) {
  const { vehicles, activeAlertsCount } = useApp();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/garage',
      label: 'My Garage',
      icon: Car,
      badge: vehicles.length > 0 ? vehicles.length : null,
      badgeClass: 'bg-charcoal-700 text-slate-300'
    },
    {
      to: '/maintenance',
      label: 'Maintenance',
      icon: Wrench,
      badge: activeAlertsCount > 0 ? activeAlertsCount : null,
      badgeClass: 'bg-rose-500 text-white animate-pulse'
    },
    {
      to: '/fuel-calculator',
      label: 'Fuel Calculator',
      icon: Fuel,
      badge: null
    },
    {
      to: '/expenses',
      label: 'Expenses',
      icon: Receipt,
      badge: null
    },
    {
      to: '/insights',
      label: 'Smart Insights',
      icon: Lightbulb,
      badge: 'Rules',
      badgeClass: 'bg-brand-cyan/20 text-brand-glow text-[10px]'
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: SettingsIcon,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-950 border-r border-charcoal-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-charcoal-800/80">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Gauge className="w-5 h-5 text-brand-glow transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">AutoCare</span>
                <span className="font-extrabold text-base tracking-tight text-brand-cyan">Hub</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">SMART VEHICLE COPILOT</p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-bold text-slate-300 tracking-wider">
            MAIN MENU
          </p>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-blue/15 text-brand-cyan border border-brand-blue/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-charcoal-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      item.badgeClass || 'bg-charcoal-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Tagline / Status Box */}
        <div className="p-4 m-4 rounded-xl bg-charcoal-900/60 border border-charcoal-800 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">Local Vault Active</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed italic">
            "Your Car. Your Care. Your Control."
          </p>
        </div>
      </aside>
    </>
  );
}
