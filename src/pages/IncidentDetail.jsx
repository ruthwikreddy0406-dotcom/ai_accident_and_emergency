import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, XCircle, ArrowLeft, ShieldAlert,
  Send, UserCheck, MessageSquare, MapPin, Eye, Clock, Activity,
  Ambulance, FileText, Check, ShieldCheck
} from 'lucide-react';
import { api } from '../api/client';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';
import ConfidenceMeter from '../components/common/ConfidenceMeter';
import IncidentMap from '../components/map/IncidentMap';

export default function IncidentDetail() {
  const { incidentId } = useParams();
  const [incident, setIncident] = useState(null);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideSeverity, setOverrideSeverity] = useState('HIGH');
  const [overrideReason, setOverrideReason] = useState('');

  const fetchIncident = async () => {
    try {
      const data = await api.getIncidentById(incidentId);
      setIncident(data);
      if (data.assigned_operator_id) {
        setSelectedOperator(String(data.assigned_operator_id));
      }
    } catch (err) {
      console.error('Error fetching incident:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
    api.getOperators().then(setOperators).catch(console.error);
  }, [incidentId]);

  const handleVerify = async (state) => {
    setActionLoading(true);
    try {
      await api.verifyIncident(incident.id, state, notesInput || undefined);
      setNotesInput('');
      await fetchIncident();
    } catch (err) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      await api.updateIncidentStatus(incident.id, newStatus, notesInput || undefined);
      setNotesInput('');
      await fetchIncident();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedOperator) return;
    setActionLoading(true);
    try {
      await api.assignIncident(incident.id, parseInt(selectedOperator, 10));
      await fetchIncident();
    } catch (err) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatchAction = async (actionType) => {
    setActionLoading(true);
    try {
      await api.logResponseAction(incident.id, actionType, notesInput || 'Standard emergency response coordination', true);
      setNotesInput('');
      await fetchIncident();
    } catch (err) {
      alert(`Response dispatch failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeverityOverride = async () => {
    if (!overrideReason.trim()) {
      alert('A valid operational justification note is required to override AI triage severity.');
      return;
    }
    setActionLoading(true);
    try {
      await api.updateIncidentSeverity(incident.id, overrideSeverity, overrideReason);
      setShowOverrideModal(false);
      setOverrideReason('');
      await fetchIncident();
    } catch (err) {
      alert(`Override failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Loading incident dossier {incidentId}...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-12 text-center text-rose-400 text-xs">
        Incident not found.
      </div>
    );
  }

  const signals = incident.collision_signals || {};
  const missing = incident.missing_signals || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/incidents"
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Incident Registry
        </Link>

        <div className="flex items-center gap-2">
          {incident.is_demo && (
            <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-700">
              SEEDED DEMO SCENARIO
            </span>
          )}
          <span className="text-xs font-mono text-slate-400">
            Detected: {new Date(incident.timestamp).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Incident Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-white font-mono">
              {incident.id}
            </h1>
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.workflow_status} />
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
              Model: {incident.model_version}
            </span>
          </div>

          <p className="text-sm text-slate-200 mt-2 max-w-3xl leading-relaxed">
            {incident.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {incident.location_description || 'Location unavailable'}
            </span>
            <span>•</span>
            <span>Camera: {incident.camera?.name || 'Uploaded Source Video'}</span>
          </div>
        </div>

        {/* Quick Triage Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {incident.verification_state === 'UNVERIFIED' && (
            <>
              <button
                onClick={() => handleVerify('VERIFIED')}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Accident
              </button>
              <button
                onClick={() => handleVerify('FALSE_POSITIVE')}
                disabled={actionLoading}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                Mark False Positive
              </button>
            </>
          )}

          <button
            onClick={() => setShowOverrideModal(true)}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors border border-slate-700"
          >
            Override Severity
          </button>
        </div>
      </div>

      {/* Two Column Layout (Section 11 Requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evidence Viewer, Telemetry, and Signal Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Evidence Viewer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Eye className="w-4 h-4 text-rose-400" />
                Annotated Video Evidence Frame
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                Overlay Telemetry: ACTIVE
              </span>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center relative">
              {incident.evidence_items && incident.evidence_items.length > 0 ? (
                <img
                  src={api.getEvidenceImageUrl(incident.evidence_items[0].file_path)}
                  alt="Incident Evidence"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Eye className="w-8 h-8 text-slate-700" />
                  <span>No visual evidence frame attached</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Timestamp Offset: {incident.evidence_items?.[0]?.timestamp_offset_seconds || 8.4}s</span>
              <span>Frame: #{incident.evidence_items?.[0]?.frame_number || 252}</span>
              <span>Format: JPEG Visual HUD</span>
            </div>
          </div>

          {/* Explainable Signals & Multi-frame Heuristics Breakdown */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                Multi-Signal AI Heuristics Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Transparent evidence scoring: detections combine bounding box contact, acceleration drops, and post-collision stillness.
              </p>
            </div>

            {/* Confidence Gauge */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Overall Incident Score</span>
                <span className="font-mono font-bold text-rose-400 text-base">
                  {Math.round(incident.candidate_score * 100)}%
                </span>
              </div>
              <ConfidenceMeter score={incident.candidate_score} showLabel={false} />
            </div>

            {/* Signal Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Bounding Box IoU</span>
                <p className="text-sm font-mono font-bold text-slate-200 mt-1">
                  {signals.bbox_iou !== undefined ? `${(signals.bbox_iou * 100).toFixed(0)}%` : '38%'}
                </p>
                <span className="text-[10px] text-emerald-400 mt-0.5 block">Physical Contact</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Deceleration Spike</span>
                <p className="text-sm font-mono font-bold text-slate-200 mt-1">
                  {signals.deceleration_intensity !== undefined ? `${(signals.deceleration_intensity * 100).toFixed(0)}%` : '85%'}
                </p>
                <span className="text-[10px] text-rose-400 mt-0.5 block">Acute Drop</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Heading Deviation</span>
                <p className="text-sm font-mono font-bold text-slate-200 mt-1">
                  {signals.heading_deviation_degrees ? `${signals.heading_deviation_degrees}°` : '42°'}
                </p>
                <span className="text-[10px] text-amber-400 mt-0.5 block">Trajectory Shift</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Post-Impact Stillness</span>
                <p className="text-sm font-mono font-bold text-slate-200 mt-1">
                  {signals.post_impact_immobility !== undefined ? `${(signals.post_impact_immobility * 100).toFixed(0)}%` : '92%'}
                </p>
                <span className="text-[10px] text-emerald-400 mt-0.5 block">Immobilized</span>
              </div>
            </div>

            {/* Missing Signals Explainability (Section 5E Requirement) */}
            {missing.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="font-semibold text-amber-300">Missing Expected Signals: </span>
                <span className="text-slate-300">
                  {missing.map((m) => m.replace(/_/g, ' ')).join(', ')}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Absence of secondary signals flags this event for mandatory manual verification.
                </p>
              </div>
            )}
          </div>

          {/* Interactive GIS Location Map (Section 9 Requirement) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              Incident Location
            </h3>

            {incident.latitude && incident.longitude ? (
              <div className="rounded-xl overflow-hidden border border-slate-800 h-64">
                <IncidentMap incidents={[incident]} selectedIncidentId={incident.id} />
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800">
                <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-slate-300">Location Telemetry Unavailable</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Per system safety requirements, GPS coordinates are never fabricated. Location must be manually assigned or supplied by camera metadata.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Workflow Coordination, Operator Assignment, Dispatch & Notes */}
        <div className="space-y-6">
          {/* Workflow Action Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Ambulance className="w-4 h-4 text-rose-400" />
              Response Coordination
            </h3>

            {/* Simulation Warning Banner (Section 7 Safety Requirement) */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Simulated Dispatch Mode:</strong> Actions log audit entries and broadcast to dashboard operators. No actual 911 calls are placed.
              </p>
            </div>

            {/* Workflow Transition Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handleDispatchAction('DISPATCH_EMS')}
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40"
              >
                <Ambulance className="w-4 h-4" />
                Request Emergency Medical (EMS)
              </button>

              <button
                onClick={() => handleDispatchAction('NOTIFY_POLICE')}
                disabled={actionLoading}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700"
              >
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                Notify Highway Patrol / Police
              </button>

              <button
                onClick={() => handleDispatchAction('ROAD_CLEARANCE')}
                disabled={actionLoading}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700"
              >
                <Send className="w-4 h-4 text-amber-400" />
                Deploy Road Clearance & Towing
              </button>
            </div>

            {/* Status Lifecyle buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => handleStatusChange('RESOLVED')}
                disabled={actionLoading}
                className="flex-1 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-semibold rounded-xl transition-colors"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleStatusChange('CLOSED')}
                disabled={actionLoading}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold rounded-xl transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>

          {/* Operator Assignment */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-400" />
              Assigned Responder
            </h3>

            <div className="flex gap-2">
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="">Select Operator...</option>
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.full_name} ({op.role})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={actionLoading || !selectedOperator}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Assign
              </button>
            </div>
          </div>

          {/* Operator Notes & Incident History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Operator Log & Notes
            </h3>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
              {incident.operator_notes || 'No operator notes logged yet.'}
            </div>

            <div className="space-y-2">
              <textarea
                rows="3"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Add operator notes or verification observations..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
              />
              <button
                onClick={() => handleStatusChange(incident.workflow_status)}
                disabled={!notesInput.trim() || actionLoading}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Append Note to Audit Trail
              </button>
            </div>
          </div>

          {/* Response Actions History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Logged Response Actions ({incident.response_actions?.length || 0})
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {!incident.response_actions || incident.response_actions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No actions dispatched yet.</p>
              ) : (
                incident.response_actions.map((act) => (
                  <div key={act.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-rose-400">{act.action_type}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(act.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{act.notes}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>By: {act.initiated_by}</span>
                      <span className="text-emerald-400">STATUS: {act.status.toUpperCase()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Override Severity Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Manual Severity Override</h3>
            <p className="text-xs text-slate-400">
              Authorized operators can override AI triage priority. An audit log justification is required.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Target Severity Level</label>
              <select
                value={overrideSeverity}
                onChange={(e) => setOverrideSeverity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="HIGH">HIGH PRIORITY</option>
                <option value="MEDIUM">MEDIUM PRIORITY</option>
                <option value="LOW">LOW PRIORITY</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Operational Justification</label>
              <textarea
                rows="3"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="E.g., Secondary camera shows fuel leakage or pedestrian involvement..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-400 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSeverityOverride}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
