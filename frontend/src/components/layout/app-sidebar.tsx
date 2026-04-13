"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { navigationGroups, type NavGroup } from "@/config/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ethicline-sidebar-sections";

function getInitialSections(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return Object.fromEntries(navigationGroups.map((g) => [g.title, true]));
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasPermission } = useAuthStore();
  const [sections, setSections] = React.useState<Record<string, boolean>>(getInitialSections);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    } catch {}
  }, [sections]);

  const toggleSection = (title: string) => {
    setSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || hasPermission(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            EL
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">ethicLine</span>
            <span className="text-xs text-muted-foreground">ethicLine GmbH</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {filteredGroups.map((group, groupIndex) => (
          <Collapsible
            key={group.title}
            open={sections[group.title] !== false}
            onOpenChange={() => toggleSection(group.title)}
          >
            <SidebarGroup>
              <SidebarGroupLabel
                className="cursor-pointer select-none hover:text-foreground transition-colors"
                onClick={() => toggleSection(group.title)}
              >
                <span>{group.title}</span>
                <ChevronDown
                  className={cn(
                    "ml-auto h-4 w-4 transition-transform duration-200",
                    sections[group.title] !== false ? "" : "-rotate-90"
                  )}
                />
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item, itemIndex) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <SidebarMenuItem
                          key={item.href}
                          style={{ animationDelay: `${itemIndex * 30}ms` }}
                        >
                          <Link href={item.href}>
                            <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{user?.full_name || "–"}</span>
            <span className="truncate text-xs text-muted-foreground">{user?.email || "–"}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 shrink-0">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
