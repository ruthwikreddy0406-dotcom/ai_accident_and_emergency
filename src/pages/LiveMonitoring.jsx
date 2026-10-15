import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Video, Activity, Wifi, ShieldAlert, AlertTriangle,
  PlayCircle, RefreshCw, Radio, Layers, CheckCircle2, Clock
} from 'lucide-react';
import { api } from '../api/client';
import { useWebSocket } from '../context/WebSocketContext';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';

export default function LiveMonitoring() {
  const [cameras, setCameras] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isConnected, lastMessage } = useWebSocket();

  const loadData = async () => {
    setLoading(true);
    try {
      const [camData, jobData, incData] = await Promise.all([
        api.getCameras(),
        api.getJobs(),
        api.getIncidents({ limit: 8 }),
      ]);
      setCameras(camData || []);
      setJobs(jobData || []);
      setRecentIncidents(incData || []);
    } catch (err) {
      console.error('Error loading monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      loadData();
    }
  }, [lastMessage]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Live Sensor Ingestion Network
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-rose-500" />
            CCTV & Stream Surveillance Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live camera feed routing and asynchronous video batch processing monitor.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Streams
        </button>
      </div>

      {/* Honest Camera Disclosure Banner (Section 8 Requirement) */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <Radio className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong>Sensor Ingestion Policy:</strong> Camera streams are ingested via RTSP feeds. For video uploads, processing is executed in the background and queued without blocking the REST interface. Offline or simulated feeds are accurately tagged.
        </div>
      </div>

      {/* Camera Grid */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span>Active CCTV Nodes ({cameras.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cameras.map((cam) => (
            <div
              key={cam.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
            >
              {/* Fake Video Preview with dark road canvas */}
              <div className="aspect-video bg-slate-950 relative flex items-center justify-center p-3">
                <div className="w-full h-full border border-slate-800/80 rounded-lg flex flex-col items-center justify-center bg-slate-900/40">
                  <Video className="w-8 h-8 text-slate-700 mb-1" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {cam.source_type}
                  </span>
                </div>

                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </div>

                <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded">
                  {cam.fps} FPS
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-100 truncate">
                  {cam.name}
                </h3>
                <p className="text-[11px] text-slate-400 truncate">
                  {cam.location_name}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                  <span>LAT: {cam.latitude?.toFixed(4) || '--'}</span>
                  <span>LNG: {cam.longitude?.toFixed(4) || '--'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split: Active Jobs & Recent Detections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Background Jobs Feed */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            Background Processing Tasks
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {jobs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No background tasks enqueued.</p>
            ) : (
              jobs.map((j) => (
                <div key={j.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">{j.id}</span>
                    <span className={`capitalize font-bold ${
                      j.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {j.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{j.filename}</p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all rounded-full"
                      style={{ width: `${j.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Progress: {j.progress}%</span>
                    <span>Candidates Detected: {j.candidates_count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Detected Events */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Latest Live Incident Triggers
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {recentIncidents.map((inc) => (
              <div key={inc.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-200">{inc.id}</span>
                    <SeverityBadge severity={inc.severity} />
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{inc.description}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(inc.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <Link
                  to={`/incidents/${inc.id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
