import { useMemo } from "react";
import { formatDateForInput } from "@/utils/dateUtils";

export const useAttendanceLogConfig = ({ handleDelete } = {}) => {
    const attendanceLogListingColDef = [
        {
            id: "employeeName",
            field: "employeeName",
            headerName: "Employee",
            width: 220,
        },
        {
            id: "date",
            field: "date",
            headerName: "Date",
            width: 130,
        },
        {
            id: "clockIn",
            field: "clockIn",
            headerName: "Clock In",
            width: 110,
        },
        {
            id: "clockOut",
            field: "clockOut",
            headerName: "Clock Out",
            width: 110,
        },
        {
            id: "totalHours",
            field: "totalHours",
            headerName: "Total Hours",
            width: 120,
        },
        {
            id: "status",
            field: "status",
            headerName: "Status",
            width: 130,
            render: (val) => {
                const s = String(val || "Present");
                let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                if (s === "Absent") {
                    badgeClass = "bg-rose-100 text-rose-700 border-rose-300 font-semibold";
                } else if (s === "Half Day") {
                    badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                } else if (s === "On Leave") {
                    badgeClass = "bg-sky-50 text-sky-700 border-sky-200";
                } else if (s === "Holiday" || s === "Weekly Off") {
                    badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
                } else if (s === "Late") {
                    badgeClass = "bg-orange-50 text-orange-700 border-orange-200";
                }
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${badgeClass}`}>
                        {s}
                    </span>
                );
            },
        },
        {
            id: "source",
            field: "source",
            headerName: "Source",
            width: 180,
        },
        {
            id: "remarks",
            field: "remarks",
            headerName: "Remarks",
            width: 260,
        },
        {
            id: "action",
            field: "action",
            headerName: "Action",
            width: 80,
            type: "actions",
            deleteDisabled: (row) => Boolean(row?.isVirtual),
            deleteDisabledTitle: (row) => row?.isVirtual ? "Unrecorded absence" : "Delete",
            onClick: (data) => {
                if (!data?.isVirtual) {
                    handleDelete?.(data._id);
                }
            },
        },
    ];

    const initialValue = useMemo(() => ({
        employeeId: "",
        date: formatDateForInput(new Date()),
        clockIn: "09:00",
        clockOut: "18:00",
        status: "Present",
        source: "Web",
        remarks: "",
    }), []);

    const schema = useMemo(() => ({
        employeeId: {
            type: "selectWrapper",
            label: "Employee",
            required: true,
            placeholder: "Select Employee",
            options: [],
            className: "col-span-6"
        },
        date: {
            type: "date",
            label: "Attendance Date",
            required: true,
            className: "col-span-6"
        },
        clockIn: {
            type: "text",
            label: "Clock In (HH:mm)",
            placeholder: "09:00",
            className: "col-span-3"
        },
        clockOut: {
            type: "text",
            label: "Clock Out (HH:mm)",
            placeholder: "18:00",
            className: "col-span-3"
        },
        status: {
            type: "selectWrapper",
            label: "Status",
            required: true,
            options: [
                { label: "Present", value: "Present" },
                { label: "Absent", value: "Absent" },
                { label: "Half Day", value: "Half Day" },
                { label: "Late", value: "Late" },
                { label: "On Leave", value: "On Leave" },
                { label: "Holiday", value: "Holiday" },
                { label: "Weekly Off", value: "Weekly Off" }
            ],
            className: "col-span-3"
        },
        source: {
            type: "selectWrapper",
            label: "Source",
            options: [
                { label: "Web", value: "Web" },
                { label: "Biometric", value: "Biometric" },
                { label: "Mobile", value: "Mobile" },
                { label: "Manual Regularization", value: "Manual Regularization" }
            ],
            className: "col-span-3"
        },
        remarks: {
            type: "textarea",
            label: "Remarks",
            placeholder: "Add any remarks...",
            className: "col-span-12"
        }
    }), []);

    return {
        attendanceLogListingColDef,
        initialValue,
        schema,
        attendanceLogSchema: schema,
    };
};

export default useAttendanceLogConfig;
