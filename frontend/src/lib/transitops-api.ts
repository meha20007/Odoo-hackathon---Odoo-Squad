import { apiFetch } from "./api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type MeResponse = {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
};

export type DriverRecord = {
  id: string;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  contact_number: string;
  safety_score: number;
  status: string;
  license_valid?: boolean;
  assignable?: boolean;
};

export type VehicleRecord = {
  _id: string;
  make?: string;
  model?: string;
  vehicle_name?: string;
  vehicle_type?: string;
  registration_number?: string;
  max_load_capacity?: number;
  odometer?: number;
  acquisition_cost?: number;
  status?: string;
  year?: number;
};

export type TripRecord = {
  _id: string;
  vehicle_id: string;
  driver_id: string;
  source: string;
  destination: string;
  start_time: string;
  end_time: string;
  status: string;
  cargo_weight?: number;
  planned_distance?: number;
  actual_distance?: number;
  revenue?: number;
};

export type MaintenanceRecord = {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  description: string;
  cost: number;
  maintenance_date: string;
  next_service_date?: string | null;
  status: string;
};

export type FuelRecord = {
  id: string;
  vehicle_id: string;
  trip_id: string;
  fuel_station: string;
  fuel_type: string;
  quantity: number;
  cost_per_liter: number;
  total_cost: number;
  fuel_date: string;
  odometer: number;
};

export type ReportSummary = {
  active_vehicles: number;
  available_vehicles: number;
  vehicles_in_maintenance: number;
  vehicles_on_trip: number;
  retired_vehicles: number;
  active_trips: number;
  pending_trips: number;
  drivers_on_duty: number;
  drivers_available: number;
  expired_licenses: number;
  fleet_utilization_percent: number;
  total_operational_cost: number;
  total_revenue: number;
};

export type OperationalCostReport = {
  total_operational_cost: number;
  vehicles: Array<{
    vehicle_id: string;
    registration_number?: string;
    vehicle_name?: string;
    fuel_cost: number;
    maintenance_cost: number;
    operational_cost: number;
  }>;
};

export const authApi = {
  me: () => apiFetch<MeResponse>("/api/auth/me"),
  login: (email: string, password: string) =>
    apiFetch<{ message: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: {
    email: string;
    password: string;
    confirm_password: string;
    name: string;
    role: string;
  }) =>
    apiFetch<{ message: string }>("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () => apiFetch<{ message: string }>("/logout", { method: "POST" }),
};

export const dataApi = {
  summary: () => apiFetch<ReportSummary>("/api/reports/summary"),
  fleetUtilization: () => apiFetch<ReportSummary>("/api/reports/fleet-utilization"),
  operationalCost: () => apiFetch<OperationalCostReport>("/api/reports/operational-cost"),
  drivers: () => apiFetch<DriverRecord[]>("/api/drivers"),
  vehicles: () => apiFetch<VehicleRecord[]>("/api/vehicles"),
  trips: () => apiFetch<TripRecord[]>("/api/trips"),
  maintenance: () => apiFetch<MaintenanceRecord[]>("/api/maintenance"),
  fuel: () => apiFetch<FuelRecord[]>("/api/fuel"),
};

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatCurrency(value: number) {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

export function driverStatusTone(status: string): "success" | "primary" | "muted" | "warning" {
  const map: Record<string, "success" | "primary" | "muted" | "warning"> = {
    Available: "success",
    "On Trip": "primary",
    "Off Duty": "muted",
    Suspended: "warning",
  };
  return map[status] ?? "muted";
}

export function vehicleStatusTone(status?: string): "success" | "primary" | "warning" | "muted" {
  const map: Record<string, "success" | "primary" | "warning" | "muted"> = {
    Available: "success",
    "On Trip": "primary",
    "In Shop": "warning",
    Retired: "muted",
  };
  return map[status || ""] ?? "muted";
}

export function tripStatusTone(status: string): "success" | "warning" | "danger" | "muted" | "primary" | "info" {
  const map: Record<string, "success" | "warning" | "danger" | "muted" | "primary" | "info"> = {
    scheduled: "info",
    ongoing: "primary",
    completed: "success",
    cancelled: "danger",
    Scheduled: "info",
    "In Progress": "primary",
    Completed: "success",
    Cancelled: "danger",
  };
  return map[status] ?? "muted";
}

export function tripStatusLabel(status: string) {
  const map: Record<string, string> = {
    scheduled: "Scheduled",
    ongoing: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}
