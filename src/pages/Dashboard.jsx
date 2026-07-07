import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  Briefcase,
  UserPlus,
  UserCheck,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

const INITIAL_EMPLOYEES = [
  {
    id: "1",
    name: "Elena Vance",
    email: "elena.v@enterprise.hrm",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    department: "Engineering",
    designation: "Senior Dev",
    status: "Active",
  },
  {
    id: "2",
    name: "Mark J. Peterson",
    email: "mark.p@enterprise.hrm",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    department: "Marketing",
    designation: "Content Strategist",
    status: "Remote",
  },
  {
    id: "3",
    name: "Sarah Connor",
    email: "s.connor@enterprise.hrm",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    department: "Human Resources",
    designation: "HR Manager",
    status: "Active",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "j.wilson@enterprise.hrm",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    department: "Product",
    designation: "UI Designer",
    status: "On Leave",
  },
];

const RECENT_ACTIVITIES = [
  {
    id: "1",
    type: "join",
    title: "New Employee Joined",
    description: "Elena Vance joined Engineering team",
    time: "2 Hours Ago",
  },
  {
    id: "2",
    type: "payroll",
    title: "Payroll Generated",
    description: "Monthly payroll for Sales dept finalized",
    time: "5 Hours Ago",
  },
  {
    id: "3",
    type: "leave",
    title: "Leave Approved",
    description: "James Wilson's vacation request approved",
    time: "Yesterday",
  },
];

const UPCOMING_EVENTS = [
  {
    id: "1",
    title: "Interview: Senior PM",
    time: "10:30 AM • Room 4B",
    badge: { month: "OCT", day: "12", variant: "danger" },
  },
  {
    id: "2",
    title: "Sarah's Work Anniv.",
    time: "5 Years Milestone!",
    badge: { month: "OCT", day: "14", variant: "secondary" },
  },
  {
    id: "3",
    title: "Townhall Meeting",
    time: "Global Q3 Updates",
    badge: { month: "OCT", day: "15", variant: "primary" },
  },
];

// ==========================================
// REUSABLE SUB-COMPONENTS
// ==========================================

const Button = ({ children, variant = "primary", className = "", onClick }) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-transparent",
    secondary:
      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm",
    ghost: "bg-transparent hover:bg-gray-50 text-gray-600",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ status }) => {
  const styles = {
    Active: "bg-green-50 text-green-700 border-green-200/60",
    Remote: "bg-blue-50 text-blue-700 border-blue-200/60",
    "On Leave": "bg-amber-50 text-amber-700 border-amber-200/60",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendType,
  sparklineData,
  sparklineColor,
}) => {
  const getTrendStyles = () => {
    switch (trendType) {
      case "up":
        return "text-green-600 bg-green-50 border-green-200";
      case "down":
        return "text-red-600 bg-red-50 border-red-200";
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-700">
          {icon}
        </div>
        <span
          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${getTrendStyles()}`}
        >
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
          {value}
        </p>
      </div>
      <div className="mt-4 h-8 w-full">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 32"
          preserveAspectRatio="none"
        >
          <path
            d={sparklineData}
            fill="none"
            stroke={sparklineColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Card>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function EnterpriseDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("Last 7 Days");

  // Sparkline SVG Path definitions
  const sparkline1 =
    "M0 25 L10 22 L20 28 L30 15 L40 18 L50 10 L60 12 L70 5 L80 15 L90 8 L100 12";
  const sparkline2 = "M0 10 L20 12 L40 8 L60 15 L80 10 L100 12";
  const sparkline3 = "M0 20 L20 18 L40 22 L60 15 L80 18 L100 12";
  const sparkline4 = "M0 25 L25 15 L50 20 L75 10 L100 15";
  const sparkline5 = "M0 20 L100 20";
  const sparkline6 = "M0 30 L20 25 L40 20 L60 15 L80 10 L100 5";
  const sparkline7 = "M0 30 L50 20 L100 10";
  const sparkline8 = "M0 10 L50 15 L100 20";

  // Filters search queries
  const filteredEmployees = INITIAL_EMPLOYEES.filter(
    (emp) =>
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.department.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.designation.toLowerCase().includes(employeeSearch.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-700 antialiased selection:bg-blue-100 selection:text-blue-800">
      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Content Container */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Good Morning, Harshil 👋
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Here is an overview of your organization's health today.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary">
                <UserPlus className="w-4 h-4 text-gray-500" />
                <span>Add Employee</span>
              </Button>
              <Button variant="secondary">
                <UserCheck className="w-4 h-4 text-gray-500" />
                <span>Mark Attendance</span>
              </Button>
              <Button variant="secondary">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span>Create Payroll</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Employees"
              value="1,284"
              icon={<Users className="w-5 h-5 text-blue-600" />}
              trend="+12%"
              trendType="up"
              sparklineData={sparkline1}
              sparklineColor="#2563eb"
            />
            <StatCard
              title="Present Today"
              value="1,142"
              icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
              trend="94%"
              trendType="success"
              sparklineData={sparkline2}
              sparklineColor="#10b981"
            />
            <StatCard
              title="Absent"
              value="42"
              icon={<AlertCircle className="w-5 h-5 text-red-600" />}
              trend="-2%"
              trendType="down"
              sparklineData={sparkline3}
              sparklineColor="#ef4444"
            />
            <StatCard
              title="Remote Work"
              value="100"
              icon={<Building2 className="w-5 h-5 text-indigo-600" />}
              trend="+5%"
              trendType="up"
              sparklineData={sparkline4}
              sparklineColor="#4f46e5"
            />
            <StatCard
              title="Leaves Pending"
              value="18"
              icon={<Clock className="w-5 h-5 text-amber-600" />}
              trend="Active"
              trendType="neutral"
              sparklineData={sparkline5}
              sparklineColor="#f59e0b"
            />
            <StatCard
              title="Payroll This Month"
              value="$482k"
              icon={<CreditCard className="w-5 h-5 text-teal-600" />}
              trend="+2.4%"
              trendType="success"
              sparklineData={sparkline6}
              sparklineColor="#0d9488"
            />
            <StatCard
              title="New Hires"
              value="24"
              icon={<UserPlus className="w-5 h-5 text-violet-600" />}
              trend="8 New"
              trendType="up"
              sparklineData={sparkline7}
              sparklineColor="#7c3aed"
            />
            <StatCard
              title="Open Positions"
              value="14"
              icon={<Briefcase className="w-5 h-5 text-rose-600" />}
              trend="Urgent"
              trendType="down"
              sparklineData={sparkline8}
              sparklineColor="#e11d48"
            />
          </div>

          {/* Bento Grid: Analytics & Content */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Main Section (col-span-12 on Mobile, lg:col-span-9 on Desktop) */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance Trend Chart */}
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Attendance Trend
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Average weekly status
                      </p>
                    </div>
                    <select
                      className="bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                    >
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>

                  {/* Dynamic Custom Bar Chart */}
                  <div className="h-44 flex items-end justify-between gap-3 px-2">
                    {[
                      { height: "85%", label: "Mon", value: "92%" },
                      { height: "92%", label: "Tue", value: "94%" },
                      { height: "70%", label: "Wed", value: "88%" },
                      {
                        height: "95%",
                        label: "Thu",
                        value: "96%",
                        highlighted: true,
                      },
                      { height: "88%", label: "Fri", value: "91%" },
                      { height: "40%", label: "Sat", value: "45%" },
                      { height: "30%", label: "Sun", value: "35%" },
                    ].map((bar, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
                      >
                        <div className="w-full relative h-full flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: bar.height }}
                            transition={{ duration: 0.8, delay: index * 0.05 }}
                            className={`w-full rounded-t-md transition-all ${bar.highlighted
                              ? "bg-blue-600 shadow-sm shadow-blue-500/20"
                              : "bg-blue-200 group-hover:bg-blue-400"
                              }`}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] py-1 px-1.5 rounded shadow-lg whitespace-nowrap z-10 font-bold transition-all">
                            {bar.value}
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500">
                          {bar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Employee Growth Chart */}
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Employee Growth
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Year to date progression
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <span>Hires</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span>Departures</span>
                      </span>
                    </div>
                  </div>

                  {/* Clean SVG Area/Line Chart */}
                  <div className="h-44 relative">
                    <svg
                      className="w-full h-full"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 40"
                    >
                      <defs>
                        <linearGradient
                          id="hiresGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#2563eb"
                            stopOpacity="0.15"
                          />
                          <stop
                            offset="100%"
                            stopColor="#2563eb"
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>
                      <line
                        x1="0"
                        y1="10"
                        x2="100"
                        y2="10"
                        stroke="#f3f4f6"
                        strokeWidth="0.5"
                      />
                      <line
                        x1="0"
                        y1="20"
                        x2="100"
                        y2="20"
                        stroke="#f3f4f6"
                        strokeWidth="0.5"
                      />
                      <line
                        x1="0"
                        y1="30"
                        x2="100"
                        y2="30"
                        stroke="#f3f4f6"
                        strokeWidth="0.5"
                      />

                      {/* Area Fill for Hires */}
                      <path
                        d="M0 35 Q 25 30, 50 20 T 100 10 L 100 40 L 0 40 Z"
                        fill="url(#hiresGradient)"
                      />

                      {/* Hires Line */}
                      <path
                        d="M0 35 Q 25 30, 50 20 T 100 10"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      {/* Departures Line */}
                      <path
                        d="M0 38 Q 25 35, 50 34 T 100 32"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* X-Axis labels */}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[10px] text-gray-400 font-semibold mt-2 pt-1 border-t border-gray-100">
                      <span>Jan</span>
                      <span>Mar</span>
                      <span>May</span>
                      <span>Jul</span>
                      <span>Sep</span>
                      <span>Nov</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Data Grid Table: Employee Directory */}
              <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Employee Directory
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Manage and view team details
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-60">
                      {/* <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" /> */}
                      <input
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                        placeholder="Filter by name, design..."
                        type="text"
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 !text-xs"
                    >
                      <Filter className="w-3.5 h-3.5 text-gray-400" />
                      <span>Filter</span>
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-semibold text-[11px] uppercase tracking-wider border-b border-gray-200">
                        <th className="px-6 py-3.5">Employee</th>
                        <th className="px-6 py-3.5">Department</th>
                        <th className="px-6 py-3.5">Designation</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredEmployees.map((emp) => (
                        <tr
                          key={emp.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                className="w-9 h-9 rounded-full object-cover border border-gray-100"
                                alt={emp.name}
                                src={emp.avatar}
                              />
                              <div>
                                <p className="font-semibold text-gray-900 leading-tight">
                                  {emp.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {emp.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-medium">
                            {emp.department}
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-medium">
                            {emp.designation}
                          </td>
                          <td className="px-6 py-4">
                            <Badge status={emp.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredEmployees.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-8 text-gray-400 text-sm"
                          >
                            No employees match your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-xs text-gray-500 font-medium">
                    Showing 4 of 1,284 employees
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      disabled
                      className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="px-3 py-1 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold transition-colors">
                      1
                    </button>
                    <button className="px-3 py-1 border border-transparent hover:border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-medium transition-colors">
                      2
                    </button>
                    <button className="px-3 py-1 border border-transparent hover:border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-medium transition-colors">
                      3
                    </button>
                    <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right sidebar details panel (col-span-12 on Mobile, lg:col-span-3 on Desktop) */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              {/* Department Distribution Donut Card */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 text-sm mb-5">
                  Department Distribution
                </h3>
                <div className="flex flex-col items-center">
                  {/* Radial / Donut SVG layout */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeDasharray="42 58"
                        strokeDashoffset="100"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2.5"
                        strokeDasharray="28 72"
                        strokeDashoffset="58"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeDasharray="15 85"
                        strokeDashoffset="30"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-2xl font-bold text-gray-950">
                        12
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Depts
                      </span>
                    </div>
                  </div>

                  {/* Legends list */}
                  <div className="w-full mt-6 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <span>Engineering</span>
                      </div>
                      <span className="font-semibold text-gray-900">42%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                        <span>Sales</span>
                      </div>
                      <span className="font-semibold text-gray-900">28%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>Marketing</span>
                      </div>
                      <span className="font-semibold text-gray-900">15%</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Activity Timeline */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Recent Activity
                  </h3>
                  <button className="text-xs text-blue-600 font-bold hover:text-blue-700 transition-colors">
                    View All
                  </button>
                </div>

                <div className="space-y-6 relative">
                  <div className="absolute left-[13px] top-1.5 bottom-1.5 w-[1.5px] bg-gray-200" />

                  {RECENT_ACTIVITIES.map((act) => {
                    const getIconConfig = () => {
                      switch (act.type) {
                        case "join":
                          return {
                            element: (
                              <UserPlus className="w-3.5 h-3.5 text-green-600" />
                            ),
                            bg: "bg-green-50 border-green-200",
                          };
                        case "payroll":
                          return {
                            element: (
                              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                            ),
                            bg: "bg-blue-50 border-blue-200",
                          };
                        default:
                          return {
                            element: (
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                            ),
                            bg: "bg-amber-50 border-amber-200",
                          };
                      }
                    };

                    const cfg = getIconConfig();

                    return (
                      <div key={act.id} className="relative flex gap-4 pl-8">
                        <div
                          className={`absolute left-0 w-7 h-7 ${cfg.bg} border rounded-full flex items-center justify-center ring-4 ring-white z-10`}
                        >
                          {cfg.element}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 leading-none">
                            {act.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                            {act.description}
                          </p>
                          <span className="inline-block text-[9px] text-gray-400 font-semibold tracking-wider mt-1 uppercase">
                            {act.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Upcoming Events */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 text-sm mb-5">
                  Upcoming Events
                </h3>
                <div className="space-y-3.5">
                  {UPCOMING_EVENTS.map((event) => {
                    const badgeStyles = {
                      danger: "bg-red-50 text-red-700 border-red-200/50",
                      secondary:
                        "bg-slate-50 text-slate-700 border-slate-200/50",
                      primary: "bg-blue-50 text-blue-700 border-blue-200/50",
                    };

                    return (
                      <div
                        key={event.id}
                        className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-3"
                      >
                        <div
                          className={`w-10 h-10 border rounded flex flex-col items-center justify-center font-bold shrink-0 shadow-sm ${badgeStyles[event.badge.variant]}`}
                        >
                          <span className="text-[9px] font-bold tracking-wider leading-none">
                            {event.badge.month}
                          </span>
                          <span className="text-base font-bold leading-none mt-0.5">
                            {event.badge.day}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate leading-none">
                            {event.title}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1 font-medium truncate">
                            {event.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
