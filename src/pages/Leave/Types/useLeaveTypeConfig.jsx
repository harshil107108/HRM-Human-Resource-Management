import { useMemo } from "react";

export const useLeaveTypeConfig = ({ handleDelete } = {}) => {
    const leaveTypeListingColDef = [
        {
            id: "typeName",
            field: "typeName",
            headerName: "Leave Type",
            width: 220,
        },
        {
            id: "typeCode",
            field: "typeCode",
            headerName: "Code",
            width: 130,
        },
        {
            id: "daysAllowed",
            field: "daysAllowed",
            headerName: "Annual Allowance",
            width: 160,
            type: "number",
        },
        {
            id: "isPaidText",
            field: "isPaidText",
            headerName: "Paid Leave",
            width: 130,
        },
        {
            id: "isCarryForwardText",
            field: "isCarryForwardText",
            headerName: "Carry Forward",
            width: 160,
        },
        {
            id: "status",
            field: "status",
            headerName: "Status",
            width: 120,
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
        typeName: "",
        typeCode: "",
        daysAllowed: 12,
        isPaid: true,
        isCarryForward: false,
        maxCarryForwardDays: 0,
        requiresApproval: true,
        status: "Active",
        description: ""
    }), []);

    const schema = useMemo(() => ({
        typeName: {
            type: "text",
            label: "Leave Type Name",
            required: true,
            placeholder: "e.g. Casual Leave",
            className: "col-span-6"
        },
        typeCode: {
            type: "text",
            label: "Leave Code",
            required: true,
            placeholder: "e.g. CL",
            className: "col-span-6"
        },
        daysAllowed: {
            type: "number",
            label: "Days Allowed Per Year",
            required: true,
            placeholder: "12",
            className: "col-span-3"
        },
        maxCarryForwardDays: {
            type: "number",
            label: "Max Carry Forward Days",
            placeholder: "0",
            className: "col-span-3"
        },
        status: {
            type: "selectWrapper",
            label: "Status",
            options: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" }
            ],
            className: "col-span-6"
        },
        isPaid: {
            type: "checkbox",
            label: "Is Paid Leave",
            className: "col-span-4"
        },
        isCarryForward: {
            type: "checkbox",
            label: "Allow Carry Forward",
            className: "col-span-4"
        },
        requiresApproval: {
            type: "checkbox",
            label: "Requires Approval",
            className: "col-span-4"
        },
        description: {
            type: "textarea",
            label: "Description",
            placeholder: "Leave policy specifics...",
            className: "col-span-12"
        }
    }), []);

    return {
        leaveTypeListingColDef,
        initialValue,
        schema,
        leaveTypeSchema: schema,
    };
};

export default useLeaveTypeConfig;
