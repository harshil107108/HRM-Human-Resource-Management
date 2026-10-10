import { useMemo } from "react";
import { formatDateForInput } from "@/utils/dateUtils";

export const useLeavePolicyConfig = ({ handleDelete } = {}) => {
    const leavePolicyListingColDef = [
        {
            id: "policyName",
            field: "policyName",
            headerName: "Policy Name",
            width: 260,
        },
        {
            id: "effectiveFrom",
            field: "effectiveFrom",
            headerName: "Effective From",
            width: 150,
        },
        {
            id: "applicableGender",
            field: "applicableGender",
            headerName: "Gender",
            width: 140,
        },
        {
            id: "probationText",
            field: "probationText",
            headerName: "During Probation",
            width: 170,
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
        effectiveFrom: formatDateForInput(new Date()),
        applicableGender: "All",
        probationApplicable: false,
        status: "Active",
        description: ""
    }), []);

    const schema = useMemo(() => ({
        policyName: {
            type: "text",
            label: "Policy Name",
            required: true,
            placeholder: "e.g. Standard Corporate Leave Policy",
            className: "col-span-6"
        },
        effectiveFrom: {
            type: "date",
            label: "Effective From",
            required: true,
            className: "col-span-6"
        },
        applicableGender: {
            type: "selectWrapper",
            label: "Applicable Gender",
            options: [
                { label: "All", value: "All" },
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" }
            ],
            className: "col-span-4"
        },
        probationApplicable: {
            type: "checkbox",
            label: "Applicable During Probation",
            className: "col-span-4"
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
            label: "Description / Rules Overview",
            placeholder: "Policy guidelines...",
            className: "col-span-12"
        }
    }), []);

    return {
        leavePolicyListingColDef,
        initialValue,
        schema,
        leavePolicySchema: schema,
    };
};

export default useLeavePolicyConfig;
