import React, { useState, useEffect } from 'react';
import { Camera, Plus, Video, MapPin, Activity, RefreshCw } from 'lucide-react';
import { api } from '../api/client';

export default function Cameras() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCam, setNewCam] = useState({
    name: '',
    location_name: '',
    latitude: '',
    longitude: '',
    stream_url: '',
    source_type: 'cctv_feed',
    fps: 30.0,
  });

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const data = await api.getCameras();
      setCameras(data || []);
    } catch (err) {
      console.error('Error fetching cameras:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createCamera({
        ...newCam,
        latitude: newCam.latitude ? parseFloat(newCam.latitude) : null,
        longitude: newCam.longitude ? parseFloat(newCam.longitude) : null,
        fps: parseFloat(newCam.fps) || 30.0,
      });
      setShowAddModal(false);
      setNewCam({
        name: '',
        location_name: '',
        latitude: '',
        longitude: '',
        stream_url: '',
        source_type: 'cctv_feed',
        fps: 30.0,
      });
      fetchCameras();
    } catch (err) {
      alert(`Error creating camera: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-rose-500" />
            CCTV & Sensor Camera Network
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered road surveillance nodes, RTSP streaming endpoints, and GIS coordinates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register Camera Node
          </button>
          <button
            onClick={fetchCameras}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameras.map((cam) => (
          <div
            key={cam.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-400">
                NODE #{cam.id}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{cam.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {cam.location_name}
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <span className="text-slate-200">
                  {cam.latitude ? `${cam.latitude.toFixed(4)}, ${cam.longitude.toFixed(4)}` : 'Location unavailable'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Frame Rate:</span>
                <span className="text-slate-200">{cam.fps} FPS</span>
              </div>
              <div className="flex justify-between">
                <span>Protocol:</span>
                <span className="text-slate-200 uppercase">{cam.source_type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">Register Camera Node</h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Camera Name</label>
              <input
                required
                type="text"
                placeholder="E.g., CCTV-205 (Highway Overpass)"
                value={newCam.name}
                onChange={(e) => setNewCam({ ...newCam, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Location Description</label>
              <input
                required
                type="text"
                placeholder="E.g., Route 101 Northbound & 9th St"
                value={newCam.location_name}
                onChange={(e) => setNewCam({ ...newCam, location_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="37.7749"
                  value={newCam.latitude}
                  onChange={(e) => setNewCam({ ...newCam, latitude: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="-122.4194"
                  value={newCam.longitude}
                  onChange={(e) => setNewCam({ ...newCam, longitude: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-400 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
              >
                Register Node
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
