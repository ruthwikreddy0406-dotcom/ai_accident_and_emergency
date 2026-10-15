import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, MapPin, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SeverityBadge from '../common/SeverityBadge';
import StatusBadge from '../common/StatusBadge';

// Helper to center map dynamically
function MapCenterController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

// Custom colored SVG pin markers for Leaflet
function createColoredIcon(severity) {
  const color = severity === 'HIGH' ? '#f43f5e' : severity === 'MEDIUM' ? '#f59e0b' : '#38bdf8';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="42">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="${color}" stroke="#0f172a" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#ffffff" />
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  });
}

export default function IncidentMap({ incidents = [], selectedIncidentId = null, onSelectIncident }) {
  // Separate incidents with valid coordinates vs unavailable coordinates
  const mappedIncidents = incidents.filter(
    (inc) => typeof inc.latitude === 'number' && typeof inc.longitude === 'number'
  );
  const unmappedIncidents = incidents.filter(
    (inc) => inc.latitude == null || inc.longitude == null
  );

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);
  const mapCenter = selectedIncident?.latitude && selectedIncident?.longitude
    ? [selectedIncident.latitude, selectedIncident.longitude]
    : mappedIncidents.length > 0
    ? [mappedIncidents[0].latitude, mappedIncidents[0].longitude]
    : [37.7749, -122.4194]; // Default SF bay area center

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[620px] w-full">
      {/* Map Canvas */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative h-full">
        {/* Simulation Watermark Banner */}
        <div className="absolute top-3 left-12 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>OpenStreetMap GIS Feed | Verified Coordinates Only</span>
        </div>

        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterController center={mapCenter} zoom={13} />

          {mappedIncidents.map((incident) => (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
              icon={createColoredIcon(incident.severity)}
              eventHandlers={{
                click: () => onSelectIncident && onSelectIncident(incident.id),
              }}
            >
              <Popup>
                <div className="w-64 p-1">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {incident.id}
                    </span>
                    <SeverityBadge severity={incident.severity} />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100 mb-1">
                    {incident.location_description || 'Camera Location'}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 mb-2">
                    {incident.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      Inspect <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Side Panel: Unmapped & Coordinate Fallback Section (Section 9 Requirement) */}
      <div className="w-full lg:w-80 flex flex-col gap-3 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            Location Registry
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {mappedIncidents.length} on map
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          In compliance with safety requirements, only incidents with verified GPS telemetry appear as map pins.
        </p>

        {unmappedIncidents.length > 0 && (
          <div className="mt-2 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Location Unavailable ({unmappedIncidents.length})</span>
            </div>
            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {unmappedIncidents.map((unmapped) => (
                <div
                  key={unmapped.id}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {unmapped.id}
                    </span>
                    <SeverityBadge severity={unmapped.severity} />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {unmapped.description}
                  </p>
                  <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>GPS Telemetry Missing</span>
                    <Link
                      to={`/incidents/${unmapped.id}`}
                      className="text-rose-400 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
