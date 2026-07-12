import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Wrench, Search, Plus, Calendar, MapPin, User, IndianRupee, Filter } from "lucide-react";
import { maintenance } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/maintenance")({
  component: MaintenancePage,
  head: () => ({ meta: [{ title: "Maintenance — TransitOps" }] }),
});

function statusPill(s: string) {
  if (s === "overdue") return <StatusPill tone="danger">Overdue</StatusPill>;
  if (s === "in-progress") return <StatusPill tone="warning">In progress</StatusPill>;
  if (s === "completed") return <StatusPill tone="success">Completed</StatusPill>;
  return <StatusPill tone="info">Scheduled</StatusPill>;
}

function MaintenancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Management"
        description="Predictive servicing, repair history, and workshop coordination."
        actions={<Button className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> Schedule Service</Button>}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Scheduled", value: "18", tone: "info" as const },
          { label: "In Progress", value: "6", tone: "warning" as const },
          { label: "Overdue", value: "2", tone: "danger" as const },
          { label: "Avg. Fleet Health", value: "84%", tone: "success" as const },
        ].map((s) => (
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
          <Input placeholder="Search vehicle, workshop, mechanic…" className="h-10 rounded-xl bg-background pl-9" />
        </div>
        <Button variant="outline" className="h-10 gap-1.5 rounded-xl"><Filter className="h-4 w-4" /> Filters</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {maintenance.map((m) => (
          <Card key={m.id} className="rounded-2xl shadow-soft transition hover:shadow-elevated">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-[15px]">{m.service}</CardTitle>
                  <p className="text-xs text-muted-foreground">{m.vehicle} · {m.id}</p>
                </div>
              </div>
              {statusPill(m.status)}
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid gap-2 text-sm">
                <Row icon={MapPin} label="Workshop" value={m.workshop} />
                <Row icon={User} label="Mechanic" value={m.mechanic} />
                <Row icon={Calendar} label="Scheduled" value={m.date} />
                <Row icon={IndianRupee} label="Estimated cost" value={`₹${m.cost.toLocaleString("en-IN")}`} />
              </div>
              <div className="rounded-lg bg-secondary/60 p-2.5 text-xs">
                <div className="font-medium">Parts</div>
                <div className="text-muted-foreground">{m.parts}</div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Vehicle health</span>
                  <span className="font-semibold">{m.health}%</span>
                </div>
                <Progress value={m.health} className="h-1.5" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-lg">View details</Button>
                <Button size="sm" className="flex-1 rounded-lg">Update status</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="ml-auto truncate font-medium">{value}</span>
    </div>
  );
}
