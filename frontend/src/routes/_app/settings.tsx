import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, ShieldCheck, Bell, Palette, Check } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings & RBAC — TransitOps" }] }),
});

const users = [
  { name: "Arjun Rao", email: "arjun@transitops.io", role: "Admin", status: "Active" },
  { name: "Meera Iyer", email: "meera@transitops.io", role: "Fleet Manager", status: "Active" },
  { name: "Karan Malhotra", email: "karan@transitops.io", role: "Fleet Manager", status: "Invited" },
  { name: "Rajesh Kumar", email: "rajesh@transitops.io", role: "Driver", status: "Active" },
  { name: "Priya Nair", email: "priya@transitops.io", role: "Driver", status: "Active" },
];

const permissions = [
  { module: "Vehicles", admin: true, manager: true, driver: false },
  { module: "Drivers", admin: true, manager: true, driver: false },
  { module: "Trips", admin: true, manager: true, driver: true },
  { module: "Maintenance", admin: true, manager: true, driver: false },
  { module: "Fuel & Expenses", admin: true, manager: true, driver: true },
  { module: "Reports", admin: true, manager: true, driver: false },
  { module: "Billing & RBAC", admin: true, manager: false, driver: false },
];

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Access Control"
        description="Configure your organization, roles, and system preferences."
      />

      <Tabs defaultValue="org" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 rounded-xl bg-secondary p-1">
          <TabsTrigger value="org" className="rounded-lg"><Building2 className="mr-1.5 h-4 w-4" />Organization</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg">Users & Roles</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg"><ShieldCheck className="mr-1.5 h-4 w-4" />Security</TabsTrigger>
          <TabsTrigger value="prefs" className="rounded-lg"><Palette className="mr-1.5 h-4 w-4" />Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="org">
          <Card className="rounded-2xl shadow-soft">
            <CardHeader><CardTitle className="text-base">Organization Profile</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field label="Organization name" defaultValue="TransitOps Logistics Pvt Ltd" />
              <Field label="GST number" defaultValue="27AABCT1234N1Z5" />
              <Field label="Registered address" defaultValue="Andheri East, Mumbai 400069" />
              <Field label="Contact email" defaultValue="ops@transitops.io" />
              <Field label="Phone" defaultValue="+91 22 4488 2100" />
              <Field label="Fleet size" defaultValue="84 vehicles" />
              <div className="md:col-span-2 flex justify-end">
                <Button className="rounded-xl">Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="rounded-2xl shadow-soft">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Team Members</CardTitle>
              <Button size="sm" className="rounded-lg">Invite user</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border/70 bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-3 text-left font-medium">User</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {users.map((u) => (
                    <tr key={u.email} className="hover:bg-secondary/30">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{u.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                          <div><div className="font-medium">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><StatusPill tone="primary">{u.role}</StatusPill></td>
                      <td className="px-4 py-3.5"><StatusPill tone={u.status === "Active" ? "success" : "warning"}>{u.status}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-soft">
            <CardHeader><CardTitle className="text-base">Role Permissions</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border/70 bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-3 text-left font-medium">Module</th>
                    <th className="px-4 py-3 text-center font-medium">Admin</th>
                    <th className="px-4 py-3 text-center font-medium">Fleet Manager</th>
                    <th className="px-4 py-3 text-center font-medium">Driver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {permissions.map((p) => (
                    <tr key={p.module}>
                      <td className="px-6 py-3.5 font-medium">{p.module}</td>
                      <td className="px-4 py-3.5 text-center">{p.admin ? <Check className="inline h-4 w-4 text-success" /> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3.5 text-center">{p.manager ? <Check className="inline h-4 w-4 text-success" /> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3.5 text-center">{p.driver ? <Check className="inline h-4 w-4 text-success" /> : <span className="text-muted-foreground">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="rounded-2xl shadow-soft">
            <CardHeader><CardTitle className="text-base">Security</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Current password" type="password" defaultValue="********" />
                <div />
                <Field label="New password" type="password" placeholder="Minimum 8 characters" />
                <Field label="Confirm new password" type="password" placeholder="Re-enter" />
              </div>
              <Toggle label="Two-factor authentication" desc="Require an authenticator app on sign-in" defaultChecked />
              <Toggle label="Session timeout" desc="Automatically sign out after 30 minutes idle" defaultChecked />
              <Toggle label="Audit log" desc="Track all admin actions for compliance" defaultChecked />
              <div className="flex justify-end"><Button className="rounded-xl">Update security</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prefs">
          <Card className="rounded-2xl shadow-soft">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications & Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <Toggle label="Trip status alerts" desc="Get notified when trips start, complete or delay" defaultChecked />
              <Toggle label="Maintenance reminders" desc="7 days before scheduled service" defaultChecked />
              <Toggle label="Document expiry alerts" desc="Insurance, RC, PUC and license renewals" defaultChecked />
              <Toggle label="Weekly analytics digest" desc="Executive summary every Monday" />
              <div className="grid gap-4 md:grid-cols-2 pt-2">
                <Field label="Language" defaultValue="English (India)" />
                <Field label="Time zone" defaultValue="Asia/Kolkata (GMT+5:30)" />
                <Field label="Date format" defaultValue="DD/MM/YYYY" />
                <Field label="Currency" defaultValue="INR (₹)" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
      <Input className="h-10 rounded-xl" {...rest} />
    </div>
  );
}

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/70 p-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
