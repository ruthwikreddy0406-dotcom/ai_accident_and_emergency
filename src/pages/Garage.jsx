import React, { useState } from 'react';
import { Car, PlusCircle, Gauge, Fuel, ShieldCheck, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import VehicleCard from '../components/VehicleCard';
import VehicleForm from '../components/VehicleForm';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { formatMileage, formatDistance } from '../utils/formatting';

export default function Garage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [fuelFilter, setFuelFilter] = useState('ALL');

  const handleEdit = (veh) => {
    setEditingVehicle(veh);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingVehicle(null);
  };

  const handleFormSubmit = (data) => {
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, data);
    } else {
      addVehicle(data);
    }
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter(v => {
    if (fuelFilter === 'ALL') return true;
    return v.fuelType === fuelFilter;
  });

  // Garage Fleet Statistics
  const avgMileage =
    vehicles.length > 0
      ? vehicles.reduce((acc, v) => acc + (Number(v.averageMileage) || 0), 0) / vehicles.length
      : 0;

  const totalOdometer = vehicles.reduce((acc, v) => acc + (Number(v.currentOdometer) || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-brand-cyan" />
            My Garage ({vehicles.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your personal vehicles, odometer readings, and fuel efficiencies
          </p>
        </div>

        <button
          onClick={() => {
            setEditingVehicle(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Fleet Overview Bar */}
      {vehicles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-navy-900/70 border border-charcoal-800 rounded-2xl p-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Total Vehicles</span>
            <span className="text-lg font-extrabold text-white">{vehicles.length}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Avg Garage Mileage</span>
            <span className="text-lg font-extrabold text-brand-glow">{formatMileage(avgMileage)}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Cumulative Distance</span>
            <span className="text-lg font-extrabold text-emerald-400">{formatDistance(totalOdometer)}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Data Privacy</span>
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Local
            </span>
          </div>
        </div>
      )}

      {/* Fuel Type Filter Tabs */}
      {vehicles.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {['ALL', 'Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map(tab => (
            <button
              key={tab}
              onClick={() => setFuelFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                fuelFilter === tab
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'bg-charcoal-900 text-slate-400 hover:text-slate-200 border border-charcoal-800'
              }`}
            >
              {tab === 'ALL' ? 'All Fuels' : tab}
            </button>
          ))}
        </div>
      )}

      {/* Vehicles Grid or Empty State */}
      {filteredVehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title={vehicles.length === 0 ? "No vehicles in your garage yet" : "No vehicles match the selected fuel filter"}
          description={
            vehicles.length === 0
              ? "Add your car, SUV, or motorcycle to start tracking maintenance intervals, logging fuel costs, and calculating trip expenses."
              : "Try switching to another fuel category or add a new vehicle."
          }
          actionText="Add Vehicle to Garage"
          onAction={() => {
            setFuelFilter('ALL');
            setEditingVehicle(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map(veh => (
            <VehicleCard
              key={veh.id}
              vehicle={veh}
              onEdit={handleEdit}
              onDelete={setDeletingVehicle}
            />
          ))}
        </div>
      )}

      {/* Vehicle Form Modal */}
      <VehicleForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingVehicle}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingVehicle}
        title="Remove Vehicle from Garage?"
        message={`Are you sure you want to delete "${deletingVehicle?.nickname || deletingVehicle?.model}"? This action will also remove associated maintenance schedules and expenses from your local vault.`}
        confirmText="Yes, Delete Vehicle"
        cancelText="Keep Vehicle"
        isDestructive={true}
        onConfirm={() => {
          if (deletingVehicle) {
            deleteVehicle(deletingVehicle.id);
            setDeletingVehicle(null);
          }
        }}
        onClose={() => setDeletingVehicle(null)}
      />
    </div>
  );
}
