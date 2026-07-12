import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MapPin, Navigation, Filter } from "lucide-react";
import { useTrips, useDrivers, useVehicles } from "@/hooks/use-api-data";
import { TripStatusPill } from "./dashboard";

export const Route = createFileRoute("/_app/trips")({
  component: TripsPage,
  head: () => ({ meta: [{ title: "Trip Dispatcher — TransitOps" }] }),
});

function TripsPage() {
  const { data: trips = [], isLoading } = useTrips();
  const { data: drivers = [] } = useDrivers();
  const { data: vehicles = [] } = useVehicles();

  const driverMap = Object.fromEntries(drivers.map((d) => [d.id, d.name]));
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v._id, v.registration_number || v.vehicle_name]));

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading trips…</div>;
  }

  const activeTrip = trips.find((t) => t.status === "ongoing");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip Dispatcher"
        description="Plan, dispatch, and track every trip across your fleet in real time."
        actions={<Button className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> New Trip</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl shadow-soft">
            <div className="relative h-72 w-full bg-sidebar">
              <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar/80 to-primary/20" />
              <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium shadow-soft">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                {trips.filter((t) => t.status === "ongoing").length} trips in progress
              </div>
              {activeTrip && (
                <div className="absolute bottom-6 left-6 space-y-2">
                  <div className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs shadow-soft">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <div>
                      <div className="font-semibold">{activeTrip.source}</div>
                      <div className="text-[10px] text-muted-foreground">Pickup</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs shadow-soft">
                    <Navigation className="h-3.5 w-3.5 text-primary" />
                    <div>
                      <div className="font-semibold">{activeTrip.destination}</div>
                      <div className="text-[10px] text-muted-foreground">Destination · {activeTrip.planned_distance} km</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="rounded-2xl shadow-soft">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">All Trips</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">{trips.length} trips total</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search trips…" className="h-9 w-48 rounded-lg pl-9" />
                </div>
                <Button variant="outline" size="sm" className="rounded-lg"><Filter className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border/70 bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-6 py-3 text-left font-medium">Trip</th>
                      <th className="px-4 py-3 text-left font-medium">Route</th>
                      <th className="px-4 py-3 text-left font-medium">Driver</th>
                      <th className="px-4 py-3 text-left font-medium">Distance</th>
                      <th className="px-4 py-3 text-left font-medium">Revenue</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {trips.map((t) => (
                      <tr key={t._id} className="transition hover:bg-secondary/30">
                        <td className="px-6 py-3.5 font-medium">{t._id.slice(-6)}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium">{t.source}</div>
                          <div className="text-xs text-muted-foreground">→ {t.destination}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div>{driverMap[t.driver_id] || "—"}</div>
                          <div className="text-xs text-muted-foreground">{vehicleMap[t.vehicle_id] || "—"}</div>
                        </td>
                        <td className="px-4 py-3.5">{t.planned_distance || 0} km</td>
                        <td className="px-4 py-3.5">₹{(t.revenue || 0).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3.5"><TripStatusPill status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {trips.length === 0 && (
                  <p className="px-6 py-8 text-sm text-muted-foreground">No trips yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Trip Summary</CardTitle>
            <p className="text-xs text-muted-foreground">Fleet dispatch overview</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between rounded-xl border p-3">
              <span className="text-muted-foreground">Scheduled</span>
              <span className="font-semibold">{trips.filter((t) => t.status === "scheduled").length}</span>
            </div>
            <div className="flex justify-between rounded-xl border p-3">
              <span className="text-muted-foreground">In Progress</span>
              <span className="font-semibold">{trips.filter((t) => t.status === "ongoing").length}</span>
            </div>
            <div className="flex justify-between rounded-xl border p-3">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-semibold">{trips.filter((t) => t.status === "completed").length}</span>
            </div>
            <div className="flex justify-between rounded-xl border p-3">
              <span className="text-muted-foreground">Available Drivers</span>
              <span className="font-semibold">{drivers.filter((d) => d.status === "Available").length}</span>
            </div>
            <div className="flex justify-between rounded-xl border p-3">
              <span className="text-muted-foreground">Available Vehicles</span>
              <span className="font-semibold">{vehicles.filter((v) => v.status === "Available").length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
