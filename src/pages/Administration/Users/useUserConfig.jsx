import { useMemo } from "react";

export const useUserConfig = ({ handleDelete } = {}) => {
    const userListingColDef = [
        {
            id: "username",
            field: "username",
            headerName: "Username",
            width: 170,
        },
        {
            id: "fullName",
            field: "fullName",
            headerName: "Full Name",
            width: 180,
        },
        {
            id: "email",
            field: "email",
            headerName: "Email Address",
            width: 220,
        },
        {
            id: "employeeName",
            field: "employeeName",
            headerName: "Employee Profile",
            width: 200,
        },
        {
            id: "role",
            field: "role",
            headerName: "System Role",
            width: 160,
            render: (val) => {
                let badge = "bg-gray-100 text-gray-700";
                if (val === "Super Admin") badge = "bg-purple-100 text-purple-700 font-bold";
                if (val === "HR Admin") badge = "bg-blue-100 text-blue-700 font-semibold";
                if (val === "Payroll Specialist") badge = "bg-emerald-100 text-emerald-700";
                if (val === "Department Manager") badge = "bg-indigo-100 text-indigo-700";
                return (
                    <span className={`px-2 py-0.5 rounded text-xs ${badge}`}>
                        {val || "Employee"}
                    </span>
                );
            }
        },
        {
            id: "status",
            field: "status",
            headerName: "Status",
            width: 120,
            render: (val) => {
                const color = val === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
                        {val || "Active"}
                    </span>
                );
            }
        },
        {
            id: "lastLoginFormatted",
            field: "lastLoginFormatted",
            headerName: "Last Active",
            width: 140,
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
        fullName: "",
        username: "",
        email: "",
        password: "TempPassword@123",
        employeeRef: "",
        role: "Employee",
        status: "Active"
    }), []);

    const schema = useMemo(() => ({
        fullName: {
            type: "text",
            label: "Full Name",
            required: true,
            placeholder: "e.g. John Doe",
            className: "col-span-6"
        },
        username: {
            type: "text",
            label: "Username",
            required: true,
            placeholder: "e.g. john.doe",
            className: "col-span-6"
        },
        email: {
            type: "text",
            label: "Email Address",
            required: true,
            placeholder: "john.doe@company.com",
            className: "col-span-6"
        },
        password: {
            type: "text",
            label: "Password",
            placeholder: "Leave empty to retain existing password",
            className: "col-span-6"
        },
        employeeRef: {
            type: "selectWrapper",
            label: "Linked Employee Profile",
            placeholder: "Select Employee (Optional)",
            options: [],
            className: "col-span-6"
        },
        role: {
            type: "selectWrapper",
            label: "System Role",
            required: true,
            options: [
                { label: "Super Admin", value: "Super Admin" },
                { label: "HR Admin", value: "HR Admin" },
                { label: "Payroll Specialist", value: "Payroll Specialist" },
                { label: "Department Manager", value: "Department Manager" },
                { label: "Recruiter", value: "Recruiter" },
                { label: "Employee", value: "Employee" }
            ],
            className: "col-span-6"
        },
        status: {
            type: "selectWrapper",
            label: "Account Status",
            options: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
                { label: "Suspended", value: "Suspended" }
            ],
            className: "col-span-6"
        }
    }), []);

    return { initialValue, schema, userListingColDef };
};

export default useUserConfig;
