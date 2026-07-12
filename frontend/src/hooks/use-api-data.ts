import { useQuery } from "@tanstack/react-query";
import { dataApi } from "@/lib/transitops-api";

export function useReportSummary() {
  return useQuery({
    queryKey: ["report-summary"],
    queryFn: dataApi.summary,
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: dataApi.drivers,
  });
}

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: dataApi.vehicles,
  });
}

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: dataApi.trips,
  });
}

export function useMaintenance() {
  return useQuery({
    queryKey: ["maintenance"],
    queryFn: dataApi.maintenance,
  });
}

export function useFuelLogs() {
  return useQuery({
    queryKey: ["fuel"],
    queryFn: dataApi.fuel,
  });
}

export function useOperationalCost() {
  return useQuery({
    queryKey: ["operational-cost"],
    queryFn: dataApi.operationalCost,
  });
}
