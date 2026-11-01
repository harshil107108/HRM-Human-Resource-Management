import { useMemo, useCallback, useState, useEffect } from "react";
import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import useAttendanceLogConfig from "./useAttendanceLogConfig";
import useModal from "@/hooks/useModal";
import AttendanceLogModal from "./AttendanceLogModal";
import useApiCall from "@/hooks/useApiCall";
import useServerPagedRows from "@/hooks/useServerPagedRows";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";
import { formMethod, useWatch, DateField, SelectWrapper } from "@/form-engine";
import { useAuth } from "@/context/AuthContext";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const pad2 = (n) => String(n).padStart(2, "0");

// Returns today's date in local calendar time YYYY-MM-DD
const getLocalTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const formatLogRow = (item) => ({
  ...item,
  employeeName: item.employeeId
    ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""} (${item.employeeId.employeeId || ""})`
    : "N/A",
  date: formatDateForInput(item.date),
});

const AttendanceLogListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();
  const { user, isSuperAdmin } = useAuth();

  const isAdmin = Boolean(
    isSuperAdmin ||
    ["SUPER_ADMIN", "ADMIN"].includes(String(user?.roleCode || "").toUpperCase())
  );

  const [viewMode, setViewMode] = useState("day"); // 'day' | 'month'

  const todayStr = useMemo(() => getLocalTodayDate(), []);

  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  }, []);

  const [employeeOptions, setEmployeeOptions] = useState([]);

  // Load employee list for Admin filter dropdown
  useEffect(() => {
    if (!isAdmin) return;
    const fetchEmployees = async () => {
      try {
        const res = await apiCall({
          id: "getEmployeesForAttendanceFilter",
          api: api + apiEndpoints.employee.employee.EmployeeGetData,
          payload: {},
        });
        if (res?.success) {
          const list = (res.data?.data || []).map((emp) => ({
            label: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.employeeId || "EMP"})`,
            value: emp._id,
          }));
          setEmployeeOptions([{ label: "All Employees", value: "" }, ...list]);
        }
      } catch (err) {
        console.error("Failed to load employees for filter", err);
      }
    };
    fetchEmployees();
  }, [isAdmin, apiCall]);

  // Form Method instance for attendance log filters
  const filterForm = useMemo(() => {
    return formMethod.createForm({
      schema: [
        {
          id: "employeeId",
          type: "selectWrapper",
          placeHolder: "All Employees",
          options: [],
        },
        {
          id: "date",
          type: "date",
          showHint: false,
          showRangeHint: false,
        },
        {
          id: "month",
          type: "text",
        },
      ],
      initialValue: {
        employeeId: "",
        date: todayStr,
        month: currentMonthStr,
      },
    });
  }, [currentMonthStr, todayStr]);

  // Sync loaded employee options to filterForm schema
  useEffect(() => {
    if (employeeOptions.length > 0) {
      filterForm.methods.setSchema([
        {
          id: "employeeId",
          type: "selectWrapper",
          placeHolder: "All Employees",
          options: employeeOptions,
        },
        {
          id: "date",
          type: "date",
          showHint: false,
          showRangeHint: false,
        },
      ]);
    }
  }, [employeeOptions, filterForm]);

  const selectedEmployeeId = useWatch(filterForm, "employeeId");
  const selectedDate = useWatch(filterForm, "date");
  const selectedMonth = useWatch(filterForm, "month");

  // Query parameters sent to backend
  const filterParams = useMemo(() => {
    if (isAdmin) {
      const params = {};
      if (selectedEmployeeId) {
        params.employeeId = selectedEmployeeId;
      }
      if (viewMode === "month") {
        params.date = selectedMonth || currentMonthStr;
      } else if (selectedDate) {
        params.date = selectedDate;
      }
      return params;
    }

    // For regular employee: locked to their own employee ID and month-wise
    return {
      date: selectedMonth || currentMonthStr,
      employeeId: user?._id || "",
    };
  }, [isAdmin, viewMode, selectedDate, selectedEmployeeId, selectedMonth, currentMonthStr, user?._id]);

  // Server paged rows
  const logs = useServerPagedRows({
    api: api + apiEndpoints.attendance.log.LogGetData,
    params: filterParams,
    mapRow: formatLogRow,
  });

  const handleSetToday = useCallback(() => {
    const isMonth = !isAdmin || viewMode === "month";
    if (isMonth) {
      filterForm.methods.setValue("month", currentMonthStr);
    } else {
      filterForm.methods.setValue("date", todayStr);
    }
  }, [isAdmin, viewMode, currentMonthStr, todayStr, filterForm]);

  const handlePrevMonth = useCallback(() => {
    const current = selectedMonth || currentMonthStr;
    const [y, m] = current.split("-").map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const nextVal = `${prevDate.getFullYear()}-${pad2(prevDate.getMonth() + 1)}`;
    filterForm.methods.setValue("month", nextVal);
  }, [selectedMonth, currentMonthStr, filterForm]);

  const handleNextMonth = useCallback(() => {
    const current = selectedMonth || currentMonthStr;
    const [y, m] = current.split("-").map(Number);
    const nextDate = new Date(y, m, 1);
    const nextVal = `${nextDate.getFullYear()}-${pad2(nextDate.getMonth() + 1)}`;
    filterForm.methods.setValue("month", nextVal);
  }, [selectedMonth, currentMonthStr, filterForm]);

  const monthDisplay = useMemo(() => {
    const current = selectedMonth || currentMonthStr;
    const [y, m] = current.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [selectedMonth, currentMonthStr]);

  // Target employee name for headers and virtual absent rows
  const targetEmployeeName = useMemo(() => {
    if (isAdmin && selectedEmployeeId) {
      const match = employeeOptions.find((e) => e.value === selectedEmployeeId);
      return match ? match.label : "Employee";
    }
    if (!isAdmin && user) {
      return `${user.firstName || ""} ${user.lastName || ""} (${user.employeeId || ""})`.trim();
    }
    return "";
  }, [isAdmin, selectedEmployeeId, employeeOptions, user]);

  // Generate Absent attendance logs for TODAY and PREVIOUS DATES; STRICTLY NOT for any NEXT/FUTURE dates!
  const displayRows = useMemo(() => {
    const isMonthView = !isAdmin || viewMode === "month";
    const targetEmpId = isAdmin ? selectedEmployeeId : user?._id;

    // Filter helper: never display future dates with status Absent
    const sanitizeLogs = (list) => list.filter((r) => !(r.status === "Absent" && r.date > todayStr));

    // 1. MONTH-WISE VIEW
    if (isMonthView) {
      if (!targetEmpId) {
        // Admin viewing "All Employees" in Month view: return server logs without future absent rows
        return sanitizeLogs(logs.rows);
      }

      const monthStr = selectedMonth || currentMonthStr;
      const [y, m] = monthStr.split("-").map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();

      const existingByDate = new Map();
      logs.rows.forEach((row) => {
        if (row.date) {
          // Skip any future absent records
          if (row.status === "Absent" && row.date > todayStr) return;
          existingByDate.set(row.date, row);
        }
      });

      const result = [];
      for (let day = daysInMonth; day >= 1; day--) {
        const dayStr = `${y}-${pad2(m)}-${pad2(day)}`;

        if (existingByDate.has(dayStr)) {
          result.push(existingByDate.get(dayStr));
        } else {
          // STRICT RULE: Only TODAY and PREVIOUS dates! Skip all next / future dates!
          if (dayStr > todayStr) continue;

          // Skip weekend days (0 = Sunday, 6 = Saturday)
          const dayOfWeek = new Date(y, m - 1, day).getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          if (!isWeekend) {
            result.push({
              _id: `absent_${targetEmpId}_${dayStr}`,
              employeeId: targetEmpId,
              employeeName: targetEmployeeName || "Employee",
              date: dayStr,
              clockIn: "-",
              clockOut: "-",
              totalHours: 0,
              status: "Absent",
              source: "System",
              remarks: dayStr === todayStr ? "Absent today (No punch recorded)" : "Absent (No punch recorded)",
              isVirtual: true,
            });
          }
        }
      }

      return result;
    }

    // 2. DAY-WISE VIEW (viewMode === 'day')
    const activeDate = selectedDate || todayStr;

    // If activeDate is in the future (> todayStr), NEVER show absent logs!
    if (activeDate > todayStr) {
      return sanitizeLogs(logs.rows);
    }

    // If activeDate <= todayStr (Today or Previous date):
    // Check if it's a weekend
    const [y, m, d] = activeDate.split("-").map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      return sanitizeLogs(logs.rows);
    }

    // When a specific employee is selected in Day view:
    if (targetEmpId) {
      if (logs.rows.length > 0) {
        return sanitizeLogs(logs.rows);
      }
      // Employee has no punch on this past/today weekday -> Show Absent row!
      return [
        {
          _id: `absent_${targetEmpId}_${activeDate}`,
          employeeId: targetEmpId,
          employeeName: targetEmployeeName || "Employee",
          date: activeDate,
          clockIn: "-",
          clockOut: "-",
          totalHours: 0,
          status: "Absent",
          source: "System",
          remarks: activeDate === todayStr ? "Absent today (No punch recorded)" : "Absent (No punch recorded)",
          isVirtual: true,
        },
      ];
    }

    // When "All Employees" is selected in Day view for today or a previous date:
    if (employeeOptions.length > 0) {
      const realEmployees = employeeOptions.filter((e) => Boolean(e.value));
      const punchedEmpIds = new Set(
        logs.rows.map((r) => String(r.employeeId?._id || r.employeeId || ""))
      );

      const unpunchedAbsentRows = [];
      realEmployees.forEach((emp) => {
        if (!punchedEmpIds.has(String(emp.value))) {
          unpunchedAbsentRows.push({
            _id: `absent_${emp.value}_${activeDate}`,
            employeeId: emp.value,
            employeeName: emp.label,
            date: activeDate,
            clockIn: "-",
            clockOut: "-",
            totalHours: 0,
            status: "Absent",
            source: "System",
            remarks: activeDate === todayStr ? "Absent today (No punch recorded)" : "Absent (No punch recorded)",
            isVirtual: true,
          });
        }
      });

      return [...sanitizeLogs(logs.rows), ...unpunchedAbsentRows];
    }

    return sanitizeLogs(logs.rows);
  }, [
    isAdmin,
    viewMode,
    selectedEmployeeId,
    user?._id,
    logs.rows,
    selectedMonth,
    selectedDate,
    currentMonthStr,
    todayStr,
    targetEmployeeName,
    employeeOptions,
  ]);

  const handleDelete = useCallback((id) => {
    deleteAlert({
      title: "Delete Attendance Log?",
      text: "Are you sure you want to delete this attendance log? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteAttendanceLog",
          api: api + apiEndpoints.attendance.log.LogDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Log Deleted",
            text: "Attendance log deleted successfully.",
          });
          logs.reload();
        }
      },
    });
  }, [deleteAlert, successAlert, apiCall, logs]);

  const { attendanceLogListingColDef } = useAttendanceLogConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();

  const colDef = useMemo(() => {
    if (!isAdmin) {
      return attendanceLogListingColDef.filter((c) => c.id !== "action");
    }
    return attendanceLogListingColDef;
  }, [isAdmin, attendanceLogListingColDef]);

  const handleAdd = () => {
    onModalOpen({
      mode: "add",
      defaultDate: selectedDate,
      defaultEmployeeId: selectedEmployeeId || undefined,
    });
  };

  const handleDoubleClick = useCallback((data) => {
    if (!isAdmin) return;
    const row = data?.data;
    if (!row) return;

    if (row.isVirtual) {
      onModalOpen({
        mode: "add",
        defaultDate: row.date,
        defaultEmployeeId: row.employeeId,
        defaultStatus: "Absent",
      });
    } else if (row._id) {
      onModalOpen({ mode: "edit", id: row._id });
    }
  }, [isAdmin, onModalOpen]);

  useDocumentTitle("orvexa | Attendance Logs");

  // Right-click menu for edit/delete (Admin only)
  const contextData = useMemo(() => {
    if (!isAdmin) return [];
    return createRowContextMenu({
      onEdit: (row) => handleDoubleClick({ data: row }),
      onDelete: (row) => {
        if (!row.isVirtual) {
          handleDelete(row._id);
        }
      },
    });
  }, [isAdmin, handleDoubleClick, handleDelete]);

  // Custom row class to color Absent rows in red
  const getRowClass = useCallback((row) => {
    if (row?.status === "Absent") {
      return "hp-grid-row--absent";
    }
    return "";
  }, []);

  const gridTitle = useMemo(() => {
    if (!isAdmin) {
      return `My Attendance Logs (${monthDisplay})`;
    }
    if (selectedEmployeeId && targetEmployeeName) {
      return viewMode === "month"
        ? `${targetEmployeeName} - Attendance Logs (${monthDisplay})`
        : `${targetEmployeeName} - Attendance Logs (${selectedDate || "Today"})`;
    }
    return viewMode === "month"
      ? `Attendance Logs (${monthDisplay})`
      : "Attendance Logs";
  }, [isAdmin, selectedEmployeeId, targetEmployeeName, viewMode, monthDisplay, selectedDate]);

  const toolbarControls = useMemo(() => {
    if (isAdmin) {
      return (
        <div className="flex items-center gap-2.5">
          {/* Employee dropdown using formMethod SelectWrapper */}
          <div className="w-56">
            <SelectWrapper
              form={filterForm}
              field={{
                id: "employeeId",
                placeHolder: "All Employees",
                options: employeeOptions,
              }}
            />
          </div>

          {/* View Mode Toggle: Day vs Month */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("day")}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition cursor-pointer ${
                viewMode === "day"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition cursor-pointer ${
                viewMode === "month"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Month
            </button>
          </div>

          {/* Controls depending on View Mode */}
          {viewMode === "month" ? (
            <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200 rounded-lg p-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs font-bold text-slate-700 px-2.5 select-none min-w-[120px] text-center">
                {monthDisplay}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          ) : (
            <div className="w-48">
              <DateField
                form={filterForm}
                field={{
                  id: "date",
                  showHint: false,
                  showRangeHint: false,
                }}
              />
            </div>
          )}

          {/* Today button styled same as Day Report */}
          <button
            type="button"
            onClick={handleSetToday}
            className="hp-grid-add-btn cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
            title={viewMode === "month" ? "Jump to Current Month" : "Jump to Today"}
          >
            <Calendar size={13} />
            <span>Today</span>
          </button>
        </div>
      );
    }

    // Regular Employee Month-Wise Toolbar
    return (
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200 rounded-lg p-0.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-bold text-slate-700 px-2.5 select-none min-w-[120px] text-center">
            {monthDisplay}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition cursor-pointer"
            title="Next Month"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Today button styled same as Day Report */}
        <button
          type="button"
          onClick={handleSetToday}
          className="hp-grid-add-btn cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
          title="Jump to Current Month"
        >
          <Calendar size={13} />
          <span>Today</span>
        </button>
      </div>
    );
  }, [
    isAdmin,
    viewMode,
    filterForm,
    employeeOptions,
    handleSetToday,
    handlePrevMonth,
    handleNextMonth,
    monthDisplay,
  ]);

  return (
    <>
      {isModalOpen && (
        <AttendanceLogModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={logs.reload}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="attendanceLogListing"
        rowData={displayRows}
        colDef={colDef}
        rowClassName={getRowClass}
        style={{ height: "100%" }}
        onDoubleClick={isAdmin ? handleDoubleClick : undefined}
        onAddClick={isAdmin ? handleAdd : undefined}
        title={gridTitle}
        toolbarRight={toolbarControls}
        columnFilterable={true}
        serverSide
        onColumnFiltersChange={logs.setFilters}
        onLoadMore={logs.loadMore}
        hasMore={logs.hasMore}
        loadingMore={logs.loadingMore}
        loadMoreError={logs.loadMoreError}
        onRetryLoadMore={logs.retryLoadMore}
        totalCount={logs.total}
        panding={isPending("deleteAttendanceLog") || logs.loading}
      />
    </>
  );
};

export default AttendanceLogListing;
