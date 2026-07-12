import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, Download, Star, Phone, ShieldCheck, Award, Calendar, Filter } from "lucide-react";
import { drivers, type DriverStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/drivers")({
  component: DriversPage,
  head: () => ({ meta: [{ title: "Driver & Safety — TransitOps" }] }),
});

const statusTone: Record<DriverStatus, "success" | "primary" | "muted" | "warning"> = {
  available: "success",
  "on-duty": "primary",
  "off-duty": "muted",
  "on-leave": "warning",
};

const statusLabel: Record<DriverStatus, string> = {
  available: "Available",
  "on-duty": "On Duty",
  "off-duty": "Off Duty",
  "on-leave": "On Leave",
};

function DriversPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver & Safety Profiles"
        description="Track licensing, safety scores, and trip performance for every driver."
        actions={
          <>
            <Button variant="outline" className="gap-1.5 rounded-xl">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button className="gap-1.5 rounded-xl">
              <Plus className="h-4 w-4" /> Add Driver
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search drivers, license or phone…" className="h-10 rounded-xl bg-background pl-9" />
        </div>
        <Button variant="outline" className="h-10 gap-1.5 rounded-xl">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {drivers.map((d) => (
          <Card key={d.id} className="group rounded-2xl shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                    {d.photo}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-base font-semibold">{d.name}</h3>
                    <StatusPill tone={statusTone[d.status]}>{statusLabel[d.status]}</StatusPill>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{d.id}</span>
                    <span>·</span>
                    <span>{d.experience} yrs exp.</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.round(d.safetyRating) ? "fill-primary text-primary" : "text-border"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-medium">{d.safetyRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <Row icon={ShieldCheck} label="License" value={`${d.license.slice(0, 6)}··· · exp ${d.licenseExpiry}`} />
                <Row icon={Phone} label="Contact" value={d.phone} />
                <Row icon={Calendar} label="Vehicle" value={d.vehicle} />
                <Row icon={Award} label="Trips completed" value={`${d.trips} trips · ${d.violations} violations`} />
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Driving Score</span>
                  <span className="font-semibold">{d.score}/100</span>
                </div>
                <Progress value={d.score} className="h-1.5" />
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-lg">View profile</Button>
                <Button size="sm" className="flex-1 rounded-lg">Assign trip</Button>
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
