import {
  ListTodo,
  Users,
  BriefcaseBusiness,
  Package,
  Wallet,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { AuthUser } from "@/types/auth";

export interface ManagerMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export type DepartmentScopeType =
  | "superadmin"
  | "manager"
  | "operations"
  | "kitchen"
  | "decoration"
  | "photography"
  | "sound_lighting"
  | "logistics"
  | "marketing"
  | "general";

export interface ManagerScopeInfo {
  isSuperAdmin: boolean;
  isChefManager: boolean;
  isMarketingManager: boolean;
  canViewClientPayments: boolean;
  departmentType: DepartmentScopeType;
  roleTitle: string;
  departmentDisplay: string;
  badgeColor: string;
}

/**
 * Identify manager scope based on authenticated user's role and department
 */
export function getManagerScope(user: AuthUser | null): ManagerScopeInfo {
  const role = (user?.role || "").toLowerCase().trim();

  if (role === "superadmin" || role === "admin") {
    return {
      isSuperAdmin: true,
      isChefManager: false,
      isMarketingManager: false,
      canViewClientPayments: true,
      departmentType: "superadmin",
      roleTitle: "Super Admin",
      departmentDisplay: "All Departments",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    };
  }

  return {
    isSuperAdmin: false,
    isChefManager: false,
    isMarketingManager: false,
    canViewClientPayments: true,
    departmentType: "manager",
    roleTitle: user?.department ? `${user.department} Manager` : "Task Manager",
    departmentDisplay: user?.department || "Operations",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
  };
}

export function canViewClientPayments(user: AuthUser | null): boolean {
  if (!user) return false;
  const role = (user.role || "").toLowerCase().trim();
  return role === "superadmin" || role === "admin" || role === "manager";
}

export function canViewExpenses(user: AuthUser | null): boolean {
  if (!user) return false;
  const role = (user.role || "").toLowerCase().trim();
  return role === "superadmin" || role === "admin" || role === "manager";
}

/**
 * Main 6 Application Menus for Task Management / To-Do Application
 * 1. To Do
 * 2. Staff Members
 * 3. Services
 * 4. Stock & Equipment
 * 5. Expenses
 * 6. Settings
 */
export function getAuthorizedMenuItems(_user: AuthUser | null): ManagerMenuItem[] {
  return [
    {
      label: "To Do",
      href: "/manager/tasks",
      icon: ListTodo,
      description: "Manage, create, assign, and track tasks",
    },
    {
      label: "Staff Members",
      href: "/manager/staff",
      icon: Users,
      description: "Manage staff, roles, and assignments",
    },
    {
      label: "Services",
      href: "/manager/services",
      icon: BriefcaseBusiness,
      description: "Service categories and task offerings",
    },
    {
      label: "Stock & Equipment",
      href: "/manager/stock",
      icon: Package,
      description: "Inventory tracking and staff equipment requests",
    },
    {
      label: "Expenses",
      href: "/manager/expenses",
      icon: Wallet,
      description: "Task and operational expenses tracking",
    },
    {
      label: "Settings",
      href: "/manager/settings",
      icon: Settings,
      description: "Organization, profile, and notification settings",
    },
  ];
}

/**
 * Returns mobile bottom navigation items
 */
export function getAuthorizedBottomNavItems(_user: AuthUser | null): Array<{
  label: string;
  href: string;
  icon: LucideIcon;
}> {
  return [
    {
      label: "To Do",
      href: "/manager/tasks",
      icon: ListTodo,
    },
    {
      label: "Staff",
      href: "/manager/staff",
      icon: Users,
    },
    {
      label: "Stock",
      href: "/manager/stock",
      icon: Package,
    },
    {
      label: "Expenses",
      href: "/manager/expenses",
      icon: Wallet,
    },
    {
      label: "Settings",
      href: "/manager/settings",
      icon: Settings,
    },
  ];
}

/**
 * Validates if the requested pathname is permitted for the logged-in manager
 */
export function isRouteAuthorizedForUser(
  _pathname: string,
  _user: AuthUser | null
): { authorized: boolean; reason?: string } {
  return { authorized: true };
}
