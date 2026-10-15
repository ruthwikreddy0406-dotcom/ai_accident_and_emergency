import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';

export default function LiveAlertBanner() {
  const { liveAlerts, dismissAlert } = useWebSocket();
  const navigate = useNavigate();

  if (!liveAlerts || liveAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {liveAlerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto bg-slate-900 border-2 border-rose-500/80 rounded-xl p-4 shadow-2xl shadow-rose-950/50 backdrop-blur-md animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                  Live Collision Alert
                </span>
                <span className="text-[10px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded">
                  {alert.severity}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
                {alert.incident_id}
              </h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                {alert.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    dismissAlert(alert.id);
                    navigate(`/incidents/${alert.incident_id}`);
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-900/30"
                >
                  Review Evidence <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
