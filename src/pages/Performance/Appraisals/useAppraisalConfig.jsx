import { useMemo } from "react";
import { formatDateForInput } from "@/utils/dateUtils";

export const useAppraisalConfig = ({ handleDelete } = {}) => {
    const appraisalListingColDef = [
        {
            id: "employeeName",
            field: "employeeName",
            headerName: "Employee",
            width: 220,
        },
        {
            id: "reviewCycle",
            field: "reviewCycle",
            headerName: "Cycle",
            width: 160,
        },
        {
            id: "effectiveDate",
            field: "effectiveDate",
            headerName: "Effective Date",
            width: 130,
        },
        {
            id: "currentSalary",
            field: "currentSalary",
            headerName: "Current CTC (₹)",
            width: 140,
            render: (val) => Number(val || 0).toLocaleString("en-IN")
        },
        {
            id: "recommendedIncrementPercentage",
            field: "recommendedIncrementPercentage",
            headerName: "Hike (%)",
            width: 110,
            render: (val) => <span className="font-bold text-green-600">+{val || 0}%</span>
        },
        {
            id: "revisedSalary",
            field: "revisedSalary",
            headerName: "Revised CTC (₹)",
            width: 140,
            render: (val) => <span className="font-bold text-gray-800">₹{Number(val || 0).toLocaleString("en-IN")}</span>
        },
        {
            id: "status",
            field: "status",
            headerName: "Status",
            width: 150,
            render: (val) => {
                let color = "bg-gray-100 text-gray-700";
                if (val === "Approved") color = "bg-green-100 text-green-700";
                if (val === "Recommended" || val === "Under HR Review") color = "bg-blue-100 text-blue-700";
                if (val === "Rejected") color = "bg-red-100 text-red-700";
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
                        {val || "Draft"}
                    </span>
                );
            }
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
        reviewCycle: "FY 2025-2026",
        effectiveDate: formatDateForInput(new Date()),
        currentSalary: 50000,
        recommendedIncrementPercentage: 12,
        revisedSalary: 56000,
        promotionRecommended: false,
        proposedDesignation: "",
        status: "Recommended",
        remarks: ""
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
        reviewCycle: {
            type: "text",
            label: "Appraisal Cycle",
            required: true,
            placeholder: "e.g. FY 2025-2026",
            className: "col-span-6"
        },
        effectiveDate: {
            type: "date",
            label: "Effective Date",
            required: true,
            className: "col-span-3"
        },
        currentSalary: {
            type: "number",
            label: "Current CTC (₹)",
            required: true,
            placeholder: "50000",
            className: "col-span-3"
        },
        recommendedIncrementPercentage: {
            type: "number",
            label: "Hike (%)",
            required: true,
            placeholder: "12",
            className: "col-span-3"
        },
        revisedSalary: {
            type: "number",
            label: "Revised CTC (₹)",
            required: true,
            placeholder: "56000",
            className: "col-span-3"
        },
        status: {
            type: "selectWrapper",
            label: "Appraisal Status",
            options: [
                { label: "Draft", value: "Draft" },
                { label: "Recommended", value: "Recommended" },
                { label: "Under HR Review", value: "Under HR Review" },
                { label: "Approved", value: "Approved" },
                { label: "Rejected", value: "Rejected" }
            ],
            className: "col-span-4"
        },
        promotionRecommended: {
            type: "checkbox",
            label: "Promotion Recommended",
            className: "col-span-4"
        },
        proposedDesignation: {
            type: "selectWrapper",
            label: "Proposed Designation (if Promoted)",
            placeholder: "Select Designation",
            options: [],
            className: "col-span-4"
        },
        remarks: {
            type: "textarea",
            label: "Management Appraisal Justification & Remarks",
            placeholder: "Notes regarding performance appraisal justification...",
            className: "col-span-12"
        }
    }), []);

    return { initialValue, schema, appraisalListingColDef };
};

export default useAppraisalConfig;
