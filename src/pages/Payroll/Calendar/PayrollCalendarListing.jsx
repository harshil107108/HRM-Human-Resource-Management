import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import HpGrid from "@/hp-grid/src/HpGrid";
import { formatDate } from "@/utils/dateUtils";
import { formMethod, FormRenderer } from "@/form-engine";
import {
  CalendarDays,
  Clock,
  User,
  DollarSign,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info,
  Calendar as CalendarIcon,
} from "lucide-react";
import "./PayrollCalendar.css";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const PayrollCalendarListing = () => {
  const { user } = useAuth();
  const isPrivileged =
    user?.isSuperAdmin ||
    ["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.roleCode);

  const { apiCall, isPending } = useApiCall();

  const now = useMemo(() => new Date(), []);
  const todayDay = now.getDate();
  const todayMonthIndex = now.getMonth();
  const todayYear = now.getFullYear();

  // State managed directly from calendar (with formMethod SelectWrapper)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(todayMonthIndex);
  const [selectedYear, setSelectedYear] = useState(todayYear);
  const isSuperAdminUser =
    user?.isSuperAdmin ||
    user?.roleCode === "SUPER_ADMIN" ||
    user?.employeeCode === "SA0001";

  const [selectedDayNumber, setSelectedDayNumber] = useState(todayDay);

  const [activeTab, setActiveTab] = useState("calendar"); // "calendar" | "allEmployees"
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    !isSuperAdminUser ? user?.employee?._id || user?._id || "" : "",
  );
  const [calendarPayload, setCalendarPayload] = useState(null);

  const selectedMonthName = MONTH_NAMES[selectedMonthIndex];

  // Keep day selector in sync when month or year changes
  useEffect(() => {
    if (selectedMonthIndex === todayMonthIndex && selectedYear === todayYear) {
      setSelectedDayNumber(todayDay);
    } else {
      setSelectedDayNumber(1);
    }
  }, [selectedMonthIndex, selectedYear, todayMonthIndex, todayYear, todayDay]);

  // Year options for calendar header selector
  const yearOptions = useMemo(
    () => [todayYear - 2, todayYear - 1, todayYear, todayYear + 1],
    [todayYear],
  );

  // Load employee master list for Admin/HR
  const loadEmployees = useCallback(async () => {
    if (!isPrivileged) return;
    try {
      const res = await apiCall({
        id: "getEmployeesForCalendar",
        api: api + apiEndpoints.employee.employee.EmployeeGetData,
        payload: {},
      });
      if (res?.success) {
        const list = res.data?.data || [];
        setEmployeesList(list);

        // Default to logged-in user if real employee, or Harshil Prajapati, or first employee in list
        if (list.length > 0) {
          const harshilEmp = list.find(
            (e) => e.employeeId === "150236" || /harshil/i.test(e.firstName),
          );
          const loggedIn = list.find(
            (e) =>
              (String(e._id) === String(user?.employee?._id || user?._id) ||
                e.employeeId === user?.employeeCode) &&
              e.employeeId !== "SA0001",
          );
          const defaultEmp = loggedIn || harshilEmp || list[0];

          if (defaultEmp) {
            setSelectedEmployeeId((prev) => {
              if (!prev || prev === user?._id) {
                return defaultEmp._id;
              }
              return prev;
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to load employees list", err);
    }
  }, [isPrivileged, apiCall, user]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // If regular non-privileged employee, lock to their own ID
  useEffect(() => {
    if (!isPrivileged && (user?.employee?._id || user?._id)) {
      setSelectedEmployeeId(user?.employee?._id || user?._id);
    }
  }, [isPrivileged, user]);

  // -------------------------------------------------------------
  // FormMethod Form for Employee Selector (SelectWrapper)
  // -------------------------------------------------------------
  const employeeFilterForm = useMemo(
    () =>
      formMethod.createForm({
        schema: [
          {
            id: "employeeId",
            type: "selectWrapper",
            placeHolder: "Select Employee...",
            className: "col-span-12",
            options: employeesList.map((emp) => ({
              label: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.employeeId || ""})`,
              value: emp._id,
            })),
          },
        ],
        initialValue: { employeeId: selectedEmployeeId },
      }),
    [employeesList],
  );

  const watchedEmpId = employeeFilterForm.methods.watch("employeeId");
  useEffect(() => {
    if (watchedEmpId && watchedEmpId !== selectedEmployeeId) {
      setSelectedEmployeeId(watchedEmpId);
    }
  }, [watchedEmpId]);

  useEffect(() => {
    if (selectedEmployeeId) {
      employeeFilterForm.methods.setValue("employeeId", selectedEmployeeId);
    }
  }, [selectedEmployeeId, employeeFilterForm]);

  // -------------------------------------------------------------
  // Fetch Real Calendar & Leave Deduction Data
  // -------------------------------------------------------------
  const fetchCalendarData = useCallback(async () => {
    try {
      const targetId = isPrivileged
        ? selectedEmployeeId || ""
        : user?.employee?._id || user?._id;

      const payload = {
        employeeId: targetId,
        month: selectedMonthIndex + 1,
        year: selectedYear,
        includeAllEmployees: isPrivileged,
      };

      const res = await apiCall({
        id: "getPayrollCalendar",
        api: api + apiEndpoints.payroll.calendar.getData,
        payload,
      });

      const resData = res?.data?.data || res?.data;
      if (res?.success && resData) {
        setCalendarPayload(resData);
      }
    } catch (err) {
      console.error("Error fetching payroll calendar data:", err);
    }
  }, [
    isPrivileged,
    selectedEmployeeId,
    selectedMonthIndex,
    selectedYear,
    user,
    apiCall,
  ]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Computed data from payload (supports both unwrapped and wrapped structures)
  const calendarPayloadResolved = calendarPayload?.data || calendarPayload;
  const calendarDays = calendarPayloadResolved?.calendarDays || [];
  const employeeInfo = calendarPayloadResolved?.employee || {};
  const summary = calendarPayloadResolved?.summary || {};
  const allEmployeesSummary = calendarPayloadResolved?.allEmployeesSummary || [];

  // Compute total days in month
  const totalDaysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
  }, [selectedYear, selectedMonthIndex]);

  // Offset of the 1st day of the selected month (0 = Sun, 1 = Mon, etc.)
  const firstDayOffset = useMemo(() => {
    return new Date(selectedYear, selectedMonthIndex, 1).getDay();
  }, [selectedYear, selectedMonthIndex]);

  // Build complete day tiles list (ensures numbers 1..31 are ALWAYS visible)
  const fullCalendarDays = useMemo(() => {
    const list = [];
    const curNow = new Date();
    const curNowYear = curNow.getFullYear();
    const curNowMonth = curNow.getMonth();
    const curNowDay = curNow.getDate();

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const existing = calendarDays.find((d) => d.day === day);
      const isPastDay =
        selectedYear < curNowYear ||
        (selectedYear === curNowYear && selectedMonthIndex < curNowMonth) ||
        (selectedYear === curNowYear &&
          selectedMonthIndex === curNowMonth &&
          day < curNowDay);

      const isTodayDate =
        selectedYear === curNowYear &&
        selectedMonthIndex === curNowMonth &&
        day === curNowDay;

      const isFutureDay = !isPastDay && !isTodayDate;

      if (existing) {
        // If it's a future date and has no punch recorded, ensure it is white / Blank (never Absent)
        if (
          isFutureDay &&
          !existing.details?.clockIn &&
          existing.type !== "Present"
        ) {
          list.push({
            ...existing,
            type: "Blank",
            status: "Upcoming",
            label: "Upcoming",
            color: "#64748b",
            bg: "#ffffff",
            isPaid: true,
          });
        } else {
          list.push(existing);
        }
      } else {
        const curDate = new Date(
          Date.UTC(selectedYear, selectedMonthIndex, day, 12, 0, 0),
        );
        const dayOfWeek = [
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ][curDate.getUTCDay()];
        const dateStr = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const isSun = curDate.getUTCDay() === 0;

        let type = "Blank";
        let status = "Upcoming";
        let label = "Upcoming";
        let color = "#64748b";
        let bg = "#ffffff";
        let isPaid = true;

        if (isPastDay) {
          if (isSun) {
            type = "Weekend";
            status = "Weekly Off";
            label = "Weekly Off";
            color = "#64748b";
            bg = "#f8fafc";
          } else {
            type = "Absent";
            status = "Absent";
            label = "Absent (No Punch)";
            color = "#ef4444";
            bg = "#fee2e2";
            isPaid = false;
          }
        } else if (isTodayDate) {
          type = isSun ? "Weekend" : "Blank";
          status = isSun ? "Weekly Off" : "Today (No Punch)";
          label = isSun ? "Weekly Off" : "Today (No Punch)";
          color = "#64748b";
          bg = isSun ? "#f8fafc" : "#ffffff";
        } else {
          // Future dates: Clean white tile, never Absent
          type = "Blank";
          status = "Upcoming";
          label = "Upcoming";
          color = "#64748b";
          bg = "#ffffff";
          isPaid = true;
        }

        list.push({
          day,
          date: dateStr,
          dayOfWeek,
          status,
          type,
          label,
          color,
          bg,
          isPaid,
          details: null,
        });
      }
    }
    return list;
  }, [totalDaysInMonth, selectedYear, selectedMonthIndex, calendarDays]);

  // Filter for Daily Records HpGrid: Only show today and previous dates (not next dates)
  const listingDays = useMemo(() => {
    const curNow = new Date();
    const curNowYear = curNow.getFullYear();
    const curNowMonth = curNow.getMonth();
    const curNowDay = curNow.getDate();

    return fullCalendarDays.filter((d) => {
      if (selectedYear < curNowYear) return true;
      if (selectedYear > curNowYear) return false;
      // Same year
      if (selectedMonthIndex < curNowMonth) return true;
      if (selectedMonthIndex > curNowMonth) return false;
      // Same month -> only show up to today
      return d.day <= curNowDay;
    });
  }, [fullCalendarDays, selectedYear, selectedMonthIndex]);

  // Currently active selected day item
  const activeDayItem = useMemo(() => {
    return (
      fullCalendarDays.find((d) => d.day === selectedDayNumber) ||
      fullCalendarDays[0] ||
      {}
    );
  }, [fullCalendarDays, selectedDayNumber]);

  // Calendar Month Navigation
  const handlePrevMonth = () => {
    if (selectedMonthIndex > 0) {
      setSelectedMonthIndex(selectedMonthIndex - 1);
    } else {
      setSelectedMonthIndex(11);
      setSelectedYear((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex < 11) {
      setSelectedMonthIndex(selectedMonthIndex + 1);
    } else {
      setSelectedMonthIndex(0);
      setSelectedYear((prev) => prev + 1);
    }
  };

  // Helper for small tile color styling
  const getTileStyleClass = (item) => {
    if (!item) return { cssClass: "tile-color-blank", dotColor: "transparent" };
    switch (item.type || item.status) {
      case "Holiday":
        return {
          cssClass: "tile-color-holiday",
          dotColor: "#8b5cf6",
        };
      case "LWP":
        return {
          cssClass: "tile-color-lwp",
          dotColor: "#ea580c",
        };
      case "Present":
        return {
          cssClass: "tile-color-present",
          dotColor: "#10b981",
        };
      case "Absent":
        return {
          cssClass: "tile-color-absent",
          dotColor: "#ef4444",
        };
      case "Weekend":
        return {
          cssClass: "tile-color-weekend",
          dotColor: "#94a3b8",
        };
      case "Blank":
      case "Scheduled":
      case "Pending":
      default:
        return {
          cssClass: "tile-color-blank",
          dotColor: "transparent",
        };
    }
  };

  // -------------------------------------------------------------
  // HpGrid Columns for Day-by-Day Logs
  // -------------------------------------------------------------
  const dayLogsColDef = useMemo(
    () => [
      {
        field: "date",
        headerName: "Date",
        width: 120,
        render: (val, row) => (
          <span style={{ fontWeight: 700, color: "#0f172a" }}>
            {formatDate(val || row?.date)}
          </span>
        ),
      },
      {
        field: "dayOfWeek",
        headerName: "Day",
        width: 90,
        render: (val, row) => <strong>{val || row?.dayOfWeek}</strong>,
      },
      {
        field: "status",
        headerName: "Status",
        width: 160,
        render: (val, row) => {
          const item = row || {};
          const cfg = getTileStyleClass(item);
          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor: item.bg || "#f1f5f9",
                color: item.color || "#334155",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: cfg.dotColor,
                }}
              />
              {item.label || item.status || val}
            </span>
          );
        },
      },
      {
        field: "timing",
        headerName: "Clock In - Out",
        width: 150,
        render: (_val, row) => {
          if (!row?.details?.clockIn || row?.details?.clockIn === "--") return "--";
          const hasClockOut =
            row?.details?.clockOut && row.details.clockOut !== "--";
          return `${row.details.clockIn} - ${hasClockOut ? row.details.clockOut : "--"}`;
        },
      },
      {
        field: "hours",
        headerName: "Hours",
        width: 110,
        render: (_val, row) => {
          // Punch-out is only recorded when user locks Day Report; do not show hours before punch-out
          const hasClockOut =
            row?.details?.clockOut && row.details.clockOut !== "--";
          if (!hasClockOut || !row?.details?.totalHours) return "--";
          return `${row.details.totalHours} hrs`;
        },
      },
      {
        field: "isPaid",
        headerName: "Salary Impact",
        width: 160,
        render: (_val, row) => {
          if (row?.type === "LWP" || row?.type === "Absent") {
            return (
              <span style={{ color: "#dc2626", fontWeight: 700 }}>
                Unpaid (-₹{employeeInfo.dailyRate || 0})
              </span>
            );
          }
          return (
            <span style={{ color: "#059669", fontWeight: 600 }}>
              Paid (₹0 Deduction)
            </span>
          );
        },
      },
      {
        field: "notes",
        headerName: "Holiday / Leave / Remarks",
        width: 250,
        render: (_val, row) =>
          row?.details?.holidayName ||
          row?.details?.reason ||
          row?.details?.remarks ||
          "--",
      },
    ],
    [employeeInfo.dailyRate],
  );

  // -------------------------------------------------------------
  // HpGrid Columns for All Employees Overview (Admin / HR)
  // -------------------------------------------------------------
  const allEmployeesColDef = useMemo(
    () => [
      {
        field: "employeeId",
        headerName: "Emp ID",
        width: 110,
        render: (val, row) => <strong>{val || row?.employeeId}</strong>,
      },
      {
        field: "employeeName",
        headerName: "Employee Name",
        width: 180,
        render: (val, row) => (
          <span style={{ fontWeight: 700, color: "#0f766e" }}>
            {val || row?.employeeName}
          </span>
        ),
      },
      {
        field: "department",
        headerName: "Department",
        width: 140,
      },
      {
        field: "designation",
        headerName: "Designation",
        width: 140,
      },
      {
        field: "monthlyCtc",
        headerName: "Monthly CTC",
        width: 120,
        render: (val, row) =>
          `₹${Number(val != null ? val : row?.monthlyCtc || 0).toLocaleString("en-IN")}`,
      },
      {
        field: "presentDays",
        headerName: "Present",
        width: 90,
        render: (val, row) => (
          <span style={{ color: "#059669", fontWeight: 700 }}>
            {val != null ? val : row?.presentDays || 0}
          </span>
        ),
      },
      {
        field: "weekendDays",
        headerName: "Weekend",
        width: 90,
        render: (val, row) => (
          <span style={{ color: "#64748b" }}>
            {val != null ? val : row?.weekendDays || 0}
          </span>
        ),
      },
      {
        field: "holidayDays",
        headerName: "Holiday",
        width: 90,
        render: (val, row) => (
          <span style={{ color: "#7c3aed" }}>
            {val != null ? val : row?.holidayDays || 0}
          </span>
        ),
      },
      {
        field: "lwpDays",
        headerName: "LWP",
        width: 90,
        render: (val, row) => (
          <span style={{ color: "#ea580c", fontWeight: 800 }}>
            {val != null ? val : row?.lwpDays || 0}
          </span>
        ),
      },
      {
        field: "absentDays",
        headerName: "Absent",
        width: 90,
        render: (val, row) => (
          <span style={{ color: "#dc2626", fontWeight: 800 }}>
            {val != null ? val : row?.absentDays || 0}
          </span>
        ),
      },
      {
        field: "leaveDeduction",
        headerName: "Leave Deduction",
        width: 150,
        render: (val, row) => {
          const deduction = Number(
            val != null ? val : row?.leaveDeduction || 0,
          );
          return (
            <strong
              style={{
                color: deduction > 0 ? "#dc2626" : "#059669",
                background: deduction > 0 ? "#fee2e2" : "#f0fdf4",
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              {deduction > 0
                ? `- ₹${deduction.toLocaleString("en-IN")}`
                : "₹0"}
            </strong>
          );
        },
      },
      {
        field: "actions",
        headerName: "Action",
        width: 110,
        render: (_val, row) => (
          <button
            type="button"
            className="hp-hover-btn"
            style={{ padding: "3px 8px", fontSize: "11px" }}
            onClick={() => {
              if (row?._id) setSelectedEmployeeId(row._id);
              setActiveTab("calendar");
            }}
          >
            <Eye size={12} />
            <span>Calendar</span>
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="payroll-cal-container">
      {/* 1. Sleek Compact Header Bar (Zero wasted space) */}
      <div className="payroll-header-bar">
        <div className="payroll-header-left">
          <h1 className="payroll-header-title">
            <CalendarDays size={18} style={{ color: "#0f766e" }} />
            <span>Payroll Attendance & Leave Calendar</span>
          </h1>

          <div className="payroll-header-badge">
            <User size={13} />
            <span>
              {employeeInfo.employeeName || user?.name || "Current Employee"} (
              {employeeInfo.employeeId || user?.employeeCode || "EMP"})
            </span>
          </div>
        </div>

        <div className="payroll-header-actions">
          {/* Employee Selector for Admin/HR using FormMethod SelectWrapper */}
          {isPrivileged && employeesList.length > 0 && (
            <div style={{ width: "260px" }}>
              <FormRenderer
                formMethod={employeeFilterForm}
                formSchema={employeeFilterForm.methods.getSchema()}
              />
            </div>
          )}

          {isPrivileged && (
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className={`hp-hover-btn ${activeTab === "calendar" ? "primary" : ""}`}
                onClick={() => setActiveTab("calendar")}
              >
                <Grid size={13} />
                <span>Calendar View</span>
              </button>
              <button
                type="button"
                className={`hp-hover-btn ${activeTab === "allEmployees" ? "primary" : ""}`}
                onClick={() => setActiveTab("allEmployees")}
              >
                <List size={13} />
                <span>All Employees</span>
              </button>
            </div>
          )}

          {/* Refresh Button: Moves up slightly on hover */}
          <button
            type="button"
            className="hp-hover-btn"
            onClick={fetchCalendarData}
            disabled={isPending("getPayrollCalendar")}
            title="Refresh Data"
          >
            <RefreshCw
              size={13}
              className={isPending("getPayrollCalendar") ? "spin" : ""}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CALENDAR VIEW */}
      {activeTab === "calendar" && (
        <>
          {/* 2. Professional Top KPI Metrics Row */}
          <div className="payroll-stats-row">
            <div className="payroll-stat-card present">
              <span className="payroll-stat-label">
                <span>Present</span>
                <CheckCircle2 size={13} style={{ color: "#10b981" }} />
              </span>
              <strong className="payroll-stat-value" style={{ color: "#047857" }}>
                {summary.presentDays ?? 0}
              </strong>
              <span className="payroll-stat-sub">Recorded Punches</span>
            </div>

            <div className="payroll-stat-card weekend">
              <span className="payroll-stat-label">Weekend</span>
              <strong className="payroll-stat-value" style={{ color: "#475569" }}>
                {summary.weekendDays ?? 0}
              </strong>
              <span className="payroll-stat-sub">Weekly Offs</span>
            </div>

            <div className="payroll-stat-card holiday">
              <span className="payroll-stat-label">
                <span>Holiday</span>
                <CalendarIcon size={13} style={{ color: "#8b5cf6" }} />
              </span>
              <strong className="payroll-stat-value" style={{ color: "#7c3aed" }}>
                {summary.holidayDays ?? 0}
              </strong>
              <span className="payroll-stat-sub">Paid Holidays</span>
            </div>

            <div className="payroll-stat-card lwp">
              <span className="payroll-stat-label">
                <span>LWP</span>
                <AlertCircle size={13} style={{ color: "#ea580c" }} />
              </span>
              <strong className="payroll-stat-value" style={{ color: "#c2410c" }}>
                {summary.lwpDays ?? 0}
              </strong>
              <span className="payroll-stat-sub">Leave Without Pay</span>
            </div>

            <div className="payroll-stat-card absent">
              <span className="payroll-stat-label">
                <span>Absent</span>
                <XCircle size={13} style={{ color: "#ef4444" }} />
              </span>
              <strong className="payroll-stat-value" style={{ color: "#dc2626" }}>
                {summary.absentDays ?? 0}
              </strong>
              <span className="payroll-stat-sub">Unexcused</span>
            </div>

            <div className="payroll-stat-card deduction">
              <span className="payroll-stat-label" style={{ color: "#991b1b" }}>
                <span>Leave Deduction</span>
                <DollarSign size={13} style={{ color: "#dc2626" }} />
              </span>
              <strong className="payroll-stat-value" style={{ color: "#991b1b" }}>
                ₹{Number(summary.estimatedLeaveDeduction || 0).toLocaleString("en-IN")}
              </strong>
              <span className="payroll-stat-sub" style={{ color: "#991b1b" }}>
                {summary.totalUnpaidDays || 0} days × ₹{employeeInfo.dailyRate || 0}
              </span>
            </div>
          </div>

          {/* 3. Middle Section: Proper Small Calendar + Selected Day Detail */}
          <div className="payroll-middle-grid">
            {/* LEFT: Proper Small Calendar Widget (Dates Fully Visible) */}
            <div className="payroll-small-calendar">
              <div>
                {/* Month & Year Navigation Toolbar directly in Calendar */}
                <div className="payroll-cal-nav-bar">
                  <button
                    type="button"
                    className="payroll-nav-arrow-btn"
                    onClick={handlePrevMonth}
                    title="Previous Month"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="payroll-cal-nav-selectors">
                    <select
                      className="payroll-cal-month-select"
                      value={selectedMonthIndex}
                      onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                      title="Select Month"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={m} value={idx}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <select
                      className="payroll-cal-year-select"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      title="Select Year"
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="payroll-nav-arrow-btn"
                    onClick={handleNextMonth}
                    title="Next Month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Weekday Row */}
                <div className="payroll-weekdays-row">
                  {WEEKDAY_SHORT.map((w) => (
                    <div key={w} className="payroll-weekday-cell">
                      {w}
                    </div>
                  ))}
                </div>

                {/* Day Tiles Grid (Numbers Always Clearly Visible) */}
                <div className="payroll-days-grid">
                  {/* Empty Offset Days */}
                  {Array.from({ length: firstDayOffset }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="payroll-day-tile empty"
                    />
                  ))}

                  {/* Month Day Numbers */}
                  {fullCalendarDays.map((item) => {
                    const cfg = getTileStyleClass(item);
                    const isSelected = activeDayItem?.day === item.day;
                    const isToday =
                      item.day === todayDay &&
                      selectedMonthIndex === todayMonthIndex &&
                      selectedYear === todayYear;

                    return (
                      <div
                        key={item.day}
                        className={`payroll-day-tile ${cfg.cssClass} ${isSelected ? "active-day" : ""} ${isToday ? "tile-color-today" : ""}`}
                        onClick={() => setSelectedDayNumber(item.day)}
                        title={`${item.date} (${item.dayOfWeek}): ${item.label || item.status}`}
                      >
                        <span className="payroll-day-number">{item.day}</span>
                        {cfg.dotColor && cfg.dotColor !== "transparent" && (
                          <span
                            className="payroll-day-indicator-dot"
                            style={{ backgroundColor: cfg.dotColor }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Color Legend below Small Calendar */}
              <div className="payroll-legend-strip">
                <div className="payroll-legend-item">
                  <span
                    className="payroll-legend-dot"
                    style={{ background: "#8b5cf6" }}
                  />
                  <span>Holiday</span>
                </div>
                <div className="payroll-legend-item">
                  <span
                    className="payroll-legend-dot"
                    style={{ background: "#ea580c" }}
                  />
                  <span>LWP</span>
                </div>
                <div className="payroll-legend-item">
                  <span
                    className="payroll-legend-dot"
                    style={{ background: "#10b981" }}
                  />
                  <span>Present</span>
                </div>
                <div className="payroll-legend-item">
                  <span
                    className="payroll-legend-dot"
                    style={{ background: "#ef4444" }}
                  />
                  <span>Absent</span>
                </div>
                <div className="payroll-legend-item">
                  <span
                    className="payroll-legend-dot"
                    style={{ background: "#64748b" }}
                  />
                  <span>Weekend</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Selected Day Detail Card (Always Populated, No Placeholder Text) */}
            <div className="payroll-day-card">
              <div>
                <div className="payroll-day-card-header">
                  <div className="payroll-day-card-title">
                    <CalendarDays size={16} style={{ color: "#0f766e" }} />
                    <span>
                      {activeDayItem?.date ? formatDate(activeDayItem.date) : "Selected Day"} {activeDayItem?.dayOfWeek ? `(${activeDayItem.dayOfWeek})` : ""}
                    </span>
                    <span
                      className="payroll-day-card-status"
                      style={{
                        backgroundColor: activeDayItem?.bg || "#f1f5f9",
                        color: activeDayItem?.color || "#0f172a",
                      }}
                    >
                      {activeDayItem?.label || activeDayItem?.status || "--"}
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Daily Rate:{" "}
                    <strong style={{ color: "#0f766e" }}>
                      ₹{Number(employeeInfo.dailyRate || 0).toLocaleString("en-IN")}/day
                    </strong>
                  </div>
                </div>

                <div className="payroll-day-card-grid">
                  <div className="payroll-info-box">
                    <span>Attendance Status</span>
                    <strong style={{ color: activeDayItem?.color || "#0f172a" }}>
                      {activeDayItem?.type || activeDayItem?.status || "--"}
                    </strong>
                  </div>

                  <div className="payroll-info-box">
                    <span>Payroll Deduction</span>
                    <strong
                      style={{
                        color:
                          activeDayItem?.type === "LWP" ||
                          activeDayItem?.type === "Absent"
                            ? "#dc2626"
                            : "#059669",
                      }}
                    >
                      {activeDayItem?.type === "LWP" ||
                      activeDayItem?.type === "Absent"
                        ? `- ₹${Number(employeeInfo.dailyRate || 0).toLocaleString("en-IN")} (Deducted)`
                        : "Paid (₹0 Deduction)"}
                    </strong>
                  </div>

                  <div className="payroll-info-box">
                    <span>Check-In Time</span>
                    <strong>{activeDayItem?.details?.clockIn || "--"}</strong>
                  </div>

                  <div className="payroll-info-box">
                    <span>Check-Out Time</span>
                    <strong>{activeDayItem?.details?.clockOut || "--"}</strong>
                  </div>
                </div>

                {(activeDayItem?.details?.holidayName ||
                  activeDayItem?.details?.reason ||
                  activeDayItem?.details?.remarks ||
                  activeDayItem?.details?.source) && (
                  <div className="payroll-notes-callout">
                    <Info size={14} />
                    <span>
                      <strong>Log Details:</strong>{" "}
                      {[
                        activeDayItem?.details?.holidayName,
                        activeDayItem?.details?.reason,
                        activeDayItem?.details?.remarks,
                        activeDayItem?.details?.source
                          ? `Source: ${activeDayItem?.details.source}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Employee Metadata Summary */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "12px",
                  paddingTop: "8px",
                  borderTop: "1px dashed #e2e8f0",
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                <span>
                  Department:{" "}
                  <strong style={{ color: "#334155" }}>
                    {employeeInfo.department || "General"}
                  </strong>{" "}
                  • Designation:{" "}
                  <strong style={{ color: "#334155" }}>
                    {employeeInfo.designation || "Staff"}
                  </strong>
                </span>

                <span>
                  Monthly CTC:{" "}
                  <strong style={{ color: "#0f766e" }}>
                    ₹{Number(employeeInfo.monthlyCtc || 0).toLocaleString("en-IN")}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* 4. Tabular HpGrid: Full Daily Records */}
          <div className="payroll-grid-card">
            <HpGrid
              id="payrollCalendarDailyGrid"
              rowData={listingDays}
              colDef={dayLogsColDef}
              title={`${employeeInfo.employeeName || user?.name || "Employee"} - Daily Records (${selectedMonthName} ${selectedYear})`}
              columnFilterable={true}
              panding={isPending("getPayrollCalendar")}
              style={{ height: "100%" }}
            />
          </div>
        </>
      )}

      {/* VIEW 2: ALL EMPLOYEES GRID (FOR ADMIN / HR) */}
      {activeTab === "allEmployees" && isPrivileged && (
        <div className="payroll-grid-card" style={{ height: "600px" }}>
          <HpGrid
            id="payrollAllEmployeesSummaryGrid"
            rowData={allEmployeesSummary}
            colDef={allEmployeesColDef}
            title={`All Employees Attendance & Deduction Summary (${selectedMonthName} ${selectedYear})`}
            columnFilterable={true}
            panding={isPending("getPayrollCalendar")}
            style={{ height: "100%" }}
          />
        </div>
      )}
    </div>
  );
};

export default PayrollCalendarListing;
