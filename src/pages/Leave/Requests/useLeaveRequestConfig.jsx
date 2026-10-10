import { useMemo } from "react";
import { formatDateForInput } from "@/utils/dateUtils";

export const useLeaveRequestConfig = ({ handleDelete } = {}) => {
    const leaveRequestListingColDef = [
        {
            id: "employeeName",
            field: "employeeName",
            headerName: "Employee",
            width: 220,
        },
        {
            id: "leaveTypeName",
            field: "leaveTypeName",
            headerName: "Leave Type",
            width: 170,
        },
        {
            id: "startDate",
            field: "startDate",
            headerName: "Start Date",
            width: 130,
        },
        {
            id: "endDate",
            field: "endDate",
            headerName: "End Date",
            width: 130,
        },
        {
            id: "days",
            field: "days",
            headerName: "Days",
            width: 110,
            type: "number",
        },
        {
            id: "status",
            field: "status",
            headerName: "Status",
            width: 120,
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
        leaveTypeId: "",
        startDate: formatDateForInput(new Date()),
        endDate: formatDateForInput(new Date()),
        days: 1,
        isHalfDay: false,
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
        leaveTypeId: {
            type: "selectWrapper",
            label: "Leave Type",
            required: true,
            placeholder: "Select Leave Type",
            options: [],
            className: "col-span-6"
        },
        startDate: {
            type: "date",
            label: "Start Date",
            required: true,
            className: "col-span-3"
        },
        endDate: {
            type: "date",
            label: "End Date",
            required: true,
            className: "col-span-3"
        },
        days: {
            type: "number",
            label: "Total Days",
            required: true,
            placeholder: "1",
            className: "col-span-3"
        },
        isHalfDay: {
            type: "checkbox",
            label: "Is Half Day",
            className: "col-span-3"
        },
        status: {
            type: "selectWrapper",
            label: "Status",
            options: [
                { label: "Pending", value: "Pending" },
                { label: "Approved", value: "Approved" },
                { label: "Rejected", value: "Rejected" },
                { label: "Cancelled", value: "Cancelled" }
            ],
            className: "col-span-6"
        },
        reason: {
            type: "textarea",
            label: "Reason for Leave",
            required: true,
            placeholder: "Explain purpose of leave...",
            className: "col-span-12"
        },
        rejectionReason: {
            type: "textarea",
            label: "Manager Notes / Rejection Reason",
            placeholder: "Notes if rejected or conditionally approved...",
            className: "col-span-12"
        }
    }), []);

    return {
        leaveRequestListingColDef,
        initialValue,
        schema,
        leaveRequestSchema: schema,
    };
};

export default useLeaveRequestConfig;
