/**
 * Realistic Demo Data for AutoCare Hub
 * Used for hackathon demonstrations and initial app launch.
 * Clearly identified as demo data.
 */

export const INITIAL_VEHICLES = [
  {
    id: 'veh_01',
    nickname: 'City Cruiser',
    manufacturer: 'Honda',
    model: 'City ZX',
    year: 2022,
    registrationNumber: 'DL-01-AB-1234',
    fuelType: 'Petrol',
    currentOdometer: 28500,
    averageMileage: 15.0, // km/L
    lastServiceDate: '2026-06-15',
    isDemo: true,
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'veh_02',
    nickname: 'Urban Beast',
    manufacturer: 'Tata',
    model: 'Nexon EV / Diesel',
    year: 2023,
    registrationNumber: 'MH-02-CD-5678',
    fuelType: 'Diesel',
    currentOdometer: 19200,
    averageMileage: 18.5, // km/L
    lastServiceDate: '2026-08-10',
    isDemo: true,
    createdAt: '2026-02-15T11:30:00.000Z'
  }
];

export const INITIAL_MAINTENANCE = [
  {
    id: 'maint_01',
    vehicleId: 'veh_01',
    title: 'Synthetic Engine Oil & Filter Replacement',
    category: 'Engine oil',
    lastServiceDate: '2026-06-15',
    currentOdometer: 28500,
    nextServiceDate: '2026-10-25',
    nextServiceOdometer: 30000,
    estimatedCost: 3800,
    status: 'Due soon', // Will be dynamically evaluated if needed
    notes: 'Use 0W-20 fully synthetic oil recommended by Honda service guide.',
    isDemo: true,
    completedAt: null
  },
  {
    id: 'maint_02',
    vehicleId: 'veh_01',
    title: 'Front Brake Pads Inspection & Bleed',
    category: 'Brakes',
    lastServiceDate: '2025-10-10',
    currentOdometer: 28500,
    nextServiceDate: '2026-10-05', // Past current date (Oct 14, 2026) -> Overdue
    nextServiceOdometer: 28000,
    estimatedCost: 2600,
    status: 'Overdue',
    notes: 'Slight squeak reported under heavy city braking.',
    isDemo: true,
    completedAt: null
  },
  {
    id: 'maint_03',
    vehicleId: 'veh_02',
    title: 'Major 20,000 km Periodic Service',
    category: 'General servicing',
    lastServiceDate: '2026-08-10',
    currentOdometer: 19200,
    nextServiceDate: '2026-12-15',
    nextServiceOdometer: 20000,
    estimatedCost: 6500,
    status: 'Upcoming',
    notes: 'Includes air filter, fuel filter, and general inspection.',
    isDemo: true,
    completedAt: null
  },
  {
    id: 'maint_04',
    vehicleId: 'veh_01',
    title: 'Wheel Balancing & 4-Tyre Rotation',
    category: 'Tyres',
    lastServiceDate: '2026-06-15',
    currentOdometer: 25000,
    nextServiceDate: '2026-12-15',
    nextServiceOdometer: 35000,
    estimatedCost: 1200,
    status: 'Completed',
    notes: 'All 4 tyres aligned and rotated diagonally at 25,000 km mark.',
    isDemo: true,
    completedAt: '2026-06-16T14:00:00.000Z'
  }
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp_01',
    vehicleId: 'veh_01',
    category: 'Fuel',
    amount: 3200,
    date: '2026-10-10',
    description: 'Full tank Petrol (30.4 L @ ₹105.2)',
    isDemo: true
  },
  {
    id: 'exp_02',
    vehicleId: 'veh_02',
    category: 'Fuel',
    amount: 2800,
    date: '2026-10-08',
    description: 'Diesel refill at Shell highway station',
    isDemo: true
  },
  {
    id: 'exp_03',
    vehicleId: 'veh_01',
    category: 'Washing',
    amount: 650,
    date: '2026-10-04',
    description: 'Deep foam exterior wash & vacuuming',
    isDemo: true
  },
  {
    id: 'exp_04',
    vehicleId: 'veh_01',
    category: 'Parking',
    amount: 350,
    date: '2026-10-02',
    description: 'Airport terminal multi-level parking',
    isDemo: true
  },
  {
    id: 'exp_05',
    vehicleId: 'veh_01',
    category: 'Servicing',
    amount: 4500,
    date: '2026-09-18',
    description: 'AC coil cleaning & cabin filter replacement',
    isDemo: true
  },
  {
    id: 'exp_06',
    vehicleId: 'veh_02',
    category: 'Fuel',
    amount: 3100,
    date: '2026-09-12',
    description: 'Monthly commute Diesel fuel up',
    isDemo: true
  },
  {
    id: 'exp_07',
    vehicleId: 'veh_01',
    category: 'Insurance',
    amount: 14500,
    date: '2026-08-20',
    description: 'Annual comprehensive bumper-to-bumper insurance renewal',
    isDemo: true
  },
  {
    id: 'exp_08',
    vehicleId: 'veh_02',
    category: 'Servicing',
    amount: 3800,
    date: '2026-08-10',
    description: 'Periodic service checkup & coolant top-up',
    isDemo: true
  },
  {
    id: 'exp_09',
    vehicleId: 'veh_01',
    category: 'Tyres',
    amount: 1200,
    date: '2026-06-15',
    description: 'Tyre balancing and alignment at authorized shop',
    isDemo: true
  },
  {
    id: 'exp_10',
    vehicleId: 'veh_02',
    category: 'Fuel',
    amount: 2950,
    date: '2026-07-22',
    description: 'Highway trip diesel tank top-up',
    isDemo: true
  }
];

export const INITIAL_SETTINGS = {
  currency: 'INR',
  currencySymbol: '₹',
  distanceUnit: 'km',
  fuelUnit: 'km/L',
  theme: 'dark',
  defaultFuelPrice: 104.5,
  isDemoActive: true
};
