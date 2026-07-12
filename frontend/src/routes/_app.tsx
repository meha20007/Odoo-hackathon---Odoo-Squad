import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";

export const Route = createFileRoute("/_app")({
  component: AppRoute,
});

function AppRoute() {
  return (
    <AuthGuard>
      <AppLayout />
    </AuthGuard>
  );
}
