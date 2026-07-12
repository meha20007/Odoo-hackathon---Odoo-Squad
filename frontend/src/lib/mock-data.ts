export type VehicleStatus = "available" | "on-trip" | "maintenance" | "inactive";
export type DocStatus = "valid" | "expiring" | "expired";
export type TripStatus = "scheduled" | "in-progress" | "completed" | "cancelled";
export type DriverStatus = "available" | "on-duty" | "off-duty" | "on-leave";

export interface Vehicle {
  id: string;
  number: string;
  name: string;
  type: string;
  manufacturer: string;
  capacity: string;
  driver: string;
  insurance: DocStatus;
  rc: DocStatus;
  puc: DocStatus;
  status: VehicleStatus;
  odometer: number;
  image: string;
}

export const vehicles: Vehicle[] = [
  { id: "V-1042", number: "MH12 AB 4021", name: "Volvo FH16", type: "Heavy Truck", manufacturer: "Volvo", capacity: "25 T", driver: "Rajesh Kumar", insurance: "valid", rc: "valid", puc: "expiring", status: "on-trip", odometer: 184320, image: "🚛" },
  { id: "V-1043", number: "DL09 CE 2287", name: "Tata Ultra 1918", type: "Medium Truck", manufacturer: "Tata Motors", capacity: "14 T", driver: "Amit Sharma", insurance: "valid", rc: "valid", puc: "valid", status: "available", odometer: 96110, image: "🚚" },
  { id: "V-1044", number: "KA05 MN 9911", name: "Ashok Leyland Boss", type: "Container", manufacturer: "Ashok Leyland", capacity: "20 T", driver: "Suresh Patil", insurance: "expiring", rc: "valid", puc: "valid", status: "maintenance", odometer: 210450, image: "🚛" },
  { id: "V-1045", number: "TN22 XY 8801", name: "Mercedes Actros", type: "Heavy Truck", manufacturer: "Mercedes", capacity: "30 T", driver: "Vikram Singh", insurance: "valid", rc: "valid", puc: "valid", status: "on-trip", odometer: 45820, image: "🚛" },
  { id: "V-1046", number: "GJ01 KP 6543", name: "Mahindra Blazo X", type: "Medium Truck", manufacturer: "Mahindra", capacity: "16 T", driver: "Deepak Yadav", insurance: "valid", rc: "expiring", puc: "valid", status: "available", odometer: 72340, image: "🚚" },
  { id: "V-1047", number: "MH14 GT 1120", name: "Ford Transit", type: "Van", manufacturer: "Ford", capacity: "3 T", driver: "Priya Nair", insurance: "valid", rc: "valid", puc: "valid", status: "on-trip", odometer: 32180, image: "🚐" },
  { id: "V-1048", number: "UP16 BR 4477", name: "BharatBenz 3123", type: "Container", manufacturer: "BharatBenz", capacity: "22 T", driver: "Mohammed Ali", insurance: "expired", rc: "valid", puc: "expiring", status: "inactive", odometer: 289150, image: "🚛" },
  { id: "V-1049", number: "HR26 CD 5590", name: "Eicher Pro 6031", type: "Heavy Truck", manufacturer: "Eicher", capacity: "28 T", driver: "Sanjay Verma", insurance: "valid", rc: "valid", puc: "valid", status: "available", odometer: 118900, image: "🚛" },
];

export interface Driver {
  id: string;
  name: string;
  photo: string;
  license: string;
  licenseExpiry: string;
  experience: number;
  phone: string;
  emergency: string;
  vehicle: string;
  medical: DocStatus;
  safetyRating: number;
  score: number;
  violations: number;
  trips: number;
  status: DriverStatus;
}

export const drivers: Driver[] = [
  { id: "D-201", name: "Rajesh Kumar", photo: "RK", license: "MH1420190001234", licenseExpiry: "2027-08-12", experience: 12, phone: "+91 98201 12345", emergency: "+91 98765 43210", vehicle: "MH12 AB 4021", medical: "valid", safetyRating: 4.8, score: 92, violations: 1, trips: 348, status: "on-duty" },
  { id: "D-202", name: "Amit Sharma", photo: "AS", license: "DL0620160055432", licenseExpiry: "2026-03-04", experience: 8, phone: "+91 99101 22344", emergency: "+91 98108 55667", vehicle: "DL09 CE 2287", medical: "valid", safetyRating: 4.6, score: 88, violations: 0, trips: 221, status: "available" },
  { id: "D-203", name: "Suresh Patil", photo: "SP", license: "KA0520170099887", licenseExpiry: "2025-11-30", experience: 15, phone: "+91 98456 77112", emergency: "+91 96322 11009", vehicle: "KA05 MN 9911", medical: "expiring", safetyRating: 4.4, score: 81, violations: 2, trips: 512, status: "off-duty" },
  { id: "D-204", name: "Vikram Singh", photo: "VS", license: "TN2220180066521", licenseExpiry: "2028-01-19", experience: 10, phone: "+91 99400 33567", emergency: "+91 98847 22001", vehicle: "TN22 XY 8801", medical: "valid", safetyRating: 4.9, score: 96, violations: 0, trips: 289, status: "on-duty" },
  { id: "D-205", name: "Deepak Yadav", photo: "DY", license: "GJ0120150011223", licenseExpiry: "2026-07-22", experience: 6, phone: "+91 98250 44556", emergency: "+91 90999 11223", vehicle: "GJ01 KP 6543", medical: "valid", safetyRating: 4.5, score: 85, violations: 1, trips: 174, status: "available" },
  { id: "D-206", name: "Priya Nair", photo: "PN", license: "MH1420210077113", licenseExpiry: "2029-05-10", experience: 4, phone: "+91 98765 12309", emergency: "+91 98333 55447", vehicle: "MH14 GT 1120", medical: "valid", safetyRating: 4.7, score: 90, violations: 0, trips: 128, status: "on-duty" },
  { id: "D-207", name: "Mohammed Ali", photo: "MA", license: "UP1620140099001", licenseExpiry: "2025-02-08", experience: 18, phone: "+91 94100 88221", emergency: "+91 93555 44231", vehicle: "—", medical: "expired", safetyRating: 4.2, score: 76, violations: 3, trips: 601, status: "on-leave" },
  { id: "D-208", name: "Sanjay Verma", photo: "SV", license: "HR2620160044330", licenseExpiry: "2027-10-01", experience: 9, phone: "+91 99999 22114", emergency: "+91 98123 66554", vehicle: "HR26 CD 5590", medical: "valid", safetyRating: 4.6, score: 89, violations: 1, trips: 233, status: "available" },
];

export interface Trip {
  id: string;
  pickup: string;
  destination: string;
  driver: string;
  vehicle: string;
  status: TripStatus;
  distance: number;
  eta: string;
  scheduled: string;
  cargo: string;
}

export const trips: Trip[] = [
  { id: "TRP-8821", pickup: "Mumbai, MH", destination: "Pune, MH", driver: "Rajesh Kumar", vehicle: "MH12 AB 4021", status: "in-progress", distance: 148, eta: "2h 15m", scheduled: "Today, 09:20", cargo: "Electronics · 18 T" },
  { id: "TRP-8822", pickup: "Delhi", destination: "Jaipur, RJ", driver: "Vikram Singh", vehicle: "TN22 XY 8801", status: "in-progress", distance: 281, eta: "4h 40m", scheduled: "Today, 07:00", cargo: "Auto parts · 22 T" },
  { id: "TRP-8823", pickup: "Bengaluru, KA", destination: "Chennai, TN", driver: "Priya Nair", vehicle: "MH14 GT 1120", status: "in-progress", distance: 346, eta: "5h 55m", scheduled: "Today, 06:30", cargo: "Perishables · 2.5 T" },
  { id: "TRP-8824", pickup: "Hyderabad, TS", destination: "Vijayawada, AP", driver: "Amit Sharma", vehicle: "DL09 CE 2287", status: "scheduled", distance: 275, eta: "—", scheduled: "Tomorrow, 05:00", cargo: "Cement · 14 T" },
  { id: "TRP-8825", pickup: "Ahmedabad, GJ", destination: "Surat, GJ", driver: "Deepak Yadav", vehicle: "GJ01 KP 6543", status: "scheduled", distance: 265, eta: "—", scheduled: "Tomorrow, 08:30", cargo: "Textiles · 12 T" },
  { id: "TRP-8820", pickup: "Nagpur, MH", destination: "Bhopal, MP", driver: "Sanjay Verma", vehicle: "HR26 CD 5590", status: "completed", distance: 354, eta: "delivered", scheduled: "Yesterday, 06:00", cargo: "FMCG · 24 T" },
  { id: "TRP-8819", pickup: "Kolkata, WB", destination: "Ranchi, JH", driver: "Suresh Patil", vehicle: "KA05 MN 9911", status: "completed", distance: 412, eta: "delivered", scheduled: "Yesterday, 04:30", cargo: "Steel · 20 T" },
  { id: "TRP-8818", pickup: "Chennai, TN", destination: "Coimbatore, TN", driver: "Mohammed Ali", vehicle: "UP16 BR 4477", status: "cancelled", distance: 500, eta: "—", scheduled: "2 days ago", cargo: "Machinery · 21 T" },
];

export interface Maintenance {
  id: string;
  vehicle: string;
  service: string;
  workshop: string;
  mechanic: string;
  parts: string;
  cost: number;
  date: string;
  status: "scheduled" | "in-progress" | "completed" | "overdue";
  health: number;
}

export const maintenance: Maintenance[] = [
  { id: "M-501", vehicle: "MH12 AB 4021", service: "Engine oil & filter change", workshop: "Volvo Service — Mumbai", mechanic: "Rakesh Iyer", parts: "Oil filter, 5W-40 (12L)", cost: 18500, date: "2026-07-15", status: "scheduled", health: 82 },
  { id: "M-502", vehicle: "KA05 MN 9911", service: "Brake pad replacement", workshop: "Leyland Care — Bengaluru", mechanic: "Naveen R.", parts: "Brake pads (front+rear)", cost: 24200, date: "2026-07-12", status: "in-progress", health: 61 },
  { id: "M-503", vehicle: "TN22 XY 8801", service: "Tyre rotation & alignment", workshop: "MRF Service — Chennai", mechanic: "Karthik M.", parts: "—", cost: 4800, date: "2026-07-18", status: "scheduled", health: 88 },
  { id: "M-504", vehicle: "UP16 BR 4477", service: "Full engine overhaul", workshop: "BharatBenz — Lucknow", mechanic: "Faisal K.", parts: "Piston kit, gaskets, seals", cost: 168000, date: "2026-07-10", status: "overdue", health: 42 },
  { id: "M-505", vehicle: "HR26 CD 5590", service: "AC servicing", workshop: "Eicher Care — Gurugram", mechanic: "Sunil G.", parts: "AC gas, filter", cost: 6200, date: "2026-06-28", status: "completed", health: 94 },
  { id: "M-506", vehicle: "DL09 CE 2287", service: "Suspension check", workshop: "Tata Fleet Edge — Delhi", mechanic: "Mahesh J.", parts: "Bushings", cost: 12400, date: "2026-07-20", status: "scheduled", health: 79 },
];

export interface FuelLog {
  id: string;
  vehicle: string;
  driver: string;
  date: string;
  liters: number;
  cost: number;
  odometer: number;
  mileage: number;
  station: string;
}

export const fuelLogs: FuelLog[] = [
  { id: "F-9001", vehicle: "MH12 AB 4021", driver: "Rajesh Kumar", date: "2026-07-10", liters: 220, cost: 21340, odometer: 184100, mileage: 4.2, station: "HP Mumbai" },
  { id: "F-9002", vehicle: "DL09 CE 2287", driver: "Amit Sharma", date: "2026-07-10", liters: 180, cost: 17460, odometer: 95980, mileage: 5.1, station: "IOCL Delhi" },
  { id: "F-9003", vehicle: "TN22 XY 8801", driver: "Vikram Singh", date: "2026-07-09", liters: 260, cost: 25220, odometer: 45660, mileage: 3.8, station: "BPCL Chennai" },
  { id: "F-9004", vehicle: "KA05 MN 9911", driver: "Suresh Patil", date: "2026-07-09", liters: 200, cost: 19400, odometer: 210250, mileage: 4.0, station: "Shell Bengaluru" },
  { id: "F-9005", vehicle: "GJ01 KP 6543", driver: "Deepak Yadav", date: "2026-07-08", liters: 150, cost: 14550, odometer: 72180, mileage: 5.4, station: "IOCL Ahmedabad" },
  { id: "F-9006", vehicle: "MH14 GT 1120", driver: "Priya Nair", date: "2026-07-08", liters: 90, cost: 8730, odometer: 32000, mileage: 8.1, station: "HP Pune" },
  { id: "F-9007", vehicle: "HR26 CD 5590", driver: "Sanjay Verma", date: "2026-07-07", liters: 240, cost: 23280, odometer: 118700, mileage: 4.1, station: "IOCL Gurugram" },
];

export const activities = [
  { id: 1, icon: "trip", title: "Trip TRP-8821 dispatched", desc: "Rajesh Kumar · Mumbai → Pune", time: "12 min ago" },
  { id: 2, icon: "fuel", title: "Fuel refill logged", desc: "260 L @ BPCL Chennai · ₹25,220", time: "48 min ago" },
  { id: 3, icon: "maint", title: "Maintenance completed", desc: "HR26 CD 5590 · AC servicing", time: "2 hr ago" },
  { id: 4, icon: "alert", title: "Insurance expiring soon", desc: "KA05 MN 9911 · 14 days remaining", time: "3 hr ago" },
  { id: 5, icon: "driver", title: "New driver onboarded", desc: "Priya Nair · License verified", time: "Yesterday" },
];

export const monthlyTrips = [
  { month: "Jan", completed: 142, cancelled: 6 },
  { month: "Feb", completed: 168, cancelled: 4 },
  { month: "Mar", completed: 189, cancelled: 8 },
  { month: "Apr", completed: 176, cancelled: 5 },
  { month: "May", completed: 210, cancelled: 7 },
  { month: "Jun", completed: 234, cancelled: 3 },
  { month: "Jul", completed: 258, cancelled: 4 },
];

export const fuelTrend = [
  { month: "Jan", liters: 18400, cost: 1784000 },
  { month: "Feb", liters: 19200, cost: 1862400 },
  { month: "Mar", liters: 21100, cost: 2046700 },
  { month: "Apr", liters: 20500, cost: 1988500 },
  { month: "May", liters: 22400, cost: 2172800 },
  { month: "Jun", liters: 23100, cost: 2240700 },
  { month: "Jul", liters: 24200, cost: 2347400 },
];

export const vehicleStatusData = [
  { name: "On Trip", value: 42, color: "var(--color-primary)" },
  { name: "Available", value: 28, color: "var(--color-success)" },
  { name: "Maintenance", value: 9, color: "var(--color-warning)" },
  { name: "Inactive", value: 5, color: "var(--color-muted-foreground)" },
];

export const expenseCategories = [
  { name: "Fuel", value: 2347400 },
  { name: "Maintenance", value: 684200 },
  { name: "Insurance", value: 214000 },
  { name: "Tolls", value: 168400 },
  { name: "Driver Salaries", value: 1240000 },
];
