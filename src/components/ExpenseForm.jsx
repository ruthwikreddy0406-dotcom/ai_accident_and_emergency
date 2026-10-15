import React, { useState, useEffect } from 'react';
import { X, Receipt, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { validateExpense } from '../utils/validation';

export default function ExpenseForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const { vehicles } = useApp();

  const [formData, setFormData] = useState({
    vehicleId: '',
    category: 'Fuel',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicleId: initialData.vehicleId || '',
        category: initialData.category || 'Fuel',
        amount: initialData.amount ?? '',
        date: initialData.date || new Date().toISOString().slice(0, 10),
        description: initialData.description || ''
      });
    } else {
      setFormData({
        vehicleId: vehicles.length > 0 ? vehicles[0].id : '',
        category: 'Fuel',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        description: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen, vehicles]);

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
    const validation = validateExpense(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      description: formData.description.trim()
    };

    onSubmit(payload);
    onClose();
  };

  const expenseCategories = [
    'Fuel',
    'Servicing',
    'Repairs',
    'Insurance',
    'Tyres',
    'Washing',
    'Parking',
    'Other'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-navy-900 border border-charcoal-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-charcoal-800 flex items-center justify-between bg-navy-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-cyan border border-brand-blue/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Expense Record' : 'Log New Expense'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track running costs and vehicle cashflow
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
          {/* Vehicle & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Vehicle <span className="text-rose-400">*</span>
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
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
                {expenseCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Amount (₹ INR) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 2500"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border text-white text-sm focus:outline-none transition-colors ${
                  errors.amount ? 'border-rose-500' : 'border-charcoal-700 focus:border-brand-cyan'
                }`}
              />
              {errors.amount && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.amount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border text-white text-sm focus:outline-none transition-colors ${
                  errors.date ? 'border-rose-500' : 'border-charcoal-700 focus:border-brand-cyan'
                }`}
              />
              {errors.date && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Notes
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Full petrol tank at Shell, Monthly insurance installment"
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-cyan transition-colors"
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
              {initialData ? 'Update Expense' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
