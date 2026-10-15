import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initializeStorage,
  getStoredVehicles,
  saveStoredVehicles,
  getStoredMaintenance,
  saveStoredMaintenance,
  getStoredExpenses,
  saveStoredExpenses,
  getStoredSettings,
  saveStoredSettings,
  resetDemoData as resetStorageDemoData,
  clearAllData as clearStorageAllData,
  exportBackup,
  validateImportData
} from '../utils/storage';
import { getMaintenanceStatusInfo } from '../utils/maintenance';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Initialize storage once
  useEffect(() => {
    initializeStorage();
  }, []);

  const [vehicles, setVehicles] = useState(() => getStoredVehicles());
  const [maintenance, setMaintenance] = useState(() => getStoredMaintenance());
  const [expenses, setExpenses] = useState(() => getStoredExpenses());
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [toasts, setToasts] = useState([]);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveStoredVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    saveStoredMaintenance(maintenance);
  }, [maintenance]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredSettings(settings);
    // Apply theme to document root
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [settings]);

  // Toast feedback helper
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Vehicle operations
  const addVehicle = (vehicleData) => {
    const newVehicle = {
      ...vehicleData,
      id: `veh_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setVehicles(prev => [newVehicle, ...prev]);
    showToast(`Vehicle "${newVehicle.nickname || newVehicle.model}" added successfully!`, 'success');
    return newVehicle;
  };

  const updateVehicle = (id, updatedData) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, ...updatedData } : v)));
    showToast('Vehicle updated successfully.', 'success');
  };

  const deleteVehicle = (id) => {
    const target = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    // Also remove or keep tasks? Better to remove or mark orphaned
    setMaintenance(prev => prev.filter(m => m.vehicleId !== id));
    setExpenses(prev => prev.filter(e => e.vehicleId !== id));
    showToast(`Vehicle "${target?.nickname || 'Selected'}" deleted.`, 'info');
  };

  // Maintenance operations
  const addMaintenanceTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: `maint_${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    setMaintenance(prev => [newTask, ...prev]);
    showToast(`Maintenance task "${newTask.title}" scheduled.`, 'success');
    return newTask;
  };

  const updateMaintenanceTask = (id, updatedData) => {
    setMaintenance(prev => prev.map(m => (m.id === id ? { ...m, ...updatedData } : m)));
    showToast('Maintenance task updated.', 'success');
  };

  const markTaskCompleted = (id) => {
    setMaintenance(prev =>
      prev.map(m => {
        if (m.id === id) {
          const completedAt = new Date().toISOString();
          return { ...m, status: 'Completed', completedAt };
        }
        return m;
      })
    );
    showToast('Task marked as completed! Great job maintaining your vehicle.', 'success');
  };

  const deleteMaintenanceTask = (id) => {
    setMaintenance(prev => prev.filter(m => m.id !== id));
    showToast('Maintenance task removed.', 'info');
  };

  // Expense operations
  const addExpense = (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    showToast(`Expense of ₹${Number(newExpense.amount).toLocaleString('en-IN')} recorded.`, 'success');
    return newExpense;
  };

  const updateExpense = (id, updatedData) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updatedData } : e)));
    showToast('Expense record updated.', 'success');
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast('Expense entry removed.', 'info');
  };

  // Settings & Storage Actions
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Preferences saved.', 'success');
  };

  const resetToDemo = () => {
    const reset = resetStorageDemoData();
    setVehicles(reset.vehicles);
    setMaintenance(reset.maintenance);
    setExpenses(reset.expenses);
    setSettings(reset.settings);
    showToast('AutoCare Hub demo data restored.', 'info');
  };

  const clearAllUserData = () => {
    const cleared = clearStorageAllData();
    setVehicles(cleared.vehicles);
    setMaintenance(cleared.maintenance);
    setExpenses(cleared.expenses);
    setSettings(cleared.settings);
    showToast('All vehicle and expense data cleared.', 'warning');
  };

  const importBackupFile = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      const validation = validateImportData(parsed);
      if (!validation.valid) {
        showToast(validation.message, 'error');
        return false;
      }
      setVehicles(parsed.vehicles);
      setMaintenance(parsed.maintenance);
      setExpenses(parsed.expenses);
      if (parsed.settings) {
        setSettings(parsed.settings);
      }
      showToast('Backup restored successfully!', 'success');
      return true;
    } catch (err) {
      showToast('Could not parse backup file. Please ensure it is valid JSON.', 'error');
      return false;
    }
  };

  // Computed reminders
  const enrichedMaintenance = maintenance.map(task => {
    const v = vehicles.find(veh => veh.id === task.vehicleId);
    const info = getMaintenanceStatusInfo(task, v);
    return {
      ...task,
      computedStatus: info.status,
      badgeClass: info.badgeClass,
      reason: info.reason,
      priority: info.priority,
      vehicleName: v ? `${v.manufacturer} ${v.model}` : 'Unknown Vehicle'
    };
  });

  const overdueTasks = enrichedMaintenance.filter(t => t.computedStatus === 'Overdue');
  const dueSoonTasks = enrichedMaintenance.filter(t => t.computedStatus === 'Due soon');
  const upcomingTasks = enrichedMaintenance.filter(t => t.computedStatus === 'Upcoming');
  const completedTasks = enrichedMaintenance.filter(t => t.computedStatus === 'Completed');
  const activeAlertsCount = overdueTasks.length + dueSoonTasks.length;

  return (
    <AppContext.Provider
      value={{
        vehicles,
        maintenance: enrichedMaintenance,
        expenses,
        settings,
        toasts,
        showToast,
        removeToast,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addMaintenanceTask,
        updateMaintenanceTask,
        markTaskCompleted,
        deleteMaintenanceTask,
        addExpense,
        updateExpense,
        deleteExpense,
        updateSettings,
        resetToDemo,
        clearAllUserData,
        exportBackup,
        importBackupFile,
        overdueTasks,
        dueSoonTasks,
        upcomingTasks,
        completedTasks,
        activeAlertsCount,
        isReminderModalOpen,
        setIsReminderModalOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
