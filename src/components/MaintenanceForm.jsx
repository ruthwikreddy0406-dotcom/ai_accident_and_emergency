import React, { useState, useEffect } from 'react';
import { X, Wrench, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MAINTENANCE_CATEGORIES } from '../utils/maintenance';
import { validateMaintenance } from '../utils/validation';

export default function MaintenanceForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const { vehicles } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    vehicleId: '',
    category: 'Engine oil',
    lastServiceDate: '',
    currentOdometer: '',
    nextServiceDate: '',
    nextServiceOdometer: '',
    estimatedCost: '',
    status: 'Upcoming',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        vehicleId: initialData.vehicleId || '',
        category: initialData.category || 'Engine oil',
        lastServiceDate: initialData.lastServiceDate || '',
        currentOdometer: initialData.currentOdometer ?? '',
        nextServiceDate: initialData.nextServiceDate || '',
        nextServiceOdometer: initialData.nextServiceOdometer ?? '',
        estimatedCost: initialData.estimatedCost ?? '',
        status: initialData.status || 'Upcoming',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        title: '',
        vehicleId: vehicles.length > 0 ? vehicles[0].id : '',
        category: 'Engine oil',
        lastServiceDate: '',
        currentOdometer: vehicles.length > 0 ? vehicles[0].currentOdometer : '',
        nextServiceDate: '',
        nextServiceOdometer: '',
        estimatedCost: '',
        status: 'Upcoming',
        notes: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen, vehicles]);

  // When vehicle changes in form, prefill its current odometer
  const handleVehicleChange = (e) => {
    const selectedVehId = e.target.value;
    const veh = vehicles.find(v => v.id === selectedVehId);
    setFormData(prev => ({
      ...prev,
      vehicleId: selectedVehId,
      currentOdometer: veh ? veh.currentOdometer : prev.currentOdometer
    }));
    if (errors.vehicleId) {
      setErrors(prev => ({ ...prev, vehicleId: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateMaintenance(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const payload = {
      ...formData,
      currentOdometer: formData.currentOdometer === '' ? null : Number(formData.currentOdometer),
      nextServiceOdometer: formData.nextServiceOdometer === '' ? null : Number(formData.nextServiceOdometer),
      estimatedCost: formData.estimatedCost === '' ? 0 : Number(formData.estimatedCost)
    };

    onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-navy-900 border border-charcoal-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-charcoal-800 flex items-center justify-between bg-navy-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-cyan border border-brand-blue/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Maintenance Task' : 'Schedule Maintenance Task'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Keep service history, intervals, and costs tracked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Engine Oil & Filter Change, Brake Pad Inspection"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border text-white text-sm focus:outline-none transition-colors ${
                errors.title ? 'border-rose-500' : 'border-charcoal-700 focus:border-brand-cyan'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.title}
              </p>
            )}
          </div>

          {/* Vehicle & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Vehicle <span className="text-rose-400">*</span>
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleVehicleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border text-white text-sm focus:outline-none transition-colors ${
                  errors.vehicleId ? 'border-rose-500' : 'border-charcoal-700 focus:border-brand-cyan'
                }`}
              >
                {vehicles.length === 0 ? (
                  <option value="">No vehicles found</option>
                ) : (
                  vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.nickname ? `${v.nickname} (${v.manufacturer} ${v.model})` : `${v.manufacturer} ${v.model}`}
                    </option>
                  ))
                )}
              </select>
              {errors.vehicleId && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.vehicleId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-cyan transition-colors"
              >
                {MAINTENANCE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Next Date & Target Next Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Next Service Date
              </label>
              <input
                type="date"
                name="nextServiceDate"
                value={formData.nextServiceDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-cyan transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Next Service Odometer (km)
              </label>
              <input
                type="number"
                name="nextServiceOdometer"
                value={formData.nextServiceOdometer}
                onChange={handleChange}
                placeholder="e.g. 30000"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border text-white text-sm focus:outline-none transition-colors ${
                  errors.nextServiceOdometer ? 'border-rose-500' : 'border-charcoal-700 focus:border-brand-cyan'
                }`}
              />
              {errors.nextServiceOdometer && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.nextServiceOdometer}
                </p>
              )}
            </div>
          </div>

          {/* Last Service Date & Current Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Last Service Date
              </label>
              <input
                type="date"
                name="lastServiceDate"
                value={formData.lastServiceDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-cyan transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Odometer (km)
              </label>
              <input
                type="number"
                name="currentOdometer"
                value={formData.currentOdometer}
                onChange={handleChange}
                placeholder="e.g. 28500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-cyan transition-colors"
              />
            </div>
          </div>

          {/* Estimated Cost & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Estimated Cost (₹ INR)
              </label>
              <input
                type="number"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleChange}
                placeholder="e.g. 3500"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border text-white text-sm focus:outline-none transition-colors ${
                  errors.estimatedCost ? 'border-rose-500' : 'border-charcoal-700 focus:border-brand-cyan'
                }`}
              />
              {errors.estimatedCost && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.estimatedCost}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Initial Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-cyan transition-colors"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Due soon">Due soon</option>
                <option value="Overdue">Overdue</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Service Notes & Part Specifications
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Recommended oil spec 0W-20, OEM brake pads..."
              className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-cyan transition-colors resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-charcoal-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-300 bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-blue hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {initialData ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
