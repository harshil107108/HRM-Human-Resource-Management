import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  CalendarCheck2,
  Wallet,
  BriefcaseBusiness,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Briefcase,
  TrendingUp,
  GraduationCap,
  Package,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import companyLogo from "@assets/images/companyLogo.png";
import Logo from "@assets/images/Logo.png";

// ==========================================
// DATA ARCHITECTURE
// ==========================================

export const NAVIGATION_SCHEMA = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },

  // =========================
  // Organization Setup
  // =========================
  {
    label: "Organization",
    icon: Building2,
    path: "/organization",
    children: [
      {
        label: "Companies",
        path: "/organization/companies",
      },
      {
        label: "Branches",
        path: "/organization/branches",
      },
      {
        label: "Departments",
        path: "/organization/departments",
      },
      {
        label: "Designations",
        path: "/organization/designations",
      },
      {
        label: "Locations",
        path: "/organization/locations",
      },
      {
        label: "Business Units",
        path: "/organization/business-units",
      },
      {
        label: "Cost Centers",
        path: "/organization/cost-centers",
      },
    ],
  },

  // =========================
  // Employee Management
  // =========================
  {
    label: "Employees",
    icon: Users,
    path: "/employees",
    children: [
      {
        label: "Employee Directory",
        path: "/employees/directory",
      },
      {
        label: "Employee Profiles",
        path: "/employees/profiles",
      },
      {
        label: "Documents",
        path: "/employees/documents",
      },
      {
        label: "Assets",
        path: "/employees/assets",
      },
      {
        label: "Exit Management",
        path: "/employees/exit",
      },
    ],
  },

  // =========================
  // Attendance
  // =========================
  {
    label: "Attendance",
    icon: CalendarDays,
    path: "/attendance",
    children: [
      {
        label: "Attendance Logs",
        path: "/attendance/logs",
      },
      {
        label: "Shift Management",
        path: "/attendance/shifts",
      },
      {
        label: "Holiday Calendar",
        path: "/attendance/holidays",
      },
      {
        label: "Weekend Policies",
        path: "/attendance/weekends",
      },
      {
        label: "Attendance Requests",
        path: "/attendance/requests",
      },
    ],
  },

  // =========================
  // Leave
  // =========================
  {
    label: "Leave Management",
    icon: CalendarCheck2,
    path: "/leave",
    children: [
      {
        label: "Leave Requests",
        path: "/leave/requests",
      },
      {
        label: "Leave Types",
        path: "/leave/types",
      },
      {
        label: "Leave Policies",
        path: "/leave/policies",
      },
      {
        label: "Leave Balance",
        path: "/leave/balance",
      },
    ],
  },

  // =========================
  // Payroll
  // =========================
  {
    label: "Payroll",
    icon: Wallet,
    path: "/payroll",
    children: [
      {
        label: "Salary Structure",
        path: "/payroll/salary-structure",
      },
      {
        label: "Payroll Processing",
        path: "/payroll/process",
      },
      {
        label: "Payslips",
        path: "/payroll/payslips",
      },
      {
        label: "Loans",
        path: "/payroll/loans",
      },
      {
        label: "Reimbursements",
        path: "/payroll/reimbursements",
      },
      {
        label: "Tax Management",
        path: "/payroll/taxes",
      },
    ],
  },

  // =========================
  // Recruitment
  // =========================
  {
    label: "Recruitment",
    icon: BriefcaseBusiness,
    path: "/recruitment",
    children: [
      {
        label: "Job Openings",
        path: "/recruitment/jobs",
      },
      {
        label: "Candidates",
        path: "/recruitment/candidates",
      },
      {
        label: "Interviews",
        path: "/recruitment/interviews",
      },
      {
        label: "Offer Letters",
        path: "/recruitment/offers",
      },
      {
        label: "Onboarding",
        path: "/recruitment/onboarding",
      },
    ],
  },

  // =========================
  // Performance
  // =========================
  {
    label: "Performance",
    icon: TrendingUp,
    path: "/performance",
    children: [
      {
        label: "Goals",
        path: "/performance/goals",
      },
      {
        label: "Reviews",
        path: "/performance/reviews",
      },
      {
        label: "Appraisals",
        path: "/performance/appraisals",
      },
      {
        label: "Feedback",
        path: "/performance/feedback",
      },
    ],
  },

  // =========================
  // Learning
  // =========================
  {
    label: "Learning",
    icon: GraduationCap,
    path: "/learning",
    children: [
      {
        label: "Courses",
        path: "/learning/courses",
      },
      {
        label: "Training",
        path: "/learning/training",
      },
      {
        label: "Certificates",
        path: "/learning/certificates",
      },
    ],
  },

  // =========================
  // Reports
  // =========================
  {
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
    children: [
      {
        label: "Employee Reports",
        path: "/reports/employees",
      },
      {
        label: "Attendance Reports",
        path: "/reports/attendance",
      },
      {
        label: "Payroll Reports",
        path: "/reports/payroll",
      },
      {
        label: "Leave Reports",
        path: "/reports/leave",
      },
      {
        label: "Recruitment Reports",
        path: "/reports/recruitment",
      },
    ],
  },

  // =========================
  // Administration
  // =========================
  {
    label: "Administration",
    icon: ShieldCheck,
    path: "/administration",
    children: [
      {
        label: "Users",
        path: "/administration/users",
      },
      {
        label: "Roles",
        path: "/administration/roles",
      },
      {
        label: "Permissions",
        path: "/administration/permissions",
      },
      {
        label: "Audit Logs",
        path: "/administration/audit-logs",
      },
      {
        label: "Activity Logs",
        path: "/administration/activity-logs",
      },
    ],
  },

  // =========================
  // Settings
  // =========================
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
    children: [
      {
        label: "General",
        path: "/settings/general",
      },
      {
        label: "Notifications",
        path: "/settings/notifications",
      },
      {
        label: "Email Templates",
        path: "/settings/email",
      },
      {
        label: "Integrations",
        path: "/settings/integrations",
      },
      {
        label: "Security",
        path: "/settings/security",
      },
    ],
  },
];
// ==========================================
// SUB-COMPONENTS
// ==========================================

const ParentMenuItem = ({
  icon: Icon,
  label,
  isCollapsed,
  isExpanded,
  hasChildren,
  isActive,
  onClick,
  path,
}) => {
  const content = (
    <button
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`w-full flex items-center rounded-md text-[13px] transition-all duration-150 font-medium ${isCollapsed ? "justify-center p-2" : "gap-2.5 px-2.5 py-1.5"
        } ${isActive && !hasChildren
          ? "bg-blue-50/70 text-blue-600 font-semibold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
    >
      <Icon
        className={`w-4 h-4 shrink-0 transition-colors ${isActive
          ? "text-blue-600"
          : "text-slate-400 group-hover:text-slate-600"
          }`}
      />

      {!isCollapsed && (
        <span className="flex-1 truncate text-left">{label}</span>
      )}

      {!isCollapsed && hasChildren && (
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isExpanded ? "transform rotate-180" : ""
            }`}
        />
      )}
    </button>
  );

  if (!hasChildren && path) {
    return (
      <NavLink to={path} className="block">
        {() => content}
      </NavLink>
    );
  }

  return content;
};

const NestedSubMenu = ({ children, isCollapsed }) => {
  if (isCollapsed) return null;
  return (
    <ul className="mt-1 pl-4 border-l border-slate-100 ml-4 space-y-1 transition-all duration-200">
      {children.map((sub, index) => (
        <li key={index}>
          <NavLink
            to={sub.path}
            className={({ isActive }) =>
              `block px-3 py-1 text-[12px] font-medium rounded-md transition-all duration-150 ${isActive
                ? "bg-slate-100 text-slate-900 font-semibold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`
            }
          >
            {sub.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

// ==========================================
// MAIN SIDEBAR
// ==========================================

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    const activeGroup = NAVIGATION_SCHEMA.find(
      (item) =>
        item.children &&
        item.children.some((child) => location.pathname.startsWith(child.path)),
    );
    if (activeGroup) {
      setExpandedGroups((prev) => ({
        ...prev,
        [activeGroup.label]: true,
      }));
    }
  }, [location.pathname]);

  const handleGroupToggle = (label) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedGroups({ [label]: true });
      return;
    }

    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside
      className={`hidden lg:flex h-screen sticky top-0 bg-white border-r border-slate-200/80 flex-col pb-4 z-40 shrink-0 transition-all duration-300 ease-in-out relative ${isCollapsed ? "w-14" : "w-56"
        }`}
    >
      {/* Brand Header */}
      <div
        className={`h-14 px-4 flex items-center border-b border-slate-100/80 overflow-hidden ${isCollapsed ? "justify-center" : "justify-between"
          }`}
      >
        <div className="flex items-center overflow-hidden">
          {isCollapsed ? (
            <img
              src={Logo}
              alt="Orvexa"
              className="w-9 h-9 object-contain mx-auto"
            />
          ) : (
            <img
              src={companyLogo}
              alt="Orvexa Enterprise HRM"
              className="h-20 w-auto object-contain"
            />
          )}
        </div>

        {/* Expand/Shrink Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-[-10px] top-4 p-0.5 bg-white border border-slate-200 hover:border-slate-300 rounded-full shadow-sm hover:bg-slate-50 transition-all z-50 text-slate-400 hover:text-slate-600"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav Menu */}
      <nav
        className={`flex-1 overflow-y-auto pt-3 ${isCollapsed ? "px-1.5" : "px-3"}`}
      >
        <ul className="space-y-0.5">
          {NAVIGATION_SCHEMA.map((item, index) => {
            const hasChildren = !!item.children;
            const isGroupActive = hasChildren
              ? item.children.some((child) =>
                location.pathname.startsWith(child.path),
              )
              : location.pathname === item.path;

            const isGroupExpanded = !!expandedGroups[item.label];

            return (
              <li key={index} className="space-y-0.5">
                <ParentMenuItem
                  icon={item.icon}
                  label={item.label}
                  isCollapsed={isCollapsed}
                  isExpanded={isGroupExpanded}
                  hasChildren={hasChildren}
                  isActive={isGroupActive}
                  path={item.path}
                  onClick={() => hasChildren && handleGroupToggle(item.label)}
                />
                {hasChildren && isGroupExpanded && (
                  <NestedSubMenu
                    children={item.children}
                    isCollapsed={isCollapsed}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
