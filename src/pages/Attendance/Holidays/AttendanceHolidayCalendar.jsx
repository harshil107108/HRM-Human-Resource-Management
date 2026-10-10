import { useState, useEffect, useCallback, useMemo } from "react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import HpCard from "@/components/common/HpCard";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { Link } from "react-router-dom";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    RefreshCw,
    ExternalLink,
    PartyPopper,
} from "lucide-react";

const AttendanceHolidayCalendar = () => {
    const [holidays, setHolidays] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const { apiCall, isPending } = useApiCall();
    const { showAlert } = useAlert();

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

    useEffect(() => {
        fetchHolidays();
    }, [fetchHolidays]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    // Parse date safely to avoid timezone day shifts
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

    const upcomingHolidays = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return holidays
            .map((h) => {
                const parts = parseHolidayParts(h.holidayDate || h.date);
                const d = parts ? new Date(parts.year, parts.month, parts.day) : null;
                return { ...h, parsedDate: d };
            })
            .filter((h) => h.parsedDate && h.parsedDate >= now)
            .sort((a, b) => a.parsedDate - b.parsedDate)
            .slice(0, 6);
    }, [holidays]);

    const isLoading = isPending("getHolidayCalendar");

    useDocumentTitle("orvexa | Holiday Calendar");

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <PartyPopper size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Attendance Holiday Calendar</h1>
                        <p className="text-sm text-gray-500">Corporate & Public Holidays synchronized with Holiday Master ({year})</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        to="/master/holiday"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Configure Holidays in Holiday Master"
                    >
                        <ExternalLink size={14} />
                        Holiday Master
                    </Link>

                    <button
                        type="button"
                        onClick={goToToday}
                        className="px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                    >
                        Today
                    </button>

                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-0.5">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-1.5 rounded hover:bg-white text-gray-600 cursor-pointer transition-colors"
                            title="Previous Month"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="font-bold text-xs text-gray-800 px-3 min-w-[120px] text-center">
                            {monthNames[month]} {year}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-1.5 rounded hover:bg-white text-gray-600 cursor-pointer transition-colors"
                            title="Next Month"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={fetchHolidays}
                        disabled={isLoading}
                        className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors cursor-pointer"
                        title="Reload Holidays"
                    >
                        <RefreshCw size={15} className={isLoading ? "animate-spin text-blue-600" : ""} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-gray-500 mb-2 uppercase tracking-wider">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                            <div key={day} className={`py-1.5 ${idx === 0 || idx === 6 ? "text-red-500 font-extrabold" : ""}`}>
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                            <div key={`empty-${i}`} className="min-h-24 bg-gray-50/40 rounded-lg p-1 border border-gray-50"></div>
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            const key = `${year}-${month}-${dayNum}`;
                            const dayHolidays = holidayDateMap[key] || [];
                            const isHoliday = dayHolidays.length > 0;

                            const now = new Date();
                            const isToday =
                                now.getDate() === dayNum &&
                                now.getMonth() === month &&
                                now.getFullYear() === year;

                            return (
                                <div
                                    key={`day-${dayNum}`}
                                    className={`min-h-24 rounded-lg p-1.5 flex flex-col justify-between transition-all duration-150 border ${
                                        isHoliday
                                            ? "bg-red-50/80 border-red-300 ring-2 ring-red-400/40 shadow-xs"
                                            : isToday
                                            ? "bg-blue-50/50 border-blue-400 shadow-xs"
                                            : "border-gray-200 hover:bg-gray-50/80 hover:border-gray-300"
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span
                                            className={`text-xs font-bold ${
                                                isHoliday
                                                    ? "text-red-700 bg-red-100 ring-1 ring-red-300 rounded-full w-6 h-6 flex items-center justify-center font-black"
                                                    : isToday
                                                    ? "text-white bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-black"
                                                    : "text-gray-700 ml-1 mt-0.5"
                                            }`}
                                        >
                                            {dayNum}
                                        </span>

                                        {isHoliday && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-100/90 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                                                <Sparkles size={10} className="text-red-500 shrink-0" />
                                                Holiday
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1 mt-1">
                                        {dayHolidays.map((h, idx) => (
                                            <div
                                                key={idx}
                                                className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold px-1.5 py-1 rounded shadow-xs truncate cursor-default transition-colors"
                                                title={`${h.holidayName || h.name || "Holiday"} (${h.holidayType || "Holiday"})`}
                                            >
                                                {h.holidayName || h.name || "Holiday"}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Legend & Upcoming Holidays */}
                <div className="space-y-6">
                    {/* Calendar Color Legend */}
                    <HpCard title="Calendar Color Legend">
                        <div className="space-y-2.5 text-xs text-gray-700">
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-md bg-red-50 border-2 border-red-400 ring-1 ring-red-400/40 shrink-0"></span>
                                <div>
                                    <span className="font-bold text-red-700">Official Holiday (Red)</span>
                                    <p className="text-[11px] text-gray-500">Scheduled in Holiday Master</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-md bg-blue-50 border-2 border-blue-400 shrink-0"></span>
                                <div>
                                    <span className="font-bold text-blue-700">Today (Blue)</span>
                                    <p className="text-[11px] text-gray-500">Current active date</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-md bg-white border border-gray-300 shrink-0"></span>
                                <div>
                                    <span className="font-medium text-gray-700">Working Day</span>
                                    <p className="text-[11px] text-gray-500">Standard operational schedule</p>
                                </div>
                            </div>
                        </div>
                    </HpCard>

                    {/* Upcoming Holidays */}
                    <HpCard title="Upcoming Holidays">
                        {isLoading ? (
                            <div className="text-xs text-gray-500 py-6 text-center flex items-center justify-center gap-2">
                                <RefreshCw size={14} className="animate-spin text-blue-600" />
                                Loading holidays from master...
                            </div>
                        ) : upcomingHolidays.length === 0 ? (
                            <div className="text-xs text-gray-500 py-6 text-center">
                                No upcoming holidays scheduled in Holiday Master.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {upcomingHolidays.map((h, idx) => {
                                    const d = h.parsedDate;
                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-2.5 rounded-lg bg-red-50/50 border border-red-200/80 hover:bg-red-50 transition-colors"
                                        >
                                            <div className="space-y-0.5">
                                                <h4 className="text-xs font-bold text-red-900">
                                                    {h.holidayName || h.name}
                                                </h4>
                                                <p className="text-[11px] text-gray-500">
                                                    {d?.toLocaleDateString(undefined, {
                                                        weekday: "short",
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-wider">
                                                {h.holidayType || (h.paidHoliday ? "Paid" : "Holiday")}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </HpCard>

                    {/* Policy Guidelines */}
                    <HpCard title="Holiday Policy Note">
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Official holiday dates configured in <strong>Holiday Master</strong> are synchronized in real-time across Attendance Logs, Leave Balances, and Payroll calculations.
                        </p>
                    </HpCard>
                </div>
            </div>
        </div>
    );
};

export default AttendanceHolidayCalendar;
