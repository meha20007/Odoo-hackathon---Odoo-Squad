import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authApi } from "@/lib/transitops-api";

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAuth();

  useEffect(() => {
    if (!isLoading && (isError || !data?.authenticated)) {
      navigate({ to: "/auth" });
    }
  }, [data, isError, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/60">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading TransitOps…</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.authenticated) {
    return null;
  }

  return <>{children}</>;
}
