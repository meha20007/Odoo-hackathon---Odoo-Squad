import { Link, useRouterState, Outlet, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route as RouteIcon,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Plus,
  Menu,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthGuard";
import { authApi, initials } from "@/lib/transitops-api";
import { toast } from "sonner";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vehicles", label: "Vehicle Registry", icon: Truck },
  { to: "/drivers", label: "Driver & Safety", icon: Users },
  { to: "/trips", label: "Trip Dispatcher", icon: RouteIcon },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/fuel", label: "Fuel & Expenses", icon: Fuel },
  { to: "/reports", label: "Reports & Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings & RBAC", icon: Settings },
] as const;

const crumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  vehicles: "Vehicle Registry",
  drivers: "Driver & Safety",
  trips: "Trip Dispatcher",
  maintenance: "Maintenance",
  fuel: "Fuel & Expenses",
  reports: "Reports & Analytics",
  settings: "Settings & RBAC",
};

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: authData } = useAuth();
  const user = authData?.user;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const segments = pathname.split("/").filter(Boolean);
  const pageTitle = crumbMap[segments[0]] ?? "Dashboard";

  async function handleLogout() {
    try {
      await authApi.logout();
      queryClient.clear();
      toast.success("Signed out successfully");
      navigate({ to: "/auth" });
    } catch {
      toast.error("Could not sign out");
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-secondary/60">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-[76px]" : "w-[248px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary shadow-soft">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[15px] font-semibold tracking-tight text-white">TransitOps</div>
              <div className="truncate text-[11px] text-sidebar-foreground/60">Fleet Intelligence</div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          {!collapsed && (
            <div className="mb-3 rounded-xl bg-sidebar-accent/60 p-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI Insights
              </div>
              <p className="mt-1.5 text-xs text-sidebar-foreground/70">
                4 vehicles predicted to need service in 7 days.
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div
        className={cn(
          "flex min-h-screen w-full flex-col transition-all duration-300",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[248px]",
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={() => setCollapsed((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground md:flex">
            <span>TransitOps</span>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vehicles, drivers, trips…"
              className="h-10 rounded-xl border-border bg-secondary/70 pl-9 pr-16 text-sm focus-visible:bg-background"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
              ⌘K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="hidden gap-1.5 rounded-xl md:inline-flex">
              <Plus className="h-4 w-4" /> Quick Action
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-secondary">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {initials(user?.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left md:block">
                    <div className="text-sm font-medium leading-tight">{user?.name || "User"}</div>
                    <div className="text-[11px] text-muted-foreground">{user?.role || "Member"}</div>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Organization</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground lg:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "muted" | "primary" | "info";
  children: React.ReactNode;
}) {
  const map = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    info: "bg-chart-5/10 text-chart-5",
  } as const;
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", map[tone])}>
      {children}
    </Badge>
  );
}
