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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Bell,
  Plus,
  ArrowUpRight,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
} from "recharts";
import {
  activities,
  fuelTrend,
  monthlyTrips,
  trips,
  maintenance,
  vehicleStatusData,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard — TransitOps" }],
  }),
});

const kpis = [
  { label: "Total Vehicles", value: "84", delta: "+3", up: true, icon: Truck, tone: "primary" as const },
  { label: "Active Drivers", value: "112", delta: "+8", up: true, icon: Users, tone: "info" as const },
  { label: "Running Trips", value: "27", delta: "+4", up: true, icon: RouteIcon, tone: "primary" as const },
  { label: "Trips Completed", value: "1,842", delta: "+12%", up: true, icon: CheckCircle2, tone: "success" as const },
  { label: "Under Maintenance", value: "9", delta: "-2", up: false, icon: Wrench, tone: "warning" as const },
  { label: "Fleet Utilization", value: "78%", delta: "+4.2%", up: true, icon: Gauge, tone: "primary" as const },
  { label: "Fuel Consumed", value: "24,200 L", delta: "+5.1%", up: true, icon: Fuel, tone: "info" as const },
  { label: "Monthly Expenses", value: "₹46.5L", delta: "-2.4%", up: false, icon: Wallet, tone: "success" as const },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Good morning, Arjun 👋"
        description="Here's what's happening across your fleet today, 12 July 2026."
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

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-2xl border-border/80 shadow-soft transition hover:shadow-elevated">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <k.icon className="h-5 w-5" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    k.up ? "text-success" : "text-destructive"
                  }`}
                >
                  {k.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {k.delta}
                </div>
              </div>
              <div className="mt-4 text-2xl font-semibold tracking-tight">{k.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-soft lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Monthly Trip Analytics</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Completed vs cancelled trips per month</p>
            </div>
            <StatusPill tone="success">+12% MoM</StatusPill>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrips} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <Tooltip
                    cursor={{ fill: "var(--color-secondary)" }}
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="completed" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cancelled" fill="var(--color-border)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                  <Pie
                    data={vehicleStatusData}
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                  >
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
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Fuel Consumption Trend</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Litres consumed per month</p>
            </div>
            <StatusPill tone="warning">+5.1%</StatusPill>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fuelTrend}>
                  <defs>
                    <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                  <Area
                    type="monotone"
                    dataKey="liters"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#fuelGrad)"
                  />
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
                  <div className="text-sm font-medium">{m.vehicle}</div>
                  {m.status === "overdue" ? (
                    <StatusPill tone="danger">Overdue</StatusPill>
                  ) : m.status === "in-progress" ? (
                    <StatusPill tone="warning">In progress</StatusPill>
                  ) : (
                    <StatusPill tone="muted">Scheduled</StatusPill>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{m.service}</div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={m.health} className="h-1.5" />
                  <span className="text-[11px] font-medium text-muted-foreground">{m.health}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent trips + activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-soft lg:col-span-2">
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
                    <th className="px-6 py-3 text-left font-medium">ETA</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {trips.slice(0, 6).map((t) => (
                    <tr key={t.id} className="transition hover:bg-secondary/40">
                      <td className="px-6 py-3.5 font-medium">{t.id}</td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium">{t.pickup}</div>
                        <div className="text-xs text-muted-foreground">→ {t.destination}</div>
                      </td>
                      <td className="px-6 py-3.5">{t.driver}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{t.eta}</td>
                      <td className="px-6 py-3.5">
                        <TripStatusPill status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <p className="text-xs text-muted-foreground">Today's fleet events</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  {a.icon === "trip" && <RouteIcon className="h-4 w-4" />}
                  {a.icon === "fuel" && <Fuel className="h-4 w-4" />}
                  {a.icon === "maint" && <Wrench className="h-4 w-4" />}
                  {a.icon === "alert" && <AlertTriangle className="h-4 w-4" />}
                  {a.icon === "driver" && <Users className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.desc}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {a.time}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Today schedule */}
      <Card className="rounded-2xl shadow-soft">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Today's Schedule</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Upcoming dispatches and services</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {trips.slice(0, 3).map((t) => (
              <div key={t.id} className="rounded-xl border border-border/70 p-4 transition hover:border-primary/50 hover:shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">{t.id}</span>
                  <TripStatusPill status={t.status} />
                </div>
                <div className="mt-3 text-sm font-semibold">{t.pickup} → {t.destination}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t.cargo}</div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-secondary text-[10px] font-semibold">
                        {t.driver.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{t.driver}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t.scheduled}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TripStatusPill({ status }: { status: string }) {
  const map: Record<string, { tone: "success" | "warning" | "danger" | "muted" | "primary" | "info"; label: string }> = {
    "in-progress": { tone: "primary", label: "In Progress" },
    scheduled: { tone: "info", label: "Scheduled" },
    completed: { tone: "success", label: "Completed" },
    cancelled: { tone: "danger", label: "Cancelled" },
  };
  const m = map[status] ?? { tone: "muted", label: status };
  return <StatusPill tone={m.tone}>{m.label}</StatusPill>;
}
