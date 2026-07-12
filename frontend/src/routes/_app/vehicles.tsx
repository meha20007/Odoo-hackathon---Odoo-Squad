import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, Download, Plus, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { vehicles, type DocStatus } from "@/lib/mock-data";
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

function docPill(status: DocStatus) {
  if (status === "valid") return <StatusPill tone="success">Valid</StatusPill>;
  if (status === "expiring") return <StatusPill tone="warning">Expiring</StatusPill>;
  return <StatusPill tone="danger">Expired</StatusPill>;
}

function VehiclesPage() {
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
        {[
          { label: "Total", value: "84", tone: "primary" as const },
          { label: "Available", value: "28", tone: "success" as const },
          { label: "On Trip", value: "42", tone: "primary" as const },
          { label: "Under Maintenance", value: "9", tone: "warning" as const },
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

      <Card className="rounded-2xl shadow-soft">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border/70 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by number, name or driver…" className="h-10 rounded-xl pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="h-10 w-[160px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="heavy">Heavy Truck</SelectItem>
                <SelectItem value="medium">Medium Truck</SelectItem>
                <SelectItem value="container">Container</SelectItem>
                <SelectItem value="van">Van</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="h-10 w-[160px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on-trip">On Trip</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-10 gap-1.5 rounded-xl">
              <SlidersHorizontal className="h-4 w-4" /> More filters
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-10 px-6 py-3"><Checkbox /></th>
                  <th className="px-2 py-3 text-left font-medium">Vehicle</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Capacity</th>
                  <th className="px-4 py-3 text-left font-medium">Driver</th>
                  <th className="px-4 py-3 text-left font-medium">Insurance</th>
                  <th className="px-4 py-3 text-left font-medium">RC</th>
                  <th className="px-4 py-3 text-left font-medium">PUC</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {vehicles.map((v) => (
                  <tr key={v.id} className="transition hover:bg-secondary/30">
                    <td className="px-6 py-4"><Checkbox /></td>
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-14 place-items-center rounded-xl bg-secondary text-xl">
                          {v.image}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium">{v.number}</div>
                          <div className="text-xs text-muted-foreground">{v.name} · {v.manufacturer}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{v.type}</td>
                    <td className="px-4 py-4 font-medium">{v.capacity}</td>
                    <td className="px-4 py-4">{v.driver}</td>
                    <td className="px-4 py-4">{docPill(v.insurance)}</td>
                    <td className="px-4 py-4">{docPill(v.rc)}</td>
                    <td className="px-4 py-4">{docPill(v.puc)}</td>
                    <td className="px-4 py-4">
                      {v.status === "on-trip" && <StatusPill tone="primary">On Trip</StatusPill>}
                      {v.status === "available" && <StatusPill tone="success">Available</StatusPill>}
                      {v.status === "maintenance" && <StatusPill tone="warning">Maintenance</StatusPill>}
                      {v.status === "inactive" && <StatusPill tone="muted">Inactive</StatusPill>}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View details</DropdownMenuItem>
                          <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border/70 px-6 py-3 text-xs text-muted-foreground">
            <span>Showing 1–{vehicles.length} of 84 vehicles</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg">Previous</Button>
              <Button variant="outline" size="sm" className="rounded-lg">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
