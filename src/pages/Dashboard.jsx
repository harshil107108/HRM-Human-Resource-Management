import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import useApiCall from "../hooks/useApiCall";
import { api, apiEndpoints } from "../api/api";
import { getUploadUrl } from "../utils/fileUpload";
import { HpCommonModal } from "@/hp-common-modal";
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
  Activity,
  RefreshCw,
} from "lucide-react";

// ==========================================
// DATA HELPERS (all values come from /dashboard/getDashboardStats)
// ==========================================

const DIRECTORY_PAGE_SIZE = 5;

// Sparkline path in the cards' 100x32 viewBox; flat line when there's no data.
const buildSparkline = (values = []) => {
  if (!values.length) return "M0 20 L100 20";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  const step = values.length > 1 ? 100 / (values.length - 1) : 100;
  return values
    .map((v, i) => {
      const y = range === 0 ? 20 : 28 - ((v - min) / range) * 24;
      return `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
};

// Line path in the growth chart's 100x40 viewBox (y=38 is zero).
const buildGrowthLine = (values, max) =>
  values
    .map((v, i) => {
      const x = values.length > 1 ? (i / (values.length - 1)) * 100 : 0;
      const y = 38 - (max ? (v / max) * 30 : 0);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

const formatCount = (value) =>
  value === undefined || value === null ? "—" : Number(value).toLocaleString();

const formatCurrency = (value) => {
  if (value === undefined || value === null) return "—";
  const n = Number(value) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const timeAgo = (iso) => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} Minute${minutes > 1 ? "s" : ""} Ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} Hour${hours > 1 ? "s" : ""} Ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} Days Ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

// Department donut colours, in legend order.
const DEPARTMENT_COLORS = [
  { stroke: "#2563eb", dot: "bg-blue-600" },
  { stroke: "#64748b", dot: "bg-slate-500" },
  { stroke: "#f59e0b", dot: "bg-amber-500" },
  { stroke: "#cbd5e1", dot: "bg-slate-300" },
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
    "Notice Period": "bg-orange-50 text-orange-700 border-orange-200/60",
    Inactive: "bg-gray-50 text-gray-600 border-gray-200/60",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {status}
    </span>
  );
};

// One row of the activity timeline (used by the card and the "View All" popup).
const ActivityItem = ({ activity }) => {
  const getIconConfig = () => {
    switch (activity.type) {
      case "join":
        return {
          element: <UserPlus className="w-3.5 h-3.5 text-green-600" />,
          bg: "bg-green-50 border-green-200",
        };
      case "payroll":
        return {
          element: <CreditCard className="w-3.5 h-3.5 text-blue-600" />,
          bg: "bg-blue-50 border-blue-200",
        };
      default:
        return {
          element: <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />,
          bg: "bg-amber-50 border-amber-200",
        };
    }
  };

  const cfg = getIconConfig();

  return (
    <div className="relative flex gap-4 pl-8">
      <div
        className={`absolute left-0 w-7 h-7 ${cfg.bg} border rounded-full flex items-center justify-center ring-4 ring-white z-10`}
      >
        {cfg.element}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900 leading-none">
          {activity.title}
        </p>
        <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
          {activity.description}
        </p>
        <span className="inline-block text-[9px] text-gray-400 font-semibold tracking-wider mt-1 uppercase">
          {timeAgo(activity.time)}
        </span>
      </div>
    </div>
  );
};

const ACTIVITY_FILTERS = [
  { key: "all", label: "All" },
  { key: "join", label: "Employees" },
  { key: "payroll", label: "Payroll" },
  { key: "leave", label: "Leave" },
  { key: "exit", label: "Exit" },
];

// "View All" popup: loads the full activity feed when opened.
const AllActivitiesModal = ({ open, onClose }) => {
  const { apiCall, isPending } = useApiCall();
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("all");

  const loadActivities = useCallback(async () => {
    const res = await apiCall({
      id: "getAllActivities",
      api: api + apiEndpoints.dashboard.recentActivities,
      payload: { limit: 200 },
    });
    if (res?.success) setActivities(res.data?.data || []);
  }, [apiCall]);

  useEffect(() => {
    if (open) loadActivities();
  }, [open, loadActivities]);

  const visible =
    filter === "all" ? activities : activities.filter((a) => a.type === filter);
  const loading = isPending("getAllActivities");

  return (
    <HpCommonModal
      open={open}
      title="All Activity"
      subTitle="Everything happening across employees, payroll, leave and exits"
      icon={<Activity size={20} />}
      size="md"
      onClose={onClose}
      showSaveButton={false}
      showClearButton={false}
      cancelText="Close"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {ACTIVITY_FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? activities.length
                : activities.filter((a) => a.type === f.key).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                  filter === f.key
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label} <span className="text-gray-400">{count}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={loadActivities}
          disabled={loading}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading && activities.length === 0 ? (
        <p className="text-xs text-gray-400">Loading activity…</p>
      ) : visible.length === 0 ? (
        <p className="text-xs text-gray-400">No activity to show.</p>
      ) : (
        <div className="space-y-6 relative">
          <div className="absolute left-[13px] top-1.5 bottom-1.5 w-[1.5px] bg-gray-200" />
          {visible.map((act) => (
            <ActivityItem key={act.id} activity={act} />
          ))}
        </div>
      )}
    </HpCommonModal>
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
  const [liveStats, setLiveStats] = useState(null);
  const [directoryPage, setDirectoryPage] = useState(1);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const { apiCall } = useApiCall();

  const fetchDashboardStats = useCallback(async () => {
    const res = await apiCall({
      id: "getDashboardStats",
      api: api + apiEndpoints.dashboard.stats,
      payload: {},
    });
    if (res?.success && res.data?.data) {
      setLiveStats(res.data.data);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const sparklines = liveStats?.sparklines || {};
  const trends = liveStats?.trends || {};
  const trendLabel = (key) => trends[key]?.label ?? "—";
  const trendType = (key) => trends[key]?.type ?? "neutral";

  // Attendance bars: last 7 days, or 30 days in 5 buckets.
  const attendanceBars = useMemo(() => {
    const series =
      selectedDuration === "Last 30 Days"
        ? liveStats?.attendanceTrend?.last30
        : liveStats?.attendanceTrend?.last7;
    return (series || []).map((point, index, all) => ({
      height: `${Math.max(point.rate, 2)}%`,
      label: point.label,
      value: `${point.rate}%`,
      highlighted: index === all.length - 1,
    }));
  }, [liveStats, selectedDuration]);

  // Employee growth lines (hires vs departures, this year).
  const growth = useMemo(() => {
    const hires = liveStats?.employeeGrowth?.hires || Array(12).fill(0);
    const departures = liveStats?.employeeGrowth?.departures || Array(12).fill(0);
    const max = Math.max(1, ...hires, ...departures);
    const hiresLine = buildGrowthLine(hires, max);
    return {
      hiresLine,
      hiresArea: `${hiresLine} L100 40 L0 40 Z`,
      departuresLine: buildGrowthLine(departures, max),
    };
  }, [liveStats]);

  // Department donut segments (circumference = 100 units).
  const departmentSegments = useMemo(() => {
    const items = liveStats?.departmentDistribution?.items || [];
    return items.map((item, index) => ({
      ...item,
      color: DEPARTMENT_COLORS[index] || DEPARTMENT_COLORS[DEPARTMENT_COLORS.length - 1],
      dashArray: `${item.percent} ${100 - item.percent}`,
      // Each segment starts where the previous ones end (100 = top).
      dashOffset: 100 - items.slice(0, index).reduce((sum, d) => sum + d.percent, 0),
    }));
  }, [liveStats]);

  // Employee directory: search + client-side pagination.
  const allEmployees = liveStats?.employees || [];
  const query = employeeSearch.trim().toLowerCase();
  const filteredEmployees = allEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.designation.toLowerCase().includes(query),
  );
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / DIRECTORY_PAGE_SIZE));
  const currentPage = Math.min(directoryPage, totalPages);
  const pagedEmployees = filteredEmployees.slice(
    (currentPage - 1) * DIRECTORY_PAGE_SIZE,
    currentPage * DIRECTORY_PAGE_SIZE,
  );

  const recentActivities = liveStats?.recentActivities || [];
  const upcomingEvents = liveStats?.upcomingEvents || [];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-700 antialiased selection:bg-blue-100 selection:text-blue-800">
      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Content Container */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Employees"
              value={formatCount(liveStats?.totalEmployees)}
              icon={<Users className="w-5 h-5 text-blue-600" />}
              trend={trendLabel("totalEmployees")}
              trendType={trendType("totalEmployees")}
              sparklineData={buildSparkline(sparklines.totalEmployees)}
              sparklineColor="#2563eb"
            />
            <StatCard
              title="Present Today"
              value={formatCount(liveStats?.presentToday)}
              icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
              trend={trendLabel("presentToday")}
              trendType={trendType("presentToday")}
              sparklineData={buildSparkline(sparklines.presentToday)}
              sparklineColor="#10b981"
            />
            <StatCard
              title="Absent"
              value={formatCount(liveStats?.absentToday)}
              icon={<AlertCircle className="w-5 h-5 text-red-600" />}
              trend={trendLabel("absentToday")}
              trendType={trendType("absentToday")}
              sparklineData={buildSparkline(sparklines.absentToday)}
              sparklineColor="#ef4444"
            />
            <StatCard
              title="Active Workforce"
              value={formatCount(liveStats?.activeEmployees)}
              icon={<Building2 className="w-5 h-5 text-indigo-600" />}
              trend={trendLabel("activeEmployees")}
              trendType={trendType("activeEmployees")}
              sparklineData={buildSparkline(sparklines.activeEmployees)}
              sparklineColor="#4f46e5"
            />
            <StatCard
              title="Leaves Pending"
              value={formatCount(liveStats?.pendingLeaves)}
              icon={<Clock className="w-5 h-5 text-amber-600" />}
              trend={trendLabel("pendingLeaves")}
              trendType={trendType("pendingLeaves")}
              sparklineData={buildSparkline(sparklines.pendingLeaves)}
              sparklineColor="#f59e0b"
            />
            <StatCard
              title="Payroll Disbursed"
              value={formatCurrency(liveStats?.payrollThisMonth)}
              icon={<CreditCard className="w-5 h-5 text-teal-600" />}
              trend={trendLabel("payrollThisMonth")}
              trendType={trendType("payrollThisMonth")}
              sparklineData={buildSparkline(sparklines.payrollThisMonth)}
              sparklineColor="#0d9488"
            />
            <StatCard
              title="New Hires"
              value={formatCount(liveStats?.newHires)}
              icon={<UserPlus className="w-5 h-5 text-violet-600" />}
              trend={trendLabel("newHires")}
              trendType={trendType("newHires")}
              sparklineData={buildSparkline(sparklines.newHires)}
              sparklineColor="#7c3aed"
            />
            <StatCard
              title="Open Positions"
              value={formatCount(liveStats?.openPositions)}
              icon={<Briefcase className="w-5 h-5 text-rose-600" />}
              trend={trendLabel("openPositions")}
              trendType={trendType("openPositions")}
              sparklineData={buildSparkline(sparklines.openPositions)}
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
                    {attendanceBars.map((bar, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
                      >
                        <div className="w-full relative h-full flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: bar.height }}
                            transition={{ duration: 0.8, delay: index * 0.05 }}
                            className={`w-full rounded-t-md transition-all ${
                              bar.highlighted
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
                        d={growth.hiresArea}
                        fill="url(#hiresGradient)"
                      />

                      {/* Hires Line */}
                      <path
                        d={growth.hiresLine}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      {/* Departures Line */}
                      <path
                        d={growth.departuresLine}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        strokeLinecap="round"
                      />
                    </svg>

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
                      <input
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                        placeholder="Filter by name, design..."
                        type="text"
                        value={employeeSearch}
                        onChange={(e) => {
                          setEmployeeSearch(e.target.value);
                          setDirectoryPage(1);
                        }}
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
                      {pagedEmployees.map((emp) => (
                        <tr
                          key={emp.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {emp.profileImage ? (
                                <img
                                  className="w-9 h-9 rounded-full object-cover border border-gray-100"
                                  alt={emp.name}
                                  src={getUploadUrl(emp.profileImage)}
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full border border-gray-100 bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold">
                                  {initialsOf(emp.name)}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900 leading-tight">
                                  {emp.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {emp.email || emp.employeeCode}
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
                            {allEmployees.length === 0
                              ? "No employees found."
                              : "No employees match your search criteria."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-xs text-gray-500 font-medium">
                    Showing {pagedEmployees.length} of{" "}
                    {filteredEmployees.length.toLocaleString()} employees
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setDirectoryPage(currentPage - 1)}
                      className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    {(() => {
                      // Up to 3 page numbers around the current page.
                      const first = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
                      const last = Math.min(totalPages, first + 2);
                      return Array.from({ length: last - first + 1 }, (_, i) => first + i);
                    })().map((page) => (
                      <button
                        key={page}
                        onClick={() => setDirectoryPage(page)}
                        className={
                          page === currentPage
                            ? "px-3 py-1 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold transition-colors"
                            : "px-3 py-1 border border-transparent hover:border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-medium transition-colors"
                        }
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setDirectoryPage(currentPage + 1)}
                      className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-3 space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 text-sm mb-5">
                  Department Distribution
                </h3>
                <div className="flex flex-col items-center">
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
                      {departmentSegments.map((seg) => (
                        <circle
                          key={seg.name}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke={seg.color.stroke}
                          strokeWidth="2.5"
                          strokeDasharray={seg.dashArray}
                          strokeDashoffset={seg.dashOffset}
                        />
                      ))}
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-2xl font-bold text-gray-950">
                        {formatCount(liveStats?.departmentDistribution?.totalDepartments)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Depts
                      </span>
                    </div>
                  </div>

                  {/* Legends list */}
                  <div className="w-full mt-6 space-y-2.5">
                    {departmentSegments.map((seg) => (
                      <div key={seg.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-medium text-gray-600">
                          <span className={`w-2.5 h-2.5 rounded-full ${seg.color.dot}`} />
                          <span>{seg.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{seg.percent}%</span>
                      </div>
                    ))}
                    {departmentSegments.length === 0 && (
                      <p className="text-center text-xs text-gray-400">No employees yet.</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Activity Timeline */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Recent Activity
                  </h3>
                  <button
                    onClick={() => setShowAllActivities(true)}
                    className="text-xs text-blue-600 font-bold hover:text-blue-700 transition-colors"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-6 relative">
                  <div className="absolute left-[13px] top-1.5 bottom-1.5 w-[1.5px] bg-gray-200" />

                  {recentActivities.length === 0 && (
                    <p className="pl-8 text-xs text-gray-400">No recent activity yet.</p>
                  )}
                  {recentActivities.map((act) => (
                    <ActivityItem key={act.id} activity={act} />
                  ))}
                </div>
              </Card>

              {/* Upcoming Events */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 text-sm mb-5">
                  Upcoming Events
                </h3>
                <div className="space-y-3.5">
                  {upcomingEvents.length === 0 && (
                    <p className="text-xs text-gray-400">No events in the next 30 days.</p>
                  )}
                  {upcomingEvents.map((event) => {
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
                            {event.subtitle}
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

      {showAllActivities && (
        <AllActivitiesModal
          open={showAllActivities}
          onClose={() => setShowAllActivities(false)}
        />
      )}
    </div>
  );
}
