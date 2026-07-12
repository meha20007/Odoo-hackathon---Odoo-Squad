import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, Download, Star, Phone, ShieldCheck, Award, Calendar, Filter } from "lucide-react";
import { useDrivers } from "@/hooks/use-api-data";
import { driverStatusTone, initials } from "@/lib/transitops-api";

export const Route = createFileRoute("/_app/drivers")({
  component: DriversPage,
  head: () => ({ meta: [{ title: "Driver & Safety — TransitOps" }] }),
});

function DriversPage() {
  const { data: drivers = [], isLoading } = useDrivers();

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading drivers…</div>;
  }

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
                    {initials(d.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-base font-semibold">{d.name}</h3>
                    <StatusPill tone={driverStatusTone(d.status)}>{d.status}</StatusPill>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{d.license_number}</span>
                    <span>·</span>
                    <span>{d.license_category}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < Math.round(d.safety_score / 20) ? "fill-warning text-warning" : "text-border"}`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-medium">{d.safety_score}/100</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-secondary/70 px-3 py-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {d.contact_number}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/70 px-3 py-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Exp: {d.license_expiry}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/70 px-3 py-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  {d.license_valid === false ? "License expired" : "License valid"}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/70 px-3 py-2">
                  <Award className="h-3.5 w-3.5 text-muted-foreground" />
                  {d.assignable ? "Assignable" : "Not assignable"}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Safety score</span>
                  <span className="font-medium">{d.safety_score}%</span>
                </div>
                <Progress value={d.safety_score} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {drivers.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">No drivers found. Run `python seed_data.py` on the backend.</p>
      )}
    </div>
  );
}
