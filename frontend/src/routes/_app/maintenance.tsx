import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Wrench, Search, Plus, Calendar, IndianRupee, Filter } from "lucide-react";
import { useMaintenance, useVehicles } from "@/hooks/use-api-data";
import { formatCurrency } from "@/lib/transitops-api";

export const Route = createFileRoute("/_app/maintenance")({
  component: MaintenancePage,
  head: () => ({ meta: [{ title: "Maintenance — TransitOps" }] }),
});

function statusPill(status: string) {
  if (status === "Pending") return <StatusPill tone="warning">Pending</StatusPill>;
  if (status === "Completed") return <StatusPill tone="success">Completed</StatusPill>;
  return <StatusPill tone="info">{status}</StatusPill>;
}

function MaintenancePage() {
  const { data: maintenance = [], isLoading } = useMaintenance();
  const { data: vehicles = [] } = useVehicles();
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v._id, v.registration_number || v.vehicle_name]));

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading maintenance records…</div>;
  }

  const stats = [
    { label: "Pending", value: String(maintenance.filter((m) => m.status === "Pending").length), tone: "warning" as const },
    { label: "Completed", value: String(maintenance.filter((m) => m.status === "Completed").length), tone: "success" as const },
    { label: "Total Records", value: String(maintenance.length), tone: "info" as const },
    { label: "Total Cost", value: formatCurrency(maintenance.reduce((s, m) => s + m.cost, 0)), tone: "primary" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Management"
        description="Predictive servicing, repair history, and workshop coordination."
        actions={<Button className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> Schedule Service</Button>}
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

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search maintenance records…" className="h-10 rounded-xl bg-background pl-9" />
        </div>
        <Button variant="outline" className="h-10 gap-1.5 rounded-xl">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {maintenance.map((m) => (
          <Card key={m.id} className="rounded-2xl shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{m.maintenance_type}</h3>
                    <p className="text-xs text-muted-foreground">{vehicleMap[m.vehicle_id] || m.vehicle_id.slice(-6)}</p>
                  </div>
                </div>
                {statusPill(m.status)}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{m.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-secondary/70 px-3 py-2">
                  <Calendar className="h-3.5 w-3.5" /> {m.maintenance_date}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/70 px-3 py-2">
                  <IndianRupee className="h-3.5 w-3.5" /> {formatCurrency(m.cost)}
                </div>
              </div>
              <div className="mt-4">
                <Progress value={m.status === "Completed" ? 100 : 50} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {maintenance.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">No maintenance records found.</p>
      )}
    </div>
  );
}
