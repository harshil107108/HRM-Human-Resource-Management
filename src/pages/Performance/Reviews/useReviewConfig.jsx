import { useMemo } from "react";
import { formatDateForInput } from "@/utils/dateUtils";

export const useReviewConfig = ({ handleDelete } = {}) => {
    const reviewListingColDef = [
        {
            id: "employeeName",
            field: "employeeName",
            headerName: "Employee",
            width: 220,
        },
        {
            id: "reviewerName",
            field: "reviewerName",
            headerName: "Reviewer",
            width: 200,
        },
        {
            id: "reviewPeriod",
            field: "reviewPeriod",
            headerName: "Review Cycle",
            width: 180,
        },
        {
            id: "finalRating",
            field: "finalRating",
            headerName: "Rating",
            width: 120,
            render: (val) => (
                <div className="flex items-center gap-1 font-bold text-amber-500">
                    <span>★</span>
                    <span className="text-gray-800">{val || 0} / 5</span>
                </div>
            )
        },
        {
            id: "status",
            field: "status",
            headerName: "Status",
            width: 170,
            render: (val) => {
                let color = "bg-gray-100 text-gray-700";
                if (val === "Finalized") color = "bg-green-100 text-green-700";
                if (val === "Manager Review Completed") color = "bg-blue-100 text-blue-700";
                if (val === "Self Review Submitted") color = "bg-purple-100 text-purple-700";
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
                        {val || "Draft"}
                    </span>
                );
            }
        },
        {
            id: "reviewDate",
            field: "reviewDate",
            headerName: "Review Date",
            width: 130,
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
        reviewerId: "",
        reviewPeriod: "Annual Review 2025-2026",
        selfRating: 4,
        managerRating: 4,
        finalRating: 4,
        reviewDate: formatDateForInput(new Date()),
        strengths: "",
        improvements: "",
        status: "Self Review Submitted"
    }), []);

    const schema = useMemo(() => ({
        employeeId: {
            type: "selectWrapper",
            label: "Employee Reviewed",
            required: true,
            placeholder: "Select Employee",
            options: [],
            className: "col-span-6"
        },
        reviewerId: {
            type: "selectWrapper",
            label: "Reviewer / Manager",
            required: true,
            placeholder: "Select Reviewer",
            options: [],
            className: "col-span-6"
        },
        reviewPeriod: {
            type: "text",
            label: "Review Cycle / Period",
            required: true,
            placeholder: "e.g. Annual Review 2025-2026",
            className: "col-span-4"
        },
        selfRating: {
            type: "selectWrapper",
            label: "Self Rating (1-5)",
            options: [
                { label: "5 - Exceptional", value: 5 },
                { label: "4 - Exceeds Expectations", value: 4 },
                { label: "3 - Meets Expectations", value: 3 },
                { label: "2 - Needs Improvement", value: 2 },
                { label: "1 - Unsatisfactory", value: 1 }
            ],
            className: "col-span-4"
        },
        managerRating: {
            type: "selectWrapper",
            label: "Manager Rating (1-5)",
            options: [
                { label: "5 - Exceptional", value: 5 },
                { label: "4 - Exceeds Expectations", value: 4 },
                { label: "3 - Meets Expectations", value: 3 },
                { label: "2 - Needs Improvement", value: 2 },
                { label: "1 - Unsatisfactory", value: 1 }
            ],
            className: "col-span-4"
        },
        status: {
            type: "selectWrapper",
            label: "Review Status",
            options: [
                { label: "Draft", value: "Draft" },
                { label: "Self Review Submitted", value: "Self Review Submitted" },
                { label: "Manager Review Completed", value: "Manager Review Completed" },
                { label: "Finalized", value: "Finalized" }
            ],
            className: "col-span-6"
        },
        reviewDate: {
            type: "date",
            label: "Review Date",
            required: true,
            className: "col-span-6"
        },
        strengths: {
            type: "textarea",
            label: "Key Strengths & Notable Achievements",
            placeholder: "Highlight notable successes and contributions...",
            className: "col-span-6"
        },
        improvements: {
            type: "textarea",
            label: "Areas for Growth & Development",
            placeholder: "Focus areas for career growth and skill building...",
            className: "col-span-6"
        }
    }), []);

    return { initialValue, schema, reviewListingColDef };
};

export default useReviewConfig;
