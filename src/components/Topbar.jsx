import React from 'react';
import { Menu, Bell, Sun, Moon, Sparkles, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Topbar({ onOpenSidebar, pageTitle, pageSubtitle }) {
  const {
    activeAlertsCount,
    settings,
    updateSettings,
    setIsReminderModalOpen,
    resetToDemo
  } = useApp();

  const toggleTheme = () => {
    updateSettings({
      theme: settings.theme === 'light' ? 'dark' : 'light'
    });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-8 bg-navy-950/80 backdrop-blur-md border-b border-charcoal-800">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-300 hover:text-white rounded-xl bg-charcoal-900 border border-charcoal-800 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Mode Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/50 border border-cyan-800/40 text-xs text-brand-glow">
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
          <span className="font-semibold">Demo Mode</span>
          <button
            onClick={resetToDemo}
            title="Reset to default hackathon demo records"
            className="ml-1 p-0.5 hover:text-white text-cyan-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-slate-300 hover:text-white hover:border-charcoal-700 transition-colors"
          title={`Switch to ${settings.theme === 'light' ? 'Dark' : 'Light'} theme`}
        >
          {settings.theme === 'light' ? (
            <Moon className="w-4 h-4 text-amber-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Notifications / Reminder Bell */}
        <button
          onClick={() => setIsReminderModalOpen(true)}
          className="relative p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-slate-300 hover:text-white hover:border-charcoal-700 transition-colors"
          title="Open Service Reminder Center"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* User Profile Placeholder */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-charcoal-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-bold flex items-center justify-center shadow-md shadow-blue-900/30 text-sm">
            CS
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-white leading-tight">Hackathon Driver</p>
            <p className="text-[10px] text-slate-400">Owner Vault</p>
          </div>
        </div>
      </div>
    </header>
  );
}
