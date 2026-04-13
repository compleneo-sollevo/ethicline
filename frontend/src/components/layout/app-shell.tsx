"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="!h-svh">
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <TopBar />
        <main className="flex-1 min-h-0 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
