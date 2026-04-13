import { LayoutDashboard, type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    title: "ÜBERSICHT",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard:read" },
    ],
  },
];
