import { useMemo } from "react";
import { formatDateForInput } from "@/utils/dateUtils";

export const useGoalConfig = ({ handleDelete } = {}) => {
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const goalListingColDef = [
        {
            id: "title",
            field: "title",
            headerName: "Goal Title",
            width: 250,
        },
        {
            id: "employeeName",
            field: "employeeName",
            headerName: "Assignee",
            width: 220,
        },
        {
            id: "category",
            field: "category",
            headerName: "Category",
            width: 150,
        },
        {
            id: "progressPercentage",
            field: "progressPercentage",
            headerName: "Progress",
            width: 170,
            render: (val) => {
                const pct = Math.min(100, Math.max(0, Number(val || 0)));
                return (
                    <div className="flex items-center gap-2 w-full">
                        <div className="w-20 bg-gray-200 h-2 rounded-full overflow-hidden flex-shrink-0">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-700 font-medium whitespace-nowrap">{pct}%</span>
                    </div>
                );
            }
        },
        {
            id: "weightagePercentage",
            field: "weightagePercentage",
            headerName: "Weightage",
            width: 120,
            render: (val) => `${val || 0}%`
        },
        {
            id: "status",
            field: "status",
            headerName: "Status",
            width: 140,
            render: (val) => {
                let color = "bg-gray-100 text-gray-700";
                if (val === "Achieved") color = "bg-green-100 text-green-700";
                if (val === "In Progress" || val === "On Track") color = "bg-blue-100 text-blue-700";
                if (val === "Behind Schedule") color = "bg-red-100 text-red-700";
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
                        {val || "In Progress"}
                    </span>
                );
            }
        },
        {
            id: "targetDate",
            field: "targetDate",
            headerName: "Target Date",
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
        title: "",
        category: "Individual KPI",
        targetDate: formatDateForInput(threeMonthsLater),
        weightagePercentage: 25,
        progressPercentage: 0,
        status: "In Progress",
        keyResults: ""
    }), []);

    const schema = useMemo(() => ({
        title: {
            type: "text",
            label: "Goal Title",
            required: true,
            placeholder: "e.g. Complete ISO 27001 audit preparation",
            className: "col-span-12"
        },
        employeeId: {
            type: "selectWrapper",
            label: "Assignee / Employee",
            required: true,
            placeholder: "Select Employee",
            options: [],
            className: "col-span-6"
        },
        category: {
            type: "selectWrapper",
            label: "Category",
            options: [
                { label: "Individual KPI", value: "Individual KPI" },
                { label: "Departmental", value: "Departmental" },
                { label: "Organizational", value: "Organizational" },
                { label: "Personal Growth", value: "Personal Growth" },
                { label: "Technical Mastery", value: "Technical Mastery" }
            ],
            className: "col-span-6"
        },
        targetDate: {
            type: "date",
            label: "Target Completion Date",
            required: true,
            className: "col-span-4"
        },
        weightagePercentage: {
            type: "number",
            label: "Weightage (%)",
            placeholder: "25",
            className: "col-span-4"
        },
        progressPercentage: {
            type: "number",
            label: "Progress (%)",
            placeholder: "0",
            className: "col-span-4"
        },
        status: {
            type: "selectWrapper",
            label: "Status",
            options: [
                { label: "Not Started", value: "Not Started" },
                { label: "In Progress", value: "In Progress" },
                { label: "On Track", value: "On Track" },
                { label: "Achieved", value: "Achieved" },
                { label: "Behind Schedule", value: "Behind Schedule" }
            ],
            className: "col-span-6"
        },
        keyResults: {
            type: "textarea",
            label: "Key Results & Milestones",
            placeholder: "Key performance milestones and criteria...",
            className: "col-span-12"
        }
    }), []);

    return { initialValue, schema, goalListingColDef };
};

export default useGoalConfig;
