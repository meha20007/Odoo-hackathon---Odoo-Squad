import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, TrendingUp } from "lucide-react";
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
} from "recharts";
import { useReportSummary, useOperationalCost } from "@/hooks/use-api-data";
import { API_BASE, formatCurrency } from "@/lib/transitops-api";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Reports & Analytics — TransitOps" }] }),
});

function ReportsPage() {
  const { data: summary, isLoading } = useReportSummary();
  const { data: costs } = useOperationalCost();

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading reports…</div>;
  }

  const vehicleStatusData = summary
    ? [
        { name: "Available", value: summary.available_vehicles, color: "var(--color-success)" },
        { name: "On Trip", value: summary.vehicles_on_trip, color: "var(--color-primary)" },
        { name: "In Shop", value: summary.vehicles_in_maintenance, color: "var(--color-warning)" },
        { name: "Retired", value: summary.retired_vehicles, color: "var(--color-border)" },
      ]
    : [];

  const expenseCategories = costs?.vehicles.slice(0, 5).map((v) => ({
    name: v.registration_number || v.vehicle_name || "Vehicle",
    value: v.operational_cost,
  })) || [];

  const kpis = [
    { label: "Fleet Utilization", value: `${summary?.fleet_utilization_percent || 0}%`, delta: "Live" },
    { label: "Active Trips", value: String(summary?.active_trips || 0), delta: "Running" },
    { label: "Drivers Available", value: String(summary?.drivers_available || 0), delta: "Ready" },
    { label: "Operational Cost", value: formatCurrency(summary?.total_operational_cost || 0), delta: "Total" },
  ];

  function exportCsv() {
    window.open(`${API_BASE}/api/reports/export/csv?type=operational-cost`, "_blank");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Executive analytics across fleet, drivers, fuel and maintenance."
        actions={
          <>
            <Button variant="outline" className="gap-1.5 rounded-xl"><FileText className="h-4 w-4" /> PDF</Button>
            <Button variant="outline" className="gap-1.5 rounded-xl"><FileSpreadsheet className="h-4 w-4" /> Excel</Button>
            <Button className="gap-1.5 rounded-xl" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map((s) => (
          <Card key={s.label} className="rounded-2xl shadow-soft">
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold">{s.value}</div>
              <StatusPill tone="success"><TrendingUp className="mr-1 h-3 w-3" />{s.delta}</StatusPill>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-soft">
          <CardHeader><CardTitle className="text-base">Operational Cost by Vehicle</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCategories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader><CardTitle className="text-base">Fleet Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vehicleStatusData} innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {vehicleStatusData.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-soft">
        <CardHeader><CardTitle className="text-base">Revenue vs Cost</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Total Revenue</div>
              <div className="mt-1 text-2xl font-semibold">{formatCurrency(summary?.total_revenue || 0)}</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Operational Cost</div>
              <div className="mt-1 text-2xl font-semibold">{formatCurrency(summary?.total_operational_cost || 0)}</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Net Margin</div>
              <div className="mt-1 text-2xl font-semibold">
                {formatCurrency((summary?.total_revenue || 0) - (summary?.total_operational_cost || 0))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
