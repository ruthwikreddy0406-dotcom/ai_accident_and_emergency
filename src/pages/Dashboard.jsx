import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Clock, CheckCircle2, ShieldAlert,
  TrendingUp, Video, Filter, ArrowUpRight, RefreshCw,
  Search, Eye, AlertCircle, PlayCircle
} from 'lucide-react';
import { api } from '../api/client';
import { useWebSocket } from '../context/WebSocketContext';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';
import ConfidenceMeter from '../components/common/ConfidenceMeter';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { lastMessage } = useWebSocket();

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpiData, incData] = await Promise.all([
        api.getKPIs(),
        api.getIncidents({ limit: 15 }),
      ]);
      setKpis(kpiData);
      setIncidents(incData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when a WebSocket event occurs
  useEffect(() => {
    if (lastMessage && ['INCIDENT_DETECTED', 'INCIDENT_VERIFIED', 'STATUS_UPDATED'].includes(lastMessage.type)) {
      loadData();
    }
  }, [lastMessage]);

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity && inc.severity !== filterSeverity) return false;
    if (filterStatus && inc.workflow_status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchId = inc.id.toLowerCase().includes(term);
      const matchDesc = (inc.description || '').toLowerCase().includes(term);
      const matchLoc = (inc.location_description || '').toLowerCase().includes(term);
      if (!matchId && !matchDesc && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / System Notification */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl -z-10" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Live Command Center Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            RoadGuard AI Monitoring Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time computer vision collision candidate analysis with explainable multi-signal heuristics and human-verified emergency triage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/video-analysis"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all hover:scale-105"
          >
            <PlayCircle className="w-4 h-4" />
            Upload Video / Studio
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid (Section 8 Requirement) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Detected */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Candidates</span>
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono">
              {kpis?.total_candidates ?? '--'}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">Seeded & Ingested</p>
          </div>
        </div>

        {/* Awaiting Review */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Awaiting Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {kpis?.awaiting_review ?? '--'}
            </span>
            <p className="text-[10px] text-amber-500/80 mt-0.5">Pending Operator Action</p>
          </div>
        </div>

        {/* Human Verified */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Human Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {kpis?.human_verified ?? '--'}
            </span>
            <p className="text-[10px] text-emerald-500/80 mt-0.5">Confirmed Accidents</p>
          </div>
        </div>

        {/* High Priority */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-rose-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">High Priority</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-400 font-mono">
              {kpis?.high_priority ?? '--'}
            </span>
            <p className="text-[10px] text-rose-500/80 mt-0.5">Urgent Triage Needed</p>
          </div>
        </div>

        {/* False Positive Rate (With Sample Size) */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">False Positive Rate</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-300 font-mono">
              {kpis ? `${kpis.false_positive_rate}%` : '--'}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Sample: {kpis?.reviewed_sample_size ?? 0} reviewed
            </p>
          </div>
        </div>

        {/* Avg Review Time */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Avg Review Time</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-300 font-mono">
              {kpis?.average_review_time_minutes ?? '--'}m
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">Target &lt; 5.0m</p>
          </div>
        </div>
      </div>

      {/* Main Content: Live Feed & Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incident Feed */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Live Incident Detection Feed
              </h2>
              <p className="text-xs text-slate-400">
                Sorted by most recent temporal event detection
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="">All Severities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="DETECTED">Detected</option>
                <option value="NEEDS_REVIEW">Needs Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="RESPONSE_REQUESTED">Response Requested</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {/* Incidents List Cards */}
          <div className="divide-y divide-slate-800/80 mt-2 flex-1 overflow-y-auto max-h-[500px]">
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No incidents matching active filters.
              </div>
            ) : (
              filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-3 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Thumbnail preview if available */}
                    <div className="w-16 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                      {inc.evidence_items && inc.evidence_items.length > 0 ? (
                        <img
                          src={api.getEvidenceImageUrl(inc.evidence_items[0].file_path)}
                          alt="Evidence"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>NO SNAP</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-white">
                          {inc.id}
                        </span>
                        <SeverityBadge severity={inc.severity} />
                        <StatusBadge status={inc.workflow_status} />
                        {inc.is_demo && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                            DEMO
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                        {inc.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>{inc.location_description || 'Location unavailable'}</span>
                        <span>•</span>
                        <span className="font-mono">
                          {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <ConfidenceMeter score={inc.candidate_score} className="w-24" />
                    <Link
                      to={`/incidents/${inc.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <Link
              to="/incidents"
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold inline-flex items-center gap-1"
            >
              View Full Incident Registry &rarr;
            </Link>
          </div>
        </div>

        {/* Right Col: Monitoring Health & Quick Actions */}
        <div className="space-y-6">
          {/* Real-time System Status */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Subsystem Operations
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-300">FastAPI Engine</span>
                <span className="text-emerald-400 font-mono font-semibold">ONLINE (v1.0.0)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-300">Computer Vision Inference</span>
                <span className="text-emerald-400 font-mono font-semibold">ACTIVE (Motion/YOLO)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-300">Database Connection</span>
                <span className="text-emerald-400 font-mono font-semibold">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-300">Emergency Dispatch</span>
                <span className="text-amber-400 font-mono font-semibold">SIMULATED (Safe)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
              <strong>Safety Standard:</strong> Emergency response integrations run in simulated sandbox mode. No real emergency services are contacted without verified manual operator authorization.
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/video-analysis"
                className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <span>Upload Video for AI Analysis</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/map"
                className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <span>Open Interactive GIS Incident Map</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/response"
                className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <span>Emergency Response Coordinator</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/analytics"
                className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <span>Model Evaluation & Metrics</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
