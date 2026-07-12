import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Plus, MoreHorizontal, Eye } from "lucide-react";
import { useVehicles, useReportSummary } from "@/hooks/use-api-data";
import { vehicleStatusTone } from "@/lib/transitops-api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_app/vehicles")({
  component: VehiclesPage,
  head: () => ({ meta: [{ title: "Vehicle Registry — TransitOps" }] }),
});

function VehiclesPage() {
  const { data: vehicles = [], isLoading } = useVehicles();
  const { data: summary } = useReportSummary();

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading vehicles…</div>;
  }

  const stats = [
    { label: "Total", value: String((summary?.active_vehicles || 0) + (summary?.retired_vehicles || 0)), tone: "primary" as const },
    { label: "Available", value: String(summary?.available_vehicles || 0), tone: "success" as const },
    { label: "On Trip", value: String(summary?.vehicles_on_trip || 0), tone: "primary" as const },
    { label: "Under Maintenance", value: String(summary?.vehicles_in_maintenance || 0), tone: "warning" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle Registry"
        description="Manage every vehicle in your fleet — documents, assignments, and availability."
        actions={
          <>
            <Button variant="outline" className="gap-1.5 rounded-xl">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button className="gap-1.5 rounded-xl">
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl shadow-soft">
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="text-2xl font-semibold">{s.value}</div>
                <StatusPill tone={s.tone}>Live</StatusPill>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl shadow-soft">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border/70 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by number, name or type…" className="h-10 rounded-xl pl-9" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Registration</th>
                  <th className="px-6 py-3 text-left font-medium">Vehicle</th>
                  <th className="px-6 py-3 text-left font-medium">Type</th>
                  <th className="px-6 py-3 text-left font-medium">Capacity</th>
                  <th className="px-6 py-3 text-left font-medium">Odometer</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {vehicles.map((v) => (
                  <tr key={v._id} className="transition hover:bg-secondary/40">
                    <td className="px-6 py-3.5 font-medium">{v.registration_number}</td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium">{v.vehicle_name || `${v.make} ${v.model}`}</div>
                      <div className="text-xs text-muted-foreground">{v.make} {v.model}</div>
                    </td>
                    <td className="px-6 py-3.5">{v.vehicle_type}</td>
                    <td className="px-6 py-3.5">{v.max_load_capacity?.toLocaleString()} kg</td>
                    <td className="px-6 py-3.5">{v.odometer?.toLocaleString()} km</td>
                    <td className="px-6 py-3.5">
                      <StatusPill tone={vehicleStatusTone(v.status)}>{v.status}</StatusPill>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vehicles.length === 0 && (
              <p className="px-6 py-8 text-sm text-muted-foreground">No vehicles found. Run `python seed_data.py`.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
