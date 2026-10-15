import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, Search, Filter, RefreshCw, Eye,
  CheckCircle2, XCircle, ArrowUpRight, Download
} from 'lucide-react';
import { api } from '../api/client';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';
import ConfidenceMeter from '../components/common/ConfidenceMeter';

export default function IncidentList() {
  const [searchParams] = useSearchParams();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await api.getIncidents({ limit: 100 });
      setIncidents(data || []);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filtered = incidents.filter((inc) => {
    if (severityFilter && inc.severity !== severityFilter) return false;
    if (statusFilter && inc.workflow_status !== statusFilter) return false;
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            Incident Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete database of candidate collisions, verified accidents, and false positive audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.getExportCsvUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <button
            onClick={fetchIncidents}
            className="px-3.5 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident ID, road, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Severities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="DETECTED">Detected</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="FALSE_POSITIVE">False Positive</option>
            <option value="RESPONSE_REQUESTED">Response Requested</option>
            <option value="RESPONSE_ACKNOWLEDGED">Response Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-4">Incident ID</th>
                <th className="p-4">Timestamp & Location</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Workflow Status</th>
                <th className="p-4">Candidate Score</th>
                <th className="p-4">Vehicles</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No incidents found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="p-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{inc.id}</span>
                        {inc.is_demo && (
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-sans">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-200">
                        {inc.location_description || (
                          <span className="text-slate-500 italic">Location unavailable</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {new Date(inc.timestamp).toLocaleString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <SeverityBadge severity={inc.severity} />
                    </td>

                    <td className="p-4">
                      <StatusBadge status={inc.workflow_status} />
                    </td>

                    <td className="p-4">
                      <ConfidenceMeter score={inc.candidate_score} className="w-28" />
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {inc.vehicle_types && inc.vehicle_types.length > 0 ? (
                          inc.vehicle_types.map((v, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase font-mono"
                            >
                              {v}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">car</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-rose-600 group-hover:text-white text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                      >
                        Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
