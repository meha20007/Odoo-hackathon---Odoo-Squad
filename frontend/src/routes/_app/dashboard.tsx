import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Truck,
  Users,
  Route as RouteIcon,
  CheckCircle2,
  Wrench,
  Gauge,
  Fuel,
  Wallet,
  Bell,
  Plus,
  ArrowUpRight,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useReportSummary, useTrips, useMaintenance, useFuelLogs, useDrivers } from "@/hooks/use-api-data";
import { useAuth } from "@/components/AuthGuard";
import { formatCurrency, initials, tripStatusLabel, tripStatusTone } from "@/lib/transitops-api";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard — TransitOps" }],
  }),
});

function Dashboard() {
  const { data: auth } = useAuth();
  const { data: summary, isLoading } = useReportSummary();
  const { data: trips = [] } = useTrips();
  const { data: maintenance = [] } = useMaintenance();
  const { data: fuelLogs = [] } = useFuelLogs();
  const { data: drivers = [] } = useDrivers();

  const vehicleStatusData = summary
    ? [
        { name: "Available", value: summary.available_vehicles, color: "var(--color-success)" },
        { name: "On Trip", value: summary.vehicles_on_trip, color: "var(--color-primary)" },
        { name: "In Shop", value: summary.vehicles_in_maintenance, color: "var(--color-warning)" },
        { name: "Retired", value: summary.retired_vehicles, color: "var(--color-border)" },
      ]
    : [];

  const totalFuel = fuelLogs.reduce((sum, log) => sum + log.quantity, 0);
  const kpis = summary
    ? [
        { label: "Total Vehicles", value: String(summary.active_vehicles + summary.retired_vehicles), icon: Truck, tone: "primary" as const },
        { label: "Active Drivers", value: String(drivers.length), icon: Users, tone: "info" as const },
        { label: "Running Trips", value: String(summary.active_trips), icon: RouteIcon, tone: "primary" as const },
        { label: "Pending Trips", value: String(summary.pending_trips), icon: CheckCircle2, tone: "success" as const },
        { label: "Under Maintenance", value: String(summary.vehicles_in_maintenance), icon: Wrench, tone: "warning" as const },
        { label: "Fleet Utilization", value: `${summary.fleet_utilization_percent}%`, icon: Gauge, tone: "primary" as const },
        { label: "Fuel Consumed", value: `${totalFuel.toLocaleString()} L`, icon: Fuel, tone: "info" as const },
        { label: "Total Revenue", value: formatCurrency(summary.total_revenue), icon: Wallet, tone: "success" as const },
      ]
    : [];

  const driverMap = Object.fromEntries(drivers.map((d) => [d.id, d.name]));

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good morning, ${auth?.user?.name?.split(" ")[0] || "there"} 👋`}
        description={`Here's what's happening across your fleet today, ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`}
        actions={
          <>
            <Button variant="outline" className="gap-1.5 rounded-xl">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button className="gap-1.5 rounded-xl">
              <Plus className="h-4 w-4" /> New Trip
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-2xl border-border/80 shadow-soft transition hover:shadow-elevated">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <k.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 text-2xl font-semibold tracking-tight">{k.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Fleet Overview</CardTitle>
            <p className="text-xs text-muted-foreground">Operational cost vs revenue</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border p-4">
                <div className="text-xs text-muted-foreground">Operational Cost</div>
                <div className="mt-1 text-2xl font-semibold">{formatCurrency(summary?.total_operational_cost || 0)}</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-xs text-muted-foreground">Total Revenue</div>
                <div className="mt-1 text-2xl font-semibold">{formatCurrency(summary?.total_revenue || 0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Vehicle Status</CardTitle>
            <p className="text-xs text-muted-foreground">Live snapshot across fleet</p>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vehicleStatusData} innerRadius={54} outerRadius={82} paddingAngle={3} dataKey="value">
                    {vehicleStatusData.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {vehicleStatusData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Fuel Consumption</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fuelLogs.map((log) => ({ name: log.fuel_date, liters: log.quantity }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                  <Area type="monotone" dataKey="liters" stroke="var(--color-primary)" strokeWidth={2.5} fill="var(--color-primary)" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Maintenance Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {maintenance.slice(0, 4).map((m) => (
              <div key={m.id} className="rounded-xl border border-border/70 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{m.maintenance_type}</div>
                  <StatusPill tone={m.status === "Pending" ? "warning" : "success"}>{m.status}</StatusPill>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{m.description}</div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={m.status === "Completed" ? 100 : 45} className="h-1.5" />
                </div>
              </div>
            ))}
            {maintenance.length === 0 && (
              <p className="text-sm text-muted-foreground">No maintenance records yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-soft">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Recent Trips</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Live and recently completed dispatches</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 rounded-lg text-primary hover:bg-primary/5">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border/70 bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Trip</th>
                  <th className="px-6 py-3 text-left font-medium">Route</th>
                  <th className="px-6 py-3 text-left font-medium">Driver</th>
                  <th className="px-6 py-3 text-left font-medium">Distance</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {trips.slice(0, 6).map((t) => (
                  <tr key={t._id} className="transition hover:bg-secondary/40">
                    <td className="px-6 py-3.5 font-medium">{t._id.slice(-6)}</td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium">{t.source}</div>
                      <div className="text-xs text-muted-foreground">→ {t.destination}</div>
                    </td>
                    <td className="px-6 py-3.5">{driverMap[t.driver_id] || t.driver_id.slice(-6)}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{t.planned_distance || 0} km</td>
                    <td className="px-6 py-3.5">
                      <TripStatusPill status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {trips.length === 0 && (
              <p className="px-6 py-8 text-sm text-muted-foreground">No trips yet. Run seed_data.py to populate demo data.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TripStatusPill({ status }: { status: string }) {
  return <StatusPill tone={tripStatusTone(status)}>{tripStatusLabel(status)}</StatusPill>;
}
