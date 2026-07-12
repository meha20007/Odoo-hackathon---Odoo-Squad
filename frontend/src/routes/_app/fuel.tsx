import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, Search, Fuel, TrendingUp, Filter } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useFuelLogs, useVehicles } from "@/hooks/use-api-data";
import { formatCurrency } from "@/lib/transitops-api";

export const Route = createFileRoute("/_app/fuel")({
  component: FuelPage,
  head: () => ({ meta: [{ title: "Fuel & Expenses — TransitOps" }] }),
});

function FuelPage() {
  const { data: fuelLogs = [], isLoading } = useFuelLogs();
  const { data: vehicles = [] } = useVehicles();
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v._id, v.registration_number || v.vehicle_name]));

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading fuel logs…</div>;
  }

  const totalLiters = fuelLogs.reduce((s, l) => s + l.quantity, 0);
  const totalCost = fuelLogs.reduce((s, l) => s + l.total_cost, 0);

  const stats = [
    { label: "Total fuel", value: `${totalLiters.toLocaleString()} L`, tone: "primary" as const },
    { label: "Fuel cost", value: formatCurrency(totalCost), tone: "warning" as const },
    { label: "Log entries", value: String(fuelLogs.length), tone: "success" as const },
    { label: "Avg. cost/L", value: totalLiters ? `₹${(totalCost / totalLiters).toFixed(1)}` : "—", tone: "info" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fuel & Expense Management"
        description="Track every litre, every rupee — from pump to P&L."
        actions={
          <>
            <Button variant="outline" className="gap-1.5 rounded-xl"><Download className="h-4 w-4" /> Export</Button>
            <Button className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> Log Fuel</Button>
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
                <StatusPill tone={s.tone}><TrendingUp className="mr-1 h-3 w-3" />Live</StatusPill>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-soft lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Fuel Consumption</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fuelLogs.map((l) => ({ date: l.fuel_date, liters: l.quantity, cost: l.total_cost }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                  <Area type="monotone" dataKey="liters" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader><CardTitle className="text-base">By Fuel Type</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(
              fuelLogs.reduce<Record<string, number>>((acc, log) => {
                acc[log.fuel_type] = (acc[log.fuel_type] || 0) + log.total_cost;
                return acc;
              }, {}),
            ).map(([type, cost]) => (
              <div key={type} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <span>{type}</span>
                <span className="font-semibold">{formatCurrency(cost)}</span>
              </div>
            ))}
            {fuelLogs.length === 0 && <p className="text-sm text-muted-foreground">No fuel logs yet.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-soft">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 border-b border-border/70 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search fuel logs…" className="h-10 rounded-xl pl-9" />
            </div>
            <Button variant="outline" className="h-10 gap-1.5 rounded-xl"><Filter className="h-4 w-4" /> Filter</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Date</th>
                  <th className="px-6 py-3 text-left font-medium">Vehicle</th>
                  <th className="px-6 py-3 text-left font-medium">Station</th>
                  <th className="px-6 py-3 text-left font-medium">Liters</th>
                  <th className="px-6 py-3 text-left font-medium">Cost</th>
                  <th className="px-6 py-3 text-left font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {fuelLogs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-secondary/40">
                    <td className="px-6 py-3.5">{log.fuel_date}</td>
                    <td className="px-6 py-3.5">{vehicleMap[log.vehicle_id] || log.vehicle_id.slice(-6)}</td>
                    <td className="px-6 py-3.5">{log.fuel_station}</td>
                    <td className="px-6 py-3.5">{log.quantity} L</td>
                    <td className="px-6 py-3.5">{formatCurrency(log.total_cost)}</td>
                    <td className="px-6 py-3.5">
                      <StatusPill tone="info"><Fuel className="mr-1 h-3 w-3" />{log.fuel_type}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
