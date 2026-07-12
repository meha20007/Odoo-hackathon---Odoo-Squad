import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Truck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  MapPin,
  Fuel,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [{ title: "Sign in — TransitOps" }],
  }),
});

function AuthPage() {
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [role, setRole] = useState("manager");

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.05fr_1fr]">
      {/* Left — illustration */}
      <div className="relative hidden overflow-hidden bg-sidebar text-white lg:block">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary shadow-soft">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">TransitOps</div>
              <div className="text-xs text-white/60">Fleet Intelligence Platform</div>
            </div>
          </div>

          <div className="max-w-lg">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered fleet operations
            </div>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
              Run your fleet like the top 1% of logistics operators.
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-white/70">
              Dispatch trips, monitor drivers, schedule maintenance, and track every liter
              of fuel — from a single command center trusted by modern logistics teams.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { icon: MapPin, label: "Live trip tracking" },
                { icon: ShieldCheck, label: "Driver safety scoring" },
                { icon: Fuel, label: "Fuel & expense audit" },
                { icon: BarChart3, label: "Predictive analytics" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/50">
            <span>© 2026 TransitOps Inc.</span>
            <span>SOC 2 · ISO 27001</span>
            <span>99.99% uptime</span>
          </div>
        </div>
      </div>

      {/* Right — auth card */}
      <div className="flex items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-lg font-semibold tracking-tight">TransitOps</div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 rounded-xl bg-secondary p-1">
              <TabsTrigger value="login" className="rounded-lg">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to access your fleet command center.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Signed in — welcome to TransitOps");
                }}
                className="space-y-4"
              >
                <Field label="Work email" icon={Mail}>
                  <Input type="email" placeholder="you@company.com" defaultValue="arjun@transitops.io" className="h-11 pl-10" required />
                </Field>
                <Field label="Password" icon={Lock}>
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    defaultValue="password"
                    className="h-11 pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <Checkbox defaultChecked /> Remember me
                  </label>
                  <button type="button" className="font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>

                <Button asChild size="lg" className="h-11 w-full rounded-xl text-[15px] font-semibold">
                  <Link to="/dashboard">
                    Sign in <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Protected by enterprise-grade encryption · SSO ready
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Create your account</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start managing your fleet in under 60 seconds.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Account created — check your inbox to verify");
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 block text-xs font-medium">First name</Label>
                    <Input className="h-11" placeholder="Arjun" required />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs font-medium">Last name</Label>
                    <Input className="h-11" placeholder="Rao" required />
                  </div>
                </div>
                <Field label="Work email" icon={Mail}>
                  <Input type="email" placeholder="you@company.com" className="h-11 pl-10" required />
                </Field>
                <Field label="Password" icon={Lock}>
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    className="h-11 pl-10 pr-10"
                    minLength={8}
                    required
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>
                <Field label="Confirm password" icon={Lock}>
                  <Input
                    type={showCpw ? "text" : "password"}
                    placeholder="Re-enter password"
                    className="h-11 pl-10 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowCpw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showCpw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>

                <div>
                  <Label className="mb-2 block text-xs font-medium">Select your role</Label>
                  <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-3 gap-2">
                    {[
                      { v: "admin", label: "Admin" },
                      { v: "manager", label: "Fleet Manager" },
                      { v: "driver", label: "Driver" },
                    ].map((r) => (
                      <label
                        key={r.v}
                        className={cn(
                          "cursor-pointer rounded-xl border p-3 text-center text-sm font-medium transition",
                          role === r.v
                            ? "border-primary bg-primary/5 text-primary shadow-soft"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <RadioGroupItem value={r.v} className="sr-only" />
                        {r.label}
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Checkbox className="mt-0.5" required />
                  I agree to the <a className="text-primary hover:underline">Terms</a> and{" "}
                  <a className="text-primary hover:underline">Privacy Policy</a>.
                </label>

                <Button asChild size="lg" className="h-11 w-full rounded-xl text-[15px] font-semibold">
                  <Link to="/dashboard">Create account</Link>
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Field({
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
      <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
