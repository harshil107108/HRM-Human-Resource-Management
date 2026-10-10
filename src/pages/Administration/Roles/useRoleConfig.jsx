import { useMemo } from "react";

export const useRoleConfig = ({ handleDelete } = {}) => {
    const roleListingColDef = [
        {
            id: "roleName",
            field: "roleName",
            headerName: "Role Name",
            width: 220,
        },
        {
            id: "roleCode",
            field: "roleCode",
            headerName: "Role Code",
            width: 160,
        },
        {
            id: "description",
            field: "description",
            headerName: "Description & Responsibility Scope",
            width: 320,
        },
        {
            id: "isSystemDefault",
            field: "isSystemDefault",
            headerName: "Role Type",
            width: 160,
            render: (val) => (
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${val ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {val ? "System Default" : "Custom Role"}
                </span>
            )
        },
        {
            id: "action",
            field: "action",
            headerName: "Action",
            width: 80,
            type: "actions",
            onClick: (data) => {
                handleDelete?.(data._id, data.isSystemDefault);
            },
        },
    ];

    const initialValue = useMemo(() => ({
        roleName: "",
        roleCode: "",
        description: "",
        isSystemDefault: false
    }), []);

    const schema = useMemo(() => ({
        roleName: {
            type: "text",
            label: "Role Name",
            required: true,
            placeholder: "e.g. Payroll Specialist",
            className: "col-span-6"
        },
        roleCode: {
            type: "text",
            label: "Role Code",
            required: true,
            placeholder: "e.g. ROLE_PAYROLL_SPECIALIST",
            className: "col-span-6"
        },
        description: {
            type: "textarea",
            label: "Role Description & Scope",
            placeholder: "Responsibilities and access scope granted to this role...",
            className: "col-span-12"
        }
    }), []);

    return { initialValue, schema, roleListingColDef };
};

export default useRoleConfig;
