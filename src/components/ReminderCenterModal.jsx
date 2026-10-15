import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2, AlertOctagon, Clock, Wrench, ShieldCheck } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatting';

export default function ReminderCenterModal() {
  const {
    isReminderModalOpen,
    setIsReminderModalOpen,
    overdueTasks,
    dueSoonTasks,
    upcomingTasks,
    markTaskCompleted
  } = useApp();

  if (!isReminderModalOpen) return null;

  const totalUrgent = overdueTasks.length + dueSoonTasks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-navy-900 border border-charcoal-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-charcoal-800 flex items-center justify-between bg-navy-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Service Reminder Center
                {totalUrgent > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                    {totalUrgent} urgent
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Proactive vehicle health monitoring and service alerts
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsReminderModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reminders List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {totalUrgent === 0 && upcomingTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-200">All Scheduled Care is Current!</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                You have no overdue or due-soon maintenance tasks right now.
              </p>
            </div>
          ) : (
            <>
              {/* Overdue Section */}
              {overdueTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      Overdue Tasks ({overdueTasks.length})
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {overdueTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{task.title}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {task.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            Vehicle: <span className="font-semibold text-slate-100">{task.vehicleName}</span>
                          </p>
                          <p className="text-xs text-rose-300 font-medium mt-0.5">
                            Reason: {task.reason}
                          </p>
                          {task.estimatedCost && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Est. Cost: {formatCurrency(task.estimatedCost)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => markTaskCompleted(task.id)}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Completed
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Soon Section */}
              {dueSoonTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5 mt-4">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Due Soon ({dueSoonTasks.length})
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {dueSoonTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{task.title}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {task.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            Vehicle: <span className="font-semibold text-slate-100">{task.vehicleName}</span>
                          </p>
                          <p className="text-xs text-amber-300 font-medium mt-0.5">
                            Reason: {task.reason}
                          </p>
                        </div>
                        <button
                          onClick={() => markTaskCompleted(task.id)}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Completed
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Summary */}
              {upcomingTasks.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Upcoming In Schedule ({upcomingTasks.length})
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-900/40 border border-charcoal-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>{upcomingTasks[0].title} for {upcomingTasks[0].vehicleName}</span>
                    <span className="text-slate-300">{formatDate(upcomingTasks[0].nextServiceDate)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-navy-950 border-t border-charcoal-800 flex items-center justify-between text-xs text-slate-400">
          <span>Reminders recalculate in real-time as service dates & odometers update.</span>
          <button
            onClick={() => setIsReminderModalOpen(false)}
            className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
