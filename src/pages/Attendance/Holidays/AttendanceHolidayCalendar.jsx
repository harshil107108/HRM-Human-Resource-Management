import { useState, useEffect, useCallback, useMemo } from "react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import DateField from "@/form-engine/components/fields/DateField";
import {
  Calendar as CalendarIcon,
  Sparkles,
  RefreshCw,
  PartyPopper,
  CheckCircle2,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const pad2 = (n) => String(n).padStart(2, "0");

const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Clean holiday name to show pure festival/holiday name (e.g. "Diwali Holiday" -> "Diwali")
const cleanHolidayName = (name) => {
  if (!name) return "Holiday";
  const trimmed = name.trim();
  const cleaned = trimmed.replace(/\s+holiday$/i, "").trim();
  return cleaned || trimmed;
};

const AttendanceHolidayCalendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [weekendPolicy, setWeekendPolicy] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  const { apiCall, isPending } = useApiCall();
  const { showAlert } = useAlert();

  useDocumentTitle("orvexa | Holiday Calendar");

  // Fetch holidays from master
  const fetchHolidays = useCallback(async () => {
    try {
      const endpoint =
        apiEndpoints.master?.holiday?.HolidayGetData ||
        apiEndpoints.holiday?.getHoliday ||
        "/master/holiday/getHoliday";

      const res = await apiCall({
        id: "getHolidayCalendar",
        api: api + endpoint,
        payload: {},
      });

      if (res?.success) {
        const raw = res.data?.data ?? res.data;
        const data = Array.isArray(raw) ? raw : [];
        setHolidays(data);
      }
    } catch {
      showAlert("Failed to load holiday calendar", "error");
    }
  }, [apiCall, showAlert]);

  // Fetch active weekend policy
  const fetchWeekendPolicy = useCallback(async () => {
    try {
      const endpoint =
        apiEndpoints.attendance?.weekend?.WeekendGetData ||
        "/attendance/weekend/getWeekendPolicies";

      const res = await apiCall({
        id: "getWeekendPolicyForCalendar",
        api: api + endpoint,
        payload: {},
      });

      if (res?.success) {
        const raw = res.data?.data ?? res.data;
        const list = Array.isArray(raw) ? raw : [];
        const activePolicy = list.find((p) => p.status === "Active" || p.isActive) || list[0] || null;
        setWeekendPolicy(activePolicy);
      }
    } catch {
      // Quiet fallback to standard weekend
    }
  }, [apiCall]);

  const loadAll = useCallback(() => {
    fetchHolidays();
    fetchWeekendPolicy();
  }, [fetchHolidays, fetchWeekendPolicy]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(getTodayDateString());
  };

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    setCurrentDate(prev);
    setSelectedDate(`${prev.getFullYear()}-${pad2(prev.getMonth() + 1)}-01`);
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setCurrentDate(next);
    setSelectedDate(`${next.getFullYear()}-${pad2(next.getMonth() + 1)}-01`);
  };

  // Safely parse raw date into year, month (0-indexed), day
  const parseHolidayParts = (rawDate) => {
    if (!rawDate) return null;
    if (typeof rawDate === "string") {
      const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return {
          year: parseInt(match[1], 10),
          month: parseInt(match[2], 10) - 1,
          day: parseInt(match[3], 10),
        };
      }
    }
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate(),
      };
    }
    return null;
  };

  // Helper to check if a date is a weekend according to Weekend Policy
  const isDateWeekend = useCallback(
    (dateObj) => {
      if (!dateObj) return false;
      const dayIndex = dateObj.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
      const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];

      if (weekendPolicy && weekendPolicy.isActive !== false && weekendPolicy.status !== "Inactive") {
        const offDays =
          Array.isArray(weekendPolicy.days) && weekendPolicy.days.length > 0
            ? weekendPolicy.days
            : Array.isArray(weekendPolicy.weeklyOffDays) && weekendPolicy.weeklyOffDays.length > 0
            ? weekendPolicy.weeklyOffDays
            : ["Sunday"];

        // 1. Direct match: Full weekly off days (e.g. All Fridays, All Sundays)
        if (offDays.some((d) => d.toLowerCase() === dayName.toLowerCase())) {
          return true;
        }

        const dayOfMonth = dateObj.getDate();
        const occurrenceIndex = Math.floor((dayOfMonth - 1) / 7) + 1; // 1st, 2nd, 3rd, 4th, or 5th occurrence

        // 2. Flexible Alternate Rules for any day (e.g. Alternate Tuesday, Alternate Friday, Alternate Saturday)
        if (Array.isArray(weekendPolicy.alternateRules) && weekendPolicy.alternateRules.length > 0) {
          const matchingRules = weekendPolicy.alternateRules.filter(
            (r) => r.day && r.day.toLowerCase() === dayName.toLowerCase()
          );

          for (const rule of matchingRules) {
            const p = rule.pattern;
            if (p === "All") return true;
            if (p === "2nd & 4th" && (occurrenceIndex === 2 || occurrenceIndex === 4)) return true;
            if (p === "1st & 3rd" && (occurrenceIndex === 1 || occurrenceIndex === 3)) return true;
            if (p === "1st, 3rd & 5th" && (occurrenceIndex === 1 || occurrenceIndex === 3 || occurrenceIndex === 5)) return true;
          }
        }

        // 3. Fallback to alternateDay / alternatePattern (if saved as single fields)
        if (weekendPolicy.alternateDay && weekendPolicy.alternateDay.toLowerCase() === dayName.toLowerCase()) {
          const p = weekendPolicy.alternatePattern || "2nd & 4th";
          if (p === "All") return true;
          if (p === "2nd & 4th" && (occurrenceIndex === 2 || occurrenceIndex === 4)) return true;
          if (p === "1st & 3rd" && (occurrenceIndex === 1 || occurrenceIndex === 3)) return true;
          if (p === "1st, 3rd & 5th" && (occurrenceIndex === 1 || occurrenceIndex === 3 || occurrenceIndex === 5)) return true;
        }

        // 4. Legacy Alternate Saturday rule support
        if (dayIndex === 6 && weekendPolicy.alternateSaturdayRule) {
          const rule = weekendPolicy.alternateSaturdayRule;
          if (rule === "All Saturdays Off") return true;
          if (rule.includes("2nd & 4th") && (occurrenceIndex === 2 || occurrenceIndex === 4)) return true;
          if (rule.includes("1st & 3rd") && (occurrenceIndex === 1 || occurrenceIndex === 3)) return true;
        }

        return false;
      }

      // Default fallback when no custom policy exists in DB:
      // Sunday is always off, and 2nd & 4th Saturday off
      if (dayIndex === 0) return true;
      if (dayIndex === 6) {
        const saturdayIndex = Math.floor((dateObj.getDate() - 1) / 7) + 1;
        return saturdayIndex === 2 || saturdayIndex === 4;
      }
      return false;
    },
    [weekendPolicy]
  );

  // Group holidays by year-month-day key
  const holidayDateMap = useMemo(() => {
    const map = {};
    holidays.forEach((h) => {
      const raw = h.holidayDate || h.date;
      const parts = parseHolidayParts(raw);
      if (parts) {
        const key = `${parts.year}-${parts.month}-${parts.day}`;
        if (!map[key]) map[key] = [];
        map[key].push(h);
      }
    });
    return map;
  }, [holidays]);

  // Days in current month
  const daysInCurrentMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  // Full calendar grid calculations (42 or 35 cells)
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
    const prevMonthDaysCount = new Date(year, month, 0).getDate();

    // Previous month trailing days
    const prevDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDaysCount - i;
      const d = new Date(year, month - 1, dayNum);
      prevDays.push({
        dayNum,
        monthOffset: -1,
        dateObj: d,
        iso: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(dayNum)}`,
        key: `${d.getFullYear()}-${d.getMonth()}-${dayNum}`,
      });
    }

    // Current month days
    const currentDays = [];
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(year, month, i);
      currentDays.push({
        dayNum: i,
        monthOffset: 0,
        dateObj: d,
        iso: `${year}-${pad2(month + 1)}-${pad2(i)}`,
        key: `${year}-${month}-${i}`,
      });
    }

    // Next month leading days (fill up to 35 or 42)
    const totalFilled = prevDays.length + currentDays.length;
    const totalTarget = totalFilled > 35 ? 42 : 35;
    const nextDaysCount = totalTarget - totalFilled;
    const nextDays = [];
    for (let i = 1; i <= nextDaysCount; i++) {
      const d = new Date(year, month + 1, i);
      nextDays.push({
        dayNum: i,
        monthOffset: 1,
        dateObj: d,
        iso: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(i)}`,
        key: `${d.getFullYear()}-${d.getMonth()}-${i}`,
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [year, month, daysInCurrentMonth]);

  const totalWeeks = Math.ceil(calendarDays.length / 7);

  // Holidays on the SAME MONTH being viewed
  const sameMonthHolidays = useMemo(() => {
    return holidays
      .map((h) => {
        const parts = parseHolidayParts(h.holidayDate || h.date);
        const d = parts ? new Date(parts.year, parts.month, parts.day) : null;
        return { ...h, parsedDate: d, parts };
      })
      .filter((h) => h.parts && h.parts.year === year && h.parts.month === month)
      .sort((a, b) => a.parsedDate - b.parsedDate);
  }, [holidays, year, month]);

  // Overall statistics for year and current month
  const stats = useMemo(() => {
    const totalInYear = holidays.filter((h) => {
      const parts = parseHolidayParts(h.holidayDate || h.date);
      return parts && parts.year === year;
    }).length;

    return {
      totalInYear,
      inCurrentMonth: sameMonthHolidays.length,
    };
  }, [holidays, year, sameMonthHolidays]);

  // Holidays on the currently selected day
  const selectedDateHolidays = useMemo(() => {
    if (!selectedDate) return [];
    const [selY, selM, selD] = selectedDate.split("-").map(Number);
    if (!selY || !selM || !selD) return [];
    const key = `${selY}-${selM - 1}-${selD}`;
    return holidayDateMap[key] || [];
  }, [selectedDate, holidayDateMap]);

  // Check if selected date is a weekend
  const isSelectedDateWeekend = useMemo(() => {
    if (!selectedDate) return false;
    const [selY, selM, selD] = selectedDate.split("-").map(Number);
    if (!selY || !selM || !selD) return false;
    const d = new Date(selY, selM - 1, selD);
    return isDateWeekend(d);
  }, [selectedDate, isDateWeekend]);

  const todayStr = getTodayDateString();

  const handleCellClick = (cell) => {
    setSelectedDate(cell.iso);
    if (cell.monthOffset !== 0) {
      setCurrentDate(new Date(cell.dateObj.getFullYear(), cell.dateObj.getMonth(), cell.dateObj.getDate()));
    }
  };

  const handleHolidayItemClick = (holiday) => {
    if (holiday.parsedDate) {
      const iso = `${holiday.parsedDate.getFullYear()}-${pad2(holiday.parsedDate.getMonth() + 1)}-${pad2(holiday.parsedDate.getDate())}`;
      setSelectedDate(iso);
      setCurrentDate(new Date(holiday.parsedDate.getFullYear(), holiday.parsedDate.getMonth(), holiday.parsedDate.getDate()));
    }
  };

  const isLoading = isPending("getHolidayCalendar") || isPending("getWeekendPolicyForCalendar");

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden p-3 gap-2.5 bg-slate-50/50">
      {/* 1. Compact Managed Header Toolbar */}
      <div className="h-12 px-3 py-1.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 shrink-0">
        {/* Left: Icon, Title, Month Chip */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0">
            <PartyPopper size={16} />
          </div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight truncate">
            Attendance Holiday Calendar
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 shrink-0">
            <CalendarDays size={12} className="text-slate-500" />
            {monthNames[month]} {year}
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Form Method Date Input */}
          <div className="w-36 sm:w-44">
            <DateField
              id="holidayCalendarJumpDate"
              value={selectedDate}
              showRangeHint={false}
              showHint={false}
              onChange={(iso) => {
                if (iso) {
                  setSelectedDate(iso);
                  const [y, m, d] = iso.split("-").map(Number);
                  if (y && m) {
                    setCurrentDate(new Date(y, m - 1, d || 1));
                  }
                }
              }}
              placeholder="Select Date"
            />
          </div>

          {/* Today Button */}
          <button
            type="button"
            onClick={goToToday}
            className="hp-grid-add-btn cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 px-2.5 py-1 text-xs"
            title="Jump to Today"
          >
            <CalendarIcon size={12} />
            <span>Today</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadAll}
            disabled={isLoading}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer shadow-2xs"
            title="Reload Calendar"
          >
            <RefreshCw
              size={13}
              className={isLoading ? "animate-spin text-sky-600" : ""}
            />
          </button>
        </div>
      </div>

      {/* 2. Main Area: Full-screen No-Scroll Grid & Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 flex-1 min-h-0 overflow-hidden">
        {/* Left: Calendar with 1px Industry-Standard Continuous Grid (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col h-full min-h-0 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Calendar Sub-Header */}
          <div className="h-9 px-3 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs font-bold text-slate-800">
                {monthNames[month]} {year}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={15} />
              </button>
              <span className="text-[11px] text-slate-400 font-medium ml-1">
                • {daysInCurrentMonth} Days
              </span>
            </div>
            {sameMonthHolidays.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                <Sparkles size={11} className="text-indigo-500" />
                {sameMonthHolidays.length} {sameMonthHolidays.length === 1 ? "Holiday" : "Holidays"}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">
                No official holidays in {monthNames[month]}
              </span>
            )}
          </div>

          {/* Weekday Column Headers (Industry Standard 1px Borders) */}
          <div className="h-7 grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 shrink-0 text-center text-[10px] font-bold uppercase tracking-wider">
            {dayNames.map((day, idx) => {
              const isWeekendCol = idx === 0 || idx === 6;
              const isLastCol = idx === 6;
              return (
                <div
                  key={day}
                  className={`flex items-center justify-center ${
                    !isLastCol ? "border-r border-slate-200" : ""
                  } ${isWeekendCol ? "text-slate-400 font-semibold bg-slate-100/40" : "text-slate-600 font-semibold"}`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Days Grid: 1px Integrated Grid Lines across all rows and columns with No Page Scroll */}
          <div
            className="flex-1 min-h-0 grid grid-cols-7 border-l-0 border-t-0"
            style={{
              gridTemplateRows: `repeat(${totalWeeks}, minmax(0, 1fr))`,
            }}
          >
            {calendarDays.map((cell, idx) => {
              const isCurrentMonth = cell.monthOffset === 0;
              const dayHolidays = holidayDateMap[cell.key] || [];
              const isHoliday = dayHolidays.length > 0;
              const isWeekend = isDateWeekend(cell.dateObj);
              const isToday = cell.iso === todayStr;
              const isSelected = cell.iso === selectedDate;
              const isLastCol = (idx + 1) % 7 === 0;

              return (
                <div
                  key={cell.key}
                  onClick={() => handleCellClick(cell)}
                  className={`border-b border-r ${
                    isLastCol ? "border-r-0" : "border-r-slate-200"
                  } border-b-slate-200 p-1.5 flex flex-col justify-between overflow-hidden cursor-pointer transition-colors relative select-none ${
                    isSelected
                      ? `ring-2 ring-sky-600 ring-inset ${
                          isHoliday
                            ? "bg-indigo-50/80"
                            : isWeekend
                            ? "bg-slate-100/70"
                            : "bg-sky-50/40"
                        }`
                      : !isCurrentMonth
                      ? isHoliday
                        ? "bg-indigo-50/25 opacity-50"
                        : isWeekend
                        ? "bg-slate-50/60 opacity-40"
                        : "bg-slate-50/30 opacity-40"
                      : isHoliday
                      ? "bg-indigo-50/50 hover:bg-indigo-50/80"
                      : isWeekend
                      ? "bg-slate-50/40 hover:bg-slate-100/60"
                      : isToday
                      ? "bg-sky-50/25 hover:bg-sky-50/50"
                      : "bg-white hover:bg-slate-50/70"
                  }`}
                >
                  {/* Top Row: Date Number and Today Tag */}
                  <div className="flex justify-between items-start leading-none">
                    {isToday ? (
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                        {cell.dayNum}
                      </span>
                    ) : !isCurrentMonth ? (
                      <span className={`text-xs font-medium ${isHoliday ? "text-indigo-400" : "text-slate-300"}`}>
                        {cell.dayNum}
                      </span>
                    ) : isHoliday ? (
                      <span className="text-xs font-bold text-indigo-700">
                        {cell.dayNum}
                      </span>
                    ) : isWeekend ? (
                      <span className="text-xs font-semibold text-slate-400">
                        {cell.dayNum}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-700">
                        {cell.dayNum}
                      </span>
                    )}

                    {isToday && (
                      <span className="text-[8px] font-bold text-sky-700 bg-sky-100/80 px-1 py-0.2 rounded uppercase">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Festival / Weekend Badges in Cell */}
                  <div className="space-y-0.5 mt-0.5 overflow-hidden">
                    {isHoliday ? (
                      dayHolidays.slice(0, 2).map((h, hIdx) => {
                        const festivalName = cleanHolidayName(h.holidayName || h.name);
                        return (
                          <div
                            key={hIdx}
                            className="text-[10px] font-bold text-indigo-900 bg-indigo-100/85 border border-indigo-200/90 px-1.5 py-0.5 rounded shadow-2xs truncate flex items-center gap-1"
                            title={`${festivalName} • ${h.holidayType || "Official Holiday"}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                            <span className="truncate">{festivalName}</span>
                          </div>
                        );
                      })
                    ) : isWeekend && isCurrentMonth ? (
                      <span className="text-[9px] font-medium text-slate-500 bg-slate-100/90 border border-slate-200/80 px-1 py-0.2 rounded w-fit block truncate">
                        Weekend
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Compact Sidebar with No Page Scroll (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col h-full min-h-0 space-y-2 overflow-y-auto pr-0.5">
          {/* Card 1: 2026 Overview */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              {year} Calendar Overview
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2 text-center">
                <span className="text-base font-bold text-slate-800 leading-tight block">
                  {stats.totalInYear}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Total Holidays</span>
              </div>
              <div className="bg-indigo-50/60 border border-indigo-200/70 rounded-lg p-2 text-center">
                <span className="text-base font-bold text-indigo-700 leading-tight block">
                  {stats.inCurrentMonth}
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold">
                  In {monthNames[month].slice(0, 3)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Selected Day Details */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Selected Day Details
              </span>
              {selectedDate === todayStr && (
                <span className="text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded uppercase">
                  Today
                </span>
              )}
            </div>

            <div className="text-xs font-bold text-slate-800">
              {(() => {
                const [y, m, d] = (selectedDate || "").split("-").map(Number);
                if (!y || !m || !d) return "No date selected";
                const dateObj = new Date(y, m - 1, d);
                return dateObj.toLocaleDateString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
              })()}
            </div>

            {selectedDateHolidays.length > 0 ? (
              <div className="mt-2 space-y-1.5">
                {selectedDateHolidays.map((h, idx) => {
                  const festivalName = cleanHolidayName(h.holidayName || h.name);
                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-200/80 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          <PartyPopper size={13} className="text-indigo-600 shrink-0" />
                          <span className="truncate">{festivalName}</span>
                        </h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-600 text-white uppercase">
                          {h.holidayType || "Official"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] pt-1 border-t border-indigo-200/60">
                        {h.paidHoliday !== false && (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <CheckCircle2 size={11} /> Paid
                          </span>
                        )}
                        {h.recurringEveryYear && (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                            <Clock size={11} /> Annual
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : isSelectedDateWeekend ? (
              <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block leading-tight">Weekend / Weekly Off</span>
                  <p className="text-[10px] text-slate-500">Scheduled weekly off as per company policy.</p>
                </div>
              </div>
            ) : (
              <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block leading-tight">Standard Working Day</span>
                  <p className="text-[10px] text-slate-500">Regular attendance and operational schedule.</p>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Holidays in the SAME MONTH */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex-1 min-h-[140px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Holidays in {monthNames[month]}
              </span>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {sameMonthHolidays.length}
              </span>
            </div>

            {isLoading ? (
              <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <RefreshCw size={12} className="animate-spin text-sky-600" />
                <span>Loading...</span>
              </div>
            ) : sameMonthHolidays.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-slate-100">
                No official holidays in {monthNames[month]} {year}.
              </div>
            ) : (
              <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-0.5">
                {sameMonthHolidays.map((h, idx) => {
                  const d = h.parsedDate;
                  const dayNum = d ? pad2(d.getDate()) : "";
                  const dayOfWeek = d
                    ? d.toLocaleDateString(undefined, { weekday: "short" })
                    : "";
                  const festivalName = cleanHolidayName(h.holidayName || h.name);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleHolidayItemClick(h)}
                      className="flex items-center justify-between p-1.5 rounded-lg border border-slate-200/80 bg-white hover:bg-indigo-50/40 hover:border-indigo-200 transition-colors cursor-pointer shadow-2xs group"
                      title={`Jump to ${festivalName}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-200/80 font-bold text-xs text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {dayNum}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-900 transition-colors">
                            {festivalName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">{dayOfWeek}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/70 uppercase shrink-0">
                        {h.holidayType || "Official"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 4: Modern Color Legend */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0">
            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Calendar Color Legend
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-indigo-100 border border-indigo-300 shrink-0" />
                <span className="text-[11px] font-medium text-slate-700">Official Holiday</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300 shrink-0" />
                <span className="text-[11px] font-medium text-slate-700">Weekend / Off</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-sky-600 shrink-0" />
                <span className="text-[11px] font-medium text-slate-700">Today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-white border border-slate-300 shrink-0" />
                <span className="text-[11px] font-medium text-slate-700">Working Day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHolidayCalendar;
