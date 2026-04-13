"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useCurrentUser } from "@/hooks/use-auth";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  useEffect(() => {
    if (isError) {
      router.replace("/login");
    }
  }, [isError, router]);

  if (!checked || isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
