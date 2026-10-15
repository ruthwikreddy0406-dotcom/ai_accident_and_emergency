import React from 'react';
import { Car, Gauge, Fuel, Calendar, Edit3, Trash2, Shield } from 'lucide-react';
import { formatDistance, formatMileage, formatDate } from '../utils/formatting';

export default function VehicleCard({ vehicle, onEdit, onDelete }) {
  const fuelBadgeColors = {
    Petrol: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Diesel: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    CNG: 'bg-cyan-500/15 text-brand-glow border-cyan-500/30',
    Electric: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    Hybrid: 'bg-teal-500/15 text-teal-400 border-teal-500/30'
  };

  return (
    <div className="bg-navy-900 border border-charcoal-800 rounded-2xl p-5 shadow-xl hover:border-charcoal-700 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-charcoal-800 text-brand-cyan border border-charcoal-700 group-hover:bg-brand-blue/15 group-hover:text-brand-glow transition-colors">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  {vehicle.nickname || `${vehicle.manufacturer} ${vehicle.model}`}
                </h3>
                {vehicle.isDemo && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                    Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {vehicle.manufacturer} {vehicle.model} • {vehicle.year}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              fuelBadgeColors[vehicle.fuelType] || fuelBadgeColors.Petrol
            }`}
          >
            {vehicle.fuelType}
          </span>
        </div>

        {/* Vehicle Specs Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          <div className="p-3 rounded-xl bg-charcoal-900/60 border border-charcoal-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Gauge className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Odometer</span>
            </div>
            <p className="text-sm font-bold text-slate-100">
              {formatDistance(vehicle.currentOdometer)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900/60 border border-charcoal-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Fuel className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Avg Mileage</span>
            </div>
            <p className="text-sm font-bold text-slate-100">
              {formatMileage(vehicle.averageMileage)}
            </p>
          </div>
        </div>

        {/* Extra details (Registration & Last Service) */}
        <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-charcoal-800/60">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" /> Reg Number
            </span>
            <span className="font-mono text-slate-200 uppercase">
              {vehicle.registrationNumber || 'Not provided'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Last Service
            </span>
            <span className="text-slate-200">
              {formatDate(vehicle.lastServiceDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-charcoal-800/80">
        <button
          onClick={() => onEdit(vehicle)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-charcoal-800 hover:bg-charcoal-700 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete(vehicle)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
