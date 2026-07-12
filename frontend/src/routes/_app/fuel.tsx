import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, Search, Fuel, TrendingUp, Filter } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { fuelLogs, fuelTrend, expenseCategories } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/fuel")({
  component: FuelPage,
  head: () => ({ meta: [{ title: "Fuel & Expenses — TransitOps" }] }),
});

function FuelPage() {
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
        {[
          { label: "Fuel this month", value: "24,200 L", tone: "primary" as const },
          { label: "Fuel cost", value: "₹23.4L", tone: "warning" as const },
          { label: "Avg. mileage", value: "4.6 km/L", tone: "success" as const },
          { label: "Total expenses", value: "₹46.5L", tone: "info" as const },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl shadow-soft">
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="text-2xl font-semibold">{s.value}</div>
                <StatusPill tone={s.tone}><TrendingUp className="mr-1 h-3 w-3" />+4%</StatusPill>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-soft lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Monthly Fuel Analytics</CardTitle></CardHeader>
          <CardContent className="pl-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                  <Line type="monotone" dataKey="liters" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader><CardTitle className="text-base">Expense Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCategories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} className="text-xs" width={90} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-soft">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Fuel Logs</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search…" className="h-9 w-48 rounded-lg pl-9" />
            </div>
            <Button variant="outline" size="sm" className="rounded-lg"><Filter className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border/70 bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Log</th>
                  <th className="px-4 py-3 text-left font-medium">Vehicle</th>
                  <th className="px-4 py-3 text-left font-medium">Driver</th>
                  <th className="px-4 py-3 text-left font-medium">Station</th>
                  <th className="px-4 py-3 text-left font-medium">Litres</th>
                  <th className="px-4 py-3 text-left font-medium">Cost</th>
                  <th className="px-4 py-3 text-left font-medium">Mileage</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {fuelLogs.map((f) => (
                  <tr key={f.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-3.5 font-medium">{f.id}</td>
                    <td className="px-4 py-3.5">{f.vehicle}</td>
                    <td className="px-4 py-3.5">{f.driver}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{f.station}</td>
                    <td className="px-4 py-3.5 font-medium">{f.liters} L</td>
                    <td className="px-4 py-3.5">₹{f.cost.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5"><StatusPill tone={f.mileage >= 5 ? "success" : "warning"}>{f.mileage} km/L</StatusPill></td>
                    <td className="px-4 py-3.5 text-muted-foreground">{f.date}</td>
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
