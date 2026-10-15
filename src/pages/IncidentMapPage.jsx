import React, { useState, useEffect } from 'react';
import { Map, Filter, RefreshCw, AlertTriangle, MapPin } from 'lucide-react';
import { api } from '../api/client';
import IncidentMap from '../components/map/IncidentMap';

export default function IncidentMapPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await api.getIncidents({ limit: 100 });
      setIncidents(data || []);
    } catch (err) {
      console.error('Error fetching map incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (severityFilter && inc.severity !== severityFilter) return false;
    if (statusFilter && inc.workflow_status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Map className="w-6 h-6 text-rose-500" />
            Interactive GIS Incident Map
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-world road camera coordinates mapped with OpenStreetMap tiles and severity telemetry.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Severities</option>
              <option value="HIGH">High Priority (Red)</option>
              <option value="MEDIUM">Medium Priority (Amber)</option>
              <option value="LOW">Low Priority (Blue)</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="DETECTED">Detected</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="RESPONSE_REQUESTED">Response Requested</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <button
            onClick={fetchIncidents}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Map View */}
      <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 shadow-2xl">
        <IncidentMap
          incidents={filteredIncidents}
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={(id) => setSelectedIncidentId(id)}
        />
      </div>
    </div>
  );
}
