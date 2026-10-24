import { useMemo } from "react";

export const useWeekendPolicyConfig = ({ handleDelete } = {}) => {
    const weekendPolicyListingColDef = [
        {
            id: "policyName",
            field: "policyName",
            headerName: "Policy Name",
            width: 220,
        },
        {
            id: "policyCode",
            field: "policyCode",
            headerName: "Policy Code",
            width: 140,
        },
        {
            id: "daysText",
            field: "daysText",
            headerName: "Full Weekly Off Days",
            width: 220,
        },
        {
            id: "alternateText",
            field: "alternateText",
            headerName: "Alternate Off Rules",
            width: 260,
        },
        {
            id: "status",
            field: "status",
            headerName: "Status",
            width: 120,
        },
        {
            id: "description",
            field: "description",
            headerName: "Description",
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
        policyName: "",
        policyCode: "",
        description: "",
        days: ["Sunday"],
        alternateRules: [],
        status: "Active"
    }), []);

    const schema = useMemo(() => ({
        policyName: {
            type: "text",
            label: "Policy Name",
            required: true,
            placeholder: "e.g. Standard Corporate Policy",
            className: "col-span-5"
        },
        policyCode: {
            type: "text",
            label: "Policy Code",
            required: true,
            placeholder: "e.g. WP-CORP",
            className: "col-span-3"
        },
        status: {
            type: "selectWrapper",
            label: "Status",
            options: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" }
            ],
            className: "col-span-4"
        },
        description: {
            type: "textarea",
            label: "Description / Notes",
            placeholder: "Optional notes regarding schedule rules and exceptions...",
            className: "col-span-12 [&_textarea]:min-h-[50px] [&_textarea]:h-[50px]"
        }
    }), []);

    return {
        weekendPolicyListingColDef,
        initialValue,
        schema,
        weekendPolicySchema: schema,
    };
};

export default useWeekendPolicyConfig;
