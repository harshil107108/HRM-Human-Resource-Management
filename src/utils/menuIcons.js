import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  Database,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  ListTree,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  Timer,
  TrendingUp,
  Truck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";

// Icons a Menu Master group can use (stored on the menu by name).
export const MENU_ICONS = {
  LayoutDashboard,
  Database,
  Building2,
  Users,
  CalendarDays,
  CalendarCheck2,
  Wallet,
  BriefcaseBusiness,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Settings,
  ClipboardList,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  ListTree,
  Package,
  Receipt,
  Timer,
  Truck,
  UserCog,
  LayoutGrid,
};

export const DEFAULT_MENU_ICON = LayoutGrid;

export const getMenuIcon = (name) => MENU_ICONS[name] || DEFAULT_MENU_ICON;

// Options for the Menu Master icon dropdown.
export const MENU_ICON_OPTIONS = Object.keys(MENU_ICONS).map((name) => ({
  label: name.replace(/([a-z])([A-Z0-9])/g, "$1 $2"),
  value: name,
}));
