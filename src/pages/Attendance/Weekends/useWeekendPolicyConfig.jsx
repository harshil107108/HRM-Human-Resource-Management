import { useMemo } from "react";

export const useWeekendPolicyConfig = ({ handleDelete } = {}) => {
    const weekendPolicyListingColDef = [
        {
            id: "policyName",
            field: "policyName",
            headerName: "Policy Name",
            width: 260,
        },
        {
            id: "daysText",
            field: "daysText",
            headerName: "Off Days",
            width: 300,
        },
        {
            id: "description",
            field: "description",
            headerName: "Description",
            width: 320,
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
        policyName: "",
        description: "",
        days: ["Sunday"],
        status: "Active"
    }), []);

    const schema = useMemo(() => ({
        policyName: {
            type: "text",
            label: "Policy Name",
            required: true,
            placeholder: "e.g. Standard Weekend Policy",
            className: "col-span-8"
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
            label: "Description / Working Notes",
            placeholder: "Notes regarding alternate Saturdays or off days...",
            className: "col-span-12"
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
