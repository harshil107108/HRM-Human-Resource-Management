import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import { RequireAuth, PublicOnly, HomeRedirect } from "./RouteGuards";
import MenuMasterListing from "@/pages/Master/MenuMaster/MenuMasterListing";

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
import JobOpeningListing from "@/pages/Recruitment/Job Opening/JobOpeningListing";
import JobOpening from "@/pages/Recruitment/Job Opening/JobOpening";

// Employee Modules
import EmployeeProfiles from "@/pages/Employee/EmployeeProfiles";
import EmployeeDocuments from "@/pages/Employee/EmployeeDocuments";
import ExitManagementListing from "@/pages/Employee/ExitManagement/ExitManagementListing";

// Attendance Modules
import AttendanceLogListing from "@/pages/Attendance/Logs/AttendanceLogListing";
import ShiftListing from "@/pages/Attendance/Shifts/ShiftListing";
import AttendanceHolidayCalendar from "@/pages/Attendance/Holidays/AttendanceHolidayCalendar";
import AttendanceRequestListing from "@/pages/Attendance/Requests/AttendanceRequestListing";

// Leave Modules
import LeaveTypeListing from "@/pages/Leave/Types/LeaveTypeListing";
import LeavePolicyListing from "@/pages/Leave/Policies/LeavePolicyListing";
import LeaveRequestListing from "@/pages/Leave/Requests/LeaveRequestListing";
import LeaveApprovalListing from "@/pages/Leave/Approvals/LeaveApprovalListing";
import LeaveBalanceListing from "@/pages/Leave/Balance/LeaveBalanceListing";

// Payroll Modules
import SalaryStructureListing from "@/pages/Payroll/SalaryStructure/SalaryStructureListing";
import PayrollProcessListing from "@/pages/Payroll/Process/PayrollProcessListing";
import PayslipListing from "@/pages/Payroll/Payslips/PayslipListing";
import LoanListing from "@/pages/Payroll/Loans/LoanListing";
import ReimbursementListing from "@/pages/Payroll/Reimbursements/ReimbursementListing";
import TaxListing from "@/pages/Payroll/Taxes/TaxListing";

// Recruitment Modules
import CandidateListing from "@/pages/Recruitment/Candidates/CandidateListing";
import InterviewListing from "@/pages/Recruitment/Interviews/InterviewListing";
import OfferLetterListing from "@/pages/Recruitment/OfferLetters/OfferLetterListing";
import OnboardingListing from "@/pages/Recruitment/Onboarding/OnboardingListing";

// Performance Modules
import GoalListing from "@/pages/Performance/Goals/GoalListing";
import ReviewListing from "@/pages/Performance/Reviews/ReviewListing";
import AppraisalListing from "@/pages/Performance/Appraisals/AppraisalListing";
import FeedbackListing from "@/pages/Performance/Feedback/FeedbackListing";

// Reports Modules
import EmployeeReports from "@/pages/Reports/EmployeeReports";
import AttendanceReports from "@/pages/Reports/AttendanceReports";
import PayrollReports from "@/pages/Reports/PayrollReports";
import LeaveReports from "@/pages/Reports/LeaveReports";
import RecruitmentReports from "@/pages/Reports/RecruitmentReports";

// Administration Modules
import UserListing from "@/pages/Administration/Users/UserListing";
import RoleListing from "@/pages/Administration/Roles/RoleListing";
import Role from "@/pages/Administration/Roles/Role";
import PermissionMatrix from "@/pages/Administration/Permissions/PermissionMatrix";
import AuditLogListing from "@/pages/Administration/AuditLogs/AuditLogListing";
import ActivityLogFeed from "@/pages/Administration/ActivityLogs/ActivityLogFeed";

// Settings Modules
import GeneralSettings from "@/pages/Settings/GeneralSettings";
import NotificationSettings from "@/pages/Settings/NotificationSettings";
import EmailTemplates from "@/pages/Settings/EmailTemplates";
import IntegrationSettings from "@/pages/Settings/IntegrationSettings";
import SecuritySettings from "@/pages/Settings/SecuritySettings";

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnly>
        <Login />
      </PublicOnly>
    ),
  },

  {
    path: "/",
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <HomeRedirect />,
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
        path: "master",
        element: <Navigate to="/master/countries" replace />,
      },
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
        path: "master/menus",
        element: <MenuMasterListing />,
      },
      {
        path: "master/routes",
        element: <MenuMasterListing />,
      },
      {
        path: "master/banks",
        element: <BankMasterListing />,
      },
      {
        path: "master/bank",
        element: <BankMasterListing />,
      },

      // ============================================
      // Organization
      // ============================================

      {
        path: "organization",
        element: <Navigate to="/organization/company" replace />,
      },
      {
        path: "organization/company",
        children: [
          {
            index: true,
            element: <CompanyListing />,
          },
          {
            path: "addedit",
            handle: { pageLoader: true },
            element: <Company />,
          },
        ],
      },
      {
        path: "organization/companies",
        children: [
          {
            index: true,
            element: <CompanyListing />,
          },
          {
            path: "addedit",
            handle: { pageLoader: true },
            element: <Company />,
          },
        ],
      },
      {
        path: "organization/branch",
        children: [
          {
            index: true,
            element: <BranchListing />,
          },
          {
            path: "addedit",
            handle: { pageLoader: true },
            element: <Branch />,
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
            handle: { pageLoader: true },
            element: <Branch />,
          },
        ],
      },
      {
        path: "organization/department",
        children: [
          {
            index: true,
            element: <DepartmentListing />,
          },
          {
            path: "addedit",
            handle: { pageLoader: true },
            element: <Department />,
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
            handle: { pageLoader: true },
            element: <Department />,
          },
        ],
      },
      {
        path: "organization/designation",
        children: [
          {
            index: true,
            element: <DesignationListing />,
          },
          {
            path: "addedit",
            handle: { pageLoader: true },
            element: <Designation />,
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
            handle: { pageLoader: true },
            element: <Designation />,
          },
        ],
      },

      // ============================================
      // Employees
      // ============================================

      {
        path: "employee",
        element: <Navigate to="/employee/directory" replace />,
      },
      {
        path: "employees",
        element: <Navigate to="/employee/directory" replace />,
      },
      {
        path: "employee/directory",
        children: [
          {
            index: true,
            element: <EmployeeListing />,
          },
          {
            path: "addedit",
            handle: { pageLoader: true },
            element: <Employee />,
          },
        ],
      },
      {
        path: "employees/directory",
        children: [
          {
            index: true,
            element: <EmployeeListing />,
          },
          {
            path: "addedit",
            handle: { pageLoader: true },
            element: <Employee />,
          },
        ],
      },
      {
        path: "employee/profiles",
        element: <EmployeeProfiles />,
      },
      {
        path: "employees/profiles",
        element: <EmployeeProfiles />,
      },
      {
        path: "employee/documents",
        element: <EmployeeDocuments />,
      },
      {
        path: "employees/documents",
        element: <EmployeeDocuments />,
      },
      {
        path: "employee/assets",
        children: [
          {
            index: true,
            element: <AssetListing />,
          },
          {
            path: "addedit",
            handle: { pageLoader: true },
            element: <Asset />,
          },
        ],
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
            handle: { pageLoader: true },
            element: <Asset />,
          },
        ],
      },
      {
        path: "employee/exit",
        element: <ExitManagementListing />,
      },
      {
        path: "employees/exit",
        element: <ExitManagementListing />,
      },

      // ============================================
      // Attendance
      // ============================================

      {
        path: "attendance",
        element: <Navigate to="/attendance/logs" replace />,
      },
      {
        path: "attendance/logs",
        element: <AttendanceLogListing />,
      },
      {
        path: "attendance/shifts",
        element: <ShiftListing />,
      },
      {
        path: "attendance/holidays",
        element: <AttendanceHolidayCalendar />,
      },
      {
        path: "attendance/requests",
        element: <AttendanceRequestListing />,
      },

      // ============================================
      // Leave
      // ============================================

      {
        path: "leave",
        element: <Navigate to="/leave/requests" replace />,
      },
      {
        path: "leave/requests",
        element: <LeaveRequestListing />,
      },
      {
        path: "leave/approvals",
        element: <LeaveApprovalListing />,
      },
      {
        path: "leave/types",
        element: <LeaveTypeListing />,
      },
      {
        path: "leave/policies",
        element: <LeavePolicyListing />,
      },
      {
        path: "leave/balances",
        element: <LeaveBalanceListing />,
      },
      {
        path: "leave/balance",
        element: <LeaveBalanceListing />,
      },

      // ============================================
      // Payroll
      // ============================================

      {
        path: "payroll",
        element: <Navigate to="/payroll/process" replace />,
      },
      {
        path: "payroll/structures",
        element: <SalaryStructureListing />,
      },
      {
        path: "payroll/salary-structure",
        element: <SalaryStructureListing />,
      },
      {
        path: "payroll/process",
        element: <PayrollProcessListing />,
      },
      {
        path: "payroll/payslips",
        element: <PayslipListing />,
      },
      {
        path: "payroll/loans",
        element: <LoanListing />,
      },
      {
        path: "payroll/reimbursements",
        element: <ReimbursementListing />,
      },
      {
        path: "payroll/tax",
        element: <TaxListing />,
      },
      {
        path: "payroll/taxes",
        element: <TaxListing />,
      },

      // ============================================
      // Recruitment
      // ============================================

      {
        path: "recruitment",
        element: <Navigate to="/recruitment/job-openings" replace />,
      },
      {
        path: "recruitment/job-openings",
        children: [
          {
            index: true,
            element: <JobOpeningListing />,
          },
          {
            path: "addedit",
            handle: { pageLoader: true },
            element: <JobOpening />,
          },
        ],
      },
      {
        path: "recruitment/jobs",
        children: [
          {
            index: true,
            element: <JobOpeningListing />,
          },
          {
            path: "addedit",
            handle: { pageLoader: true },
            element: <JobOpening />,
          },
        ],
      },
      {
        path: "recruitment/candidates",
        element: <CandidateListing />,
      },
      {
        path: "recruitment/interviews",
        element: <InterviewListing />,
      },
      {
        path: "recruitment/offers",
        element: <OfferLetterListing />,
      },
      {
        path: "recruitment/onboarding",
        element: <OnboardingListing />,
      },

      // ============================================
      // Performance
      // ============================================

      {
        path: "performance",
        element: <Navigate to="/performance/goals" replace />,
      },
      {
        path: "performance/goals",
        element: <GoalListing />,
      },
      {
        path: "performance/reviews",
        element: <ReviewListing />,
      },
      {
        path: "performance/appraisals",
        element: <AppraisalListing />,
      },
      {
        path: "performance/feedback",
        element: <FeedbackListing />,
      },

      // ============================================
      // Reports
      // ============================================

      {
        path: "reports",
        element: <Navigate to="/reports/employees" replace />,
      },
      {
        path: "reports/employees",
        element: <EmployeeReports />,
      },
      {
        path: "reports/attendance",
        element: <AttendanceReports />,
      },
      {
        path: "reports/payroll",
        element: <PayrollReports />,
      },
      {
        path: "reports/leave",
        element: <LeaveReports />,
      },
      {
        path: "reports/recruitment",
        element: <RecruitmentReports />,
      },

      // ============================================
      // Administration
      // ============================================

      {
        path: "administration",
        element: <Navigate to="/administration/users" replace />,
      },
      {
        path: "administration/users",
        element: <UserListing />,
      },
      {
        path: "administration/roles",
        children: [
          {
            index: true,
            element: <RoleListing />,
          },
          {
            path: "addedit",
            handle: { pageLoader: true },
            element: <Role />,
          },
        ],
      },
      {
        path: "administration/permissions",
        element: <PermissionMatrix />,
      },
      {
        path: "administration/audit-logs",
        element: <AuditLogListing />,
      },
      {
        path: "administration/activity-logs",
        element: <ActivityLogFeed />,
      },

      // ============================================
      // Settings
      // ============================================

      {
        path: "settings",
        element: <Navigate to="/settings/general" replace />,
      },
      {
        path: "settings/general",
        element: <GeneralSettings />,
      },
      {
        path: "settings/notifications",
        element: <NotificationSettings />,
      },
      {
        path: "settings/email-templates",
        element: <EmailTemplates />,
      },
      {
        path: "settings/email",
        element: <EmailTemplates />,
      },
      {
        path: "settings/integrations",
        element: <IntegrationSettings />,
      },
      {
        path: "settings/security",
        element: <SecuritySettings />,
      },
    ],
  },

  {
    path: "*",
    element: <UnderConstruction moduleName="404 - Page Not Found" />,
  },
]);

export default router;
