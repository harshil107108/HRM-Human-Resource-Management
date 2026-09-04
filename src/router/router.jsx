import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";

import UnderConstruction from "../components/Ui/UnderConstuction";
import Company from "@pages/Organization/company/Company";
import CompanyListing from "@pages/Organization/company/CompanyListing";
import BranchListing from "@pages/Organization/Branch/BranchListing";
import Branch from "@pages/Organization/Branch/Branch";
import DepartmentListing from "@/pages/Organization/Departments/DepartmentListing";
import Department from "@/pages/Organization/Departments/Department";
import DesignationListing from "@/pages/Organization/Designation/DesignationListing";
import Designation from "@/pages/Organization/Designation/Designation";
import CountryMasterListing from "@/pages/Master/CountryMaster/CountryMasterListing";
import StateMasterListing from "@/pages/Master/StateMaster/StateMasterListing";
import CityMasterListing from "@/pages/Master/CityMaster/CityMasterListing";
import HolidayMasterListing from "@/pages/Master/HolidayMaster/HolidayMasterListing";
import EmployeeListing from "@/pages/Employee/EmployeeDirectory/EmployeeListing";
import Employee from "@/pages/Employee/EmployeeDirectory/Employee";
import BankMasterListing from "@/pages/Master/BankMaster/BankMasterListing";
import AssetListing from "@/pages/Employee/Asset/AssetListing";
import Asset from "@/pages/Employee/Asset/Asset";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },

      // ============================================
      // Dashboard
      // ============================================

      {
        path: "dashboard",
        element: <Dashboard />,
      },

      // ============================================
      // Master Setup
      // ============================================

      {
        path: "master/countries",
        element: <CountryMasterListing />,
      },
      {
        path: "master/states",
        element: <StateMasterListing />,
      },
      {
        path: "master/cities",
        element: <CityMasterListing />,
      },
      {
        path: "master/holidays",
        element: <HolidayMasterListing />,
      },
      {
        path: "master/bank",
        element: <BankMasterListing />,
      },

      // ============================================
      // Organization
      // ============================================

      {
        path: "organization/companies",
        children: [
          {
            index: true,
            element: <CompanyListing />,
          },
          {
            path: "addedit",
            element: <Company />,
          },
        ],
      },
      {
        path: "organization/branches",
        children: [
          {
            index: true,
            element: <BranchListing />,
          },
          {
            path: "addedit",
            element: <Branch />,
          },
        ],
      },
      {
        path: "organization/departments",
        children: [
          {
            index: true,
            element: <DepartmentListing />,
          },
          {
            path: "addedit",
            element: <Department />,
          },
        ],
      },
      {
        path: "organization/designations",
        children: [
          {
            index: true,
            element: <DesignationListing />,
          },
          {
            path: "addedit",
            element: <Designation />,
          },
        ],
      },

      // ============================================
      // Employees
      // ============================================

      {
        path: "employees/directory",
        children: [
          {
            index: true,
            element: <EmployeeListing />,
          },
          {
            path: "addedit",
            element: <Employee />,
          },
        ],
      },
      {
        path: "employees/profiles",
        element: <UnderConstruction moduleName="Employee Profiles" />,
      },
      {
        path: "employees/documents",
        element: <UnderConstruction moduleName="Employee Documents" />,
      },
      {
        path: "employees/assets",
        children: [
          {
            index: true,
            element: <AssetListing />,
          },
          {
            path: "addedit",
            element: <Asset />,
          },
        ],
      },
      {
        path: "employees/exit",
        element: <UnderConstruction moduleName="Exit Management" />,
      },

      // ============================================
      // Attendance
      // ============================================

      {
        path: "attendance/logs",
        element: <UnderConstruction moduleName="Attendance Logs" />,
      },
      {
        path: "attendance/shifts",
        element: <UnderConstruction moduleName="Shift Management" />,
      },
      {
        path: "attendance/holidays",
        element: <UnderConstruction moduleName="Holiday Calendar" />,
      },
      {
        path: "attendance/weekends",
        element: <UnderConstruction moduleName="Weekend Policies" />,
      },
      {
        path: "attendance/requests",
        element: <UnderConstruction moduleName="Attendance Requests" />,
      },

      // ============================================
      // Leave
      // ============================================

      {
        path: "leave/requests",
        element: <UnderConstruction moduleName="Leave Requests" />,
      },
      {
        path: "leave/types",
        element: <UnderConstruction moduleName="Leave Types" />,
      },
      {
        path: "leave/policies",
        element: <UnderConstruction moduleName="Leave Policies" />,
      },
      {
        path: "leave/balance",
        element: <UnderConstruction moduleName="Leave Balance" />,
      },

      // ============================================
      // Payroll
      // ============================================

      {
        path: "payroll/salary-structure",
        element: <UnderConstruction moduleName="Salary Structure" />,
      },
      {
        path: "payroll/process",
        element: <UnderConstruction moduleName="Payroll Processing" />,
      },
      {
        path: "payroll/payslips",
        element: <UnderConstruction moduleName="Payslips" />,
      },
      {
        path: "payroll/loans",
        element: <UnderConstruction moduleName="Loan Management" />,
      },
      {
        path: "payroll/reimbursements",
        element: <UnderConstruction moduleName="Reimbursements" />,
      },
      {
        path: "payroll/taxes",
        element: <UnderConstruction moduleName="Tax Management" />,
      },

      // ============================================
      // Recruitment
      // ============================================

      {
        path: "recruitment/jobs",
        element: <UnderConstruction moduleName="Job Openings" />,
      },
      {
        path: "recruitment/candidates",
        element: <UnderConstruction moduleName="Candidates" />,
      },
      {
        path: "recruitment/interviews",
        element: <UnderConstruction moduleName="Interview Scheduler" />,
      },
      {
        path: "recruitment/offers",
        element: <UnderConstruction moduleName="Offer Letters" />,
      },
      {
        path: "recruitment/onboarding",
        element: <UnderConstruction moduleName="Employee Onboarding" />,
      },

      // ============================================
      // Performance
      // ============================================

      {
        path: "performance/goals",
        element: <UnderConstruction moduleName="Goals" />,
      },
      {
        path: "performance/reviews",
        element: <UnderConstruction moduleName="Performance Reviews" />,
      },
      {
        path: "performance/appraisals",
        element: <UnderConstruction moduleName="Appraisals" />,
      },
      {
        path: "performance/feedback",
        element: <UnderConstruction moduleName="Feedback" />,
      },

      // ============================================
      // Reports
      // ============================================

      {
        path: "reports/employees",
        element: <UnderConstruction moduleName="Employee Reports" />,
      },
      {
        path: "reports/attendance",
        element: <UnderConstruction moduleName="Attendance Reports" />,
      },
      {
        path: "reports/payroll",
        element: <UnderConstruction moduleName="Payroll Reports" />,
      },
      {
        path: "reports/leave",
        element: <UnderConstruction moduleName="Leave Reports" />,
      },
      {
        path: "reports/recruitment",
        element: <UnderConstruction moduleName="Recruitment Reports" />,
      },

      // ============================================
      // Administration
      // ============================================

      {
        path: "administration/users",
        element: <UnderConstruction moduleName="User Management" />,
      },
      {
        path: "administration/roles",
        element: <UnderConstruction moduleName="Roles & Permissions" />,
      },
      {
        path: "administration/permissions",
        element: <UnderConstruction moduleName="Permissions" />,
      },
      {
        path: "administration/audit-logs",
        element: <UnderConstruction moduleName="Audit Logs" />,
      },
      {
        path: "administration/activity-logs",
        element: <UnderConstruction moduleName="Activity Logs" />,
      },

      // ============================================
      // Settings
      // ============================================

      {
        path: "settings/general",
        element: <UnderConstruction moduleName="General Settings" />,
      },
      {
        path: "settings/notifications",
        element: <UnderConstruction moduleName="Notification Settings" />,
      },
      {
        path: "settings/email",
        element: <UnderConstruction moduleName="Email Templates" />,
      },
      {
        path: "settings/integrations",
        element: <UnderConstruction moduleName="Integrations" />,
      },
      {
        path: "settings/security",
        element: <UnderConstruction moduleName="Security Settings" />,
      },
    ],
  },

  {
    path: "*",
    element: <UnderConstruction moduleName="404 - Page Not Found" />,
  },
]);

export default router;
