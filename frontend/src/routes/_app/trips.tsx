import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, MapPin, Navigation, Clock, Package, Route as RouteIcon, Filter } from "lucide-react";
import { trips, drivers, vehicles } from "@/lib/mock-data";
import { TripStatusPill } from "./dashboard";

export const Route = createFileRoute("/_app/trips")({
  component: TripsPage,
  head: () => ({ meta: [{ title: "Trip Dispatcher — TransitOps" }] }),
});

function TripsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip Dispatcher"
        description="Plan, dispatch, and track every trip across your fleet in real time."
        actions={<Button className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> New Trip</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Map placeholder + trips table */}
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl shadow-soft">
            <div className="relative h-72 w-full bg-sidebar">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar/80 to-primary/20" />
              {/* faux route */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                <path d="M60 240 Q 220 60 400 160 T 740 80" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray="8 6" fill="none" strokeLinecap="round" />
                <circle cx="60" cy="240" r="8" fill="var(--color-primary)" />
                <circle cx="740" cy="80" r="8" fill="white" stroke="var(--color-primary)" strokeWidth="3" />
              </svg>
              <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium shadow-soft">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> 27 vehicles live
              </div>
              <div className="absolute bottom-6 left-6 space-y-2">
                <div className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs shadow-soft">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <div>
                    <div className="font-semibold">Mumbai, MH</div>
                    <div className="text-[10px] text-muted-foreground">Pickup</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs shadow-soft">
                  <Navigation className="h-3.5 w-3.5 text-primary" />
                  <div>
                    <div className="font-semibold">Pune, MH</div>
                    <div className="text-[10px] text-muted-foreground">Destination · 148 km</div>
                  </div>
                </div>
              </div>
              <div className="absolute right-6 top-6 rounded-xl bg-white/95 px-3 py-2 text-xs shadow-soft">
                <div className="text-[10px] text-muted-foreground">ETA</div>
                <div className="font-semibold">2h 15m</div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl shadow-soft">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">All Trips</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">{trips.length} trips this week</p>
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
                      <th className="px-4 py-3 text-left font-medium">ETA</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {trips.map((t) => (
                      <tr key={t.id} className="transition hover:bg-secondary/30">
                        <td className="px-6 py-3.5 font-medium">{t.id}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium">{t.pickup}</div>
                          <div className="text-xs text-muted-foreground">→ {t.destination}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div>{t.driver}</div>
                          <div className="text-xs text-muted-foreground">{t.vehicle}</div>
                        </td>
                        <td className="px-4 py-3.5">{t.distance} km</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{t.eta}</td>
                        <td className="px-4 py-3.5"><TripStatusPill status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create trip form */}
        <Card className="rounded-2xl shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Create Trip</CardTitle>
            <p className="text-xs text-muted-foreground">Dispatch a new shipment in seconds</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <FormField label="Pickup location" icon={MapPin}>
                <Input placeholder="Mumbai, MH" className="pl-9" />
              </FormField>
              <FormField label="Destination" icon={Navigation}>
                <Input placeholder="Pune, MH" className="pl-9" />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Scheduled at</label>
                  <Input type="datetime-local" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Distance</label>
                  <Input placeholder="148 km" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Vehicle</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Assign vehicle" /></SelectTrigger>
                  <SelectContent>
                    {vehicles.slice(0, 5).map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.number} · {v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Driver</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Assign driver" /></SelectTrigger>
                  <SelectContent>
                    {drivers.slice(0, 5).map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} · ★ {d.safetyRating}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FormField label="Cargo notes" icon={Package}>
                <Textarea placeholder="Electronics · 18 T · handle with care" className="pl-9" rows={3} />
              </FormField>
            </div>

            <Button className="w-full rounded-xl gap-1.5">
              <RouteIcon className="h-4 w-4" /> Dispatch Trip
            </Button>

            <div className="rounded-xl border border-dashed border-border p-3 text-xs">
              <div className="mb-2 flex items-center gap-2 font-semibold text-primary">
                <Clock className="h-3.5 w-3.5" /> Trip Timeline
              </div>
              <ol className="space-y-1.5 text-muted-foreground">
                <li>• 09:20 — Trip created & dispatched</li>
                <li>• 09:35 — Vehicle checked in at pickup</li>
                <li>• 10:12 — En route to destination</li>
                <li>• 12:30 — Estimated arrival (ETA)</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
