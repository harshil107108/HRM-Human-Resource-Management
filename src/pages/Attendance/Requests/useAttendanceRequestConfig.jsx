import { useMemo } from "react";
import { formatDateForInput } from "@/utils/dateUtils";

export const useAttendanceRequestConfig = ({ handleDelete } = {}) => {
    const attendanceRequestListingColDef = [
        {
            id: "employeeName",
            field: "employeeName",
            headerName: "Employee",
            width: 220,
        },
        {
            id: "requestType",
            field: "requestType",
            headerName: "Type",
            width: 150,
        },
        {
            id: "date",
            field: "date",
            headerName: "Date",
            width: 130,
        },
        {
            id: "inTime",
            field: "inTime",
            headerName: "In Time",
            width: 120,
        },
        {
            id: "outTime",
            field: "outTime",
            headerName: "Out Time",
            width: 120,
        },
        {
            id: "status",
            field: "status",
            headerName: "Status",
            width: 130,
        },
        {
            id: "reason",
            field: "reason",
            headerName: "Reason",
            width: 260,
        },
        {
            id: "action",
            field: "action",
            headerName: "Action",
            width: 80,
            type: "actions",
            onClick: (data) => {
                handleDelete?.(data._id);
            },
        },
    ];

    const initialValue = useMemo(() => ({
        employeeId: "",
        requestType: "Regularization",
        date: formatDateForInput(new Date()),
        inTime: "09:00",
        outTime: "18:00",
        reason: "",
        status: "Pending",
        rejectionReason: ""
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
        requestType: {
            type: "selectWrapper",
            label: "Request Type",
            required: true,
            options: [
                { label: "Regularization", value: "Regularization" },
                { label: "Manual Punch", value: "Manual Punch" },
                { label: "Overtime", value: "Overtime" },
                { label: "On Duty", value: "On Duty" }
            ],
            className: "col-span-6"
        },
        date: {
            type: "date",
            label: "Date",
            required: true,
            className: "col-span-3"
        },
        inTime: {
            type: "text",
            label: "Expected / Requested In Time",
            placeholder: "09:00",
            className: "col-span-3"
        },
        outTime: {
            type: "text",
            label: "Expected / Requested Out Time",
            placeholder: "18:00",
            className: "col-span-3"
        },
        status: {
            type: "selectWrapper",
            label: "Status",
            options: [
                { label: "Pending", value: "Pending" },
                { label: "Approved", value: "Approved" },
                { label: "Rejected", value: "Rejected" }
            ],
            className: "col-span-3"
        },
        reason: {
            type: "textarea",
            label: "Reason for Request",
            required: true,
            placeholder: "Explain reason for regularization or manual punch...",
            className: "col-span-12"
        },
        rejectionReason: {
            type: "textarea",
            label: "Manager Rejection Reason (If Rejected)",
            placeholder: "Explain rejection reason...",
            className: "col-span-12"
        }
    }), []);

    return {
        attendanceRequestListingColDef,
        initialValue,
        schema,
        attendanceRequestSchema: schema,
    };
};

export default useAttendanceRequestConfig;
