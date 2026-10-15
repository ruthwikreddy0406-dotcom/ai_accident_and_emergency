import React, { useState, useEffect } from 'react';
import { X, Car, Shield, Check, AlertCircle } from 'lucide-react';
import { validateVehicle } from '../utils/validation';

export default function VehicleForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    nickname: '',
    manufacturer: '',
    model: '',
    year: new Date().getFullYear(),
    registrationNumber: '',
    fuelType: 'Petrol',
    currentOdometer: '',
    averageMileage: '',
    lastServiceDate: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nickname: initialData.nickname || '',
        manufacturer: initialData.manufacturer || '',
        model: initialData.model || '',
        year: initialData.year || new Date().getFullYear(),
        registrationNumber: initialData.registrationNumber || '',
        fuelType: initialData.fuelType || 'Petrol',
        currentOdometer: initialData.currentOdometer ?? '',
        averageMileage: initialData.averageMileage ?? '',
        lastServiceDate: initialData.lastServiceDate || ''
      });
    } else {
      setFormData({
        nickname: '',
        manufacturer: '',
        model: '',
        year: new Date().getFullYear(),
        registrationNumber: '',
        fuelType: 'Petrol',
        currentOdometer: '',
        averageMileage: '',
        lastServiceDate: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateVehicle(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const payload = {
      ...formData,
      year: Number(formData.year),
      currentOdometer: formData.currentOdometer === '' ? 0 : Number(formData.currentOdometer),
      averageMileage: Number(formData.averageMileage),
      registrationNumber: formData.registrationNumber.trim().toUpperCase()
    };

    onSubmit(payload);
    onClose();
  };

  const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Hybrid', 'Electric'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-navy-900 border border-charcoal-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-charcoal-800 flex items-center justify-between bg-navy-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-cyan border border-brand-blue/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Vehicle Information' : 'Add New Vehicle to Garage'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Keep track of specifications, mileage, and servicing
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nickname & Manufacturer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Vehicle Nickname (Optional)
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="e.g. City Cruiser, Daily Beast"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-cyan transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Manufacturer <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="e.g. Honda, Tata, Hyundai"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border text-white text-sm focus:outline-none transition-colors ${
                  errors.manufacturer ? 'border-rose-500' : 'border-charcoal-700 focus:border-brand-cyan'
                }`}
              />
              {errors.manufacturer && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.manufacturer}
                </p>
              )}
            </div>
          </div>

          {/* Model & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Model Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. City ZX, Nexon Fearless"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border text-white text-sm focus:outline-none transition-colors ${
                  errors.model ? 'border-rose-500' : 'border-charcoal-700 focus:border-brand-cyan'
                }`}
              />
              {errors.model && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.model}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Manufacturing Year <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1980"
                max={new Date().getFullYear() + 1}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border text-white text-sm focus:outline-none transition-colors ${
                  errors.year ? 'border-rose-500' : 'border-charcoal-700 focus:border-brand-cyan'
                }`}
              />
              {errors.year && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.year}
                </p>
              )}
            </div>
          </div>

          {/* Fuel Type & Average Mileage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fuel Type <span className="text-rose-400">*</span>
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-cyan transition-colors"
              >
                {fuelTypes.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Average Mileage (km/L) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                name="averageMileage"
                value={formData.averageMileage}
                onChange={handleChange}
                placeholder="e.g. 15.0"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border text-white text-sm focus:outline-none transition-colors ${
                  errors.averageMileage ? 'border-rose-500' : 'border-charcoal-700 focus:border-brand-cyan'
                }`}
              />
              {errors.averageMileage && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.averageMileage}
                </p>
              )}
            </div>
          </div>

          {/* Current Odometer & Last Service Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className={`w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border text-white text-sm focus:outline-none transition-colors ${
                  errors.currentOdometer ? 'border-rose-500' : 'border-charcoal-700 focus:border-brand-cyan'
                }`}
              />
              {errors.currentOdometer && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.currentOdometer}
                </p>
              )}
            </div>
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
          </div>

          {/* Registration Number (Optional & Private) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Registration Number (Optional)
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="e.g. MH-02-CD-5678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-cyan uppercase transition-colors"
            />
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>100% Client-Side: Registration details never leave your local browser.</span>
            </div>
          </div>

          {/* Modal Actions */}
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
              {initialData ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
