import {
    BarChart3,
    BriefcaseBusiness,
    Building2,
    CalendarCheck2,
    CalendarDays,
    Database,
    GraduationCap,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    TrendingUp,
    Users,
    Wallet
} from "lucide-react";

export const NAVIGATION_SCHEMA = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },

  // =========================
  // Master Setup
  // =========================
  {
    label: "Master",
    icon: Database,
    path: "/master",
    children: [
      {
        label: "Country Master",
        path: "/master/countries",
      },
      {
        label: "State Master",
        path: "/master/states",
      },
      {
        label: "City Master",
        path: "/master/cities",
      },
      {
        label: "Holiday Master",
        path: "/master/holidays",
      },
      {
        label: "Department Master",
        path: "/master/departments",
      },
      {
        label: "Designation Master",
        path: "/master/designations",
      },
      
    ],
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