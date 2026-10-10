import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useRoleConfig } from "./useRoleConfig";
import { Shield } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";

const SYSTEM_PERMISSIONS = [
    { group: "Employee Management", perms: ["employee:view", "employee:create", "employee:edit", "employee:delete"] },
    { group: "Recruitment", perms: ["recruitment:view", "recruitment:manage", "recruitment:hire"] },
    { group: "Attendance & Leaves", perms: ["attendance:view", "attendance:approve", "leave:view", "leave:approve"] },
    { group: "Payroll & Salary", perms: ["payroll:view", "payroll:process", "payroll:disburse"] },
    { group: "Performance", perms: ["performance:view", "performance:review", "performance:appraise"] },
    { group: "Administration & System", perms: ["admin:users", "admin:roles", "admin:settings"] }
];

const RoleModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useRoleConfig();
    const [editData, setEditData] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const { apiCall, isPending } = useApiCall();
    const { successAlert, errorAlert } = useAlert();

    const closeModal = onClose || onModalClose;
    const roleId = extraParams?.id || data?._id;

    useEffect(() => {
        const fetchRoleById = async () => {
            if (!roleId) {
                setEditData(null);
                setSelectedPermissions([]);
                return;
            }
            if (data && data._id === roleId) {
                setEditData(data);
                const perms = Array.isArray(data.permissions)
                    ? data.permissions
                    : data.permissions && typeof data.permissions === "object"
                        ? Object.values(data.permissions).flat()
                        : [];
                setSelectedPermissions(perms);
                return;
            }
            try {
                const res = await apiCall({
                    id: "getRoleById",
                    api: api + apiEndpoints.administration.role.RoleGetByID,
                    payload: { _id: roleId }
                });
                if (res?.success && res.data) {
                    setEditData(res.data);
                    const perms = Array.isArray(res.data.permissions)
                        ? res.data.permissions
                        : res.data.permissions && typeof res.data.permissions === "object"
                            ? Object.values(res.data.permissions).flat()
                            : [];
                    setSelectedPermissions(perms);
                }
            } catch (err) {
                console.error("Failed to fetch role", err);
            }
        };
        fetchRoleById();
    }, [roleId, data]);

    const formattedData = useMemo(() => {
        const source = editData || data;
        if (!source) return initialValue;
        return {
            ...source,
            roleName: source.roleName || "",
            roleCode: source.roleCode || "",
            description: source.description || "",
            isSystemDefault: !!source.isSystemDefault
        };
    }, [editData, data, initialValue]);

    const schemaArray = useMemo(() => {
        return Array.isArray(schema)
            ? schema
            : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
    }, [schema]);

    const formInstance = useMemo(() => {
        return formMethod.createForm({
            schema: schemaArray,
            initialValue: formattedData,
        });
    }, [schemaArray]);

    useEffect(() => {
        if (open) {
            formInstance.methods.setValues(formattedData);
        }
    }, [open, formattedData, formInstance]);

    const togglePermission = (perm) => {
        setSelectedPermissions(prev =>
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const handleSave = async () => {
        const isValid = formInstance.methods.validate();
        if (!isValid) return;
        const formData = formInstance.methods.getValues();

        if (onSave) {
            onSave({
                ...formData,
                permissions: selectedPermissions
            });
            return;
        }

        const payload = {
            ...formData,
            permissions: selectedPermissions,
            ...(roleId ? { _id: roleId } : {})
        };

        const res = await apiCall({
            id: "saveRole",
            api: api + apiEndpoints.administration.role.RoleAddEdit,
            payload
        });

        if (res?.success) {
            successAlert({
                title: "Success",
                text: res.message || "Role saved successfully"
            });
            onSaved?.();
            closeModal?.();
        } else {
            errorAlert({
                title: "Error",
                text: res?.message || "Failed to save role"
            });
        }
    };

    const handleClear = () => {
        formInstance.methods.setValues(initialValue);
        setSelectedPermissions([]);
    };

    return (
        <HpCommonModal
            open={open}
            title={roleId ? "Edit System Role" : "Create New Role"}
            size="lg"
            icon={<Shield size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || isPending("saveRole") || isPending("getRoleById")}
            showClearButton={!roleId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
                formSchema={schemaArray}
            />

            <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Assigned Module Permissions</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {SYSTEM_PERMISSIONS.map(group => (
                        <div key={group.group} className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <span className="text-xs font-bold text-gray-600 block mb-2">{group.group}</span>
                            <div className="flex flex-wrap gap-2">
                                {group.perms.map(perm => {
                                    const isChecked = selectedPermissions.includes(perm);
                                    return (
                                        <button
                                            key={perm}
                                            type="button"
                                            onClick={() => togglePermission(perm)}
                                            className={`text-xs px-2.5 py-1 rounded-md border font-medium cursor-pointer transition-colors ${
                                                isChecked
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                                            }`}
                                        >
                                            {perm}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </HpCommonModal>
    );
};

RoleModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onModalClose: PropTypes.func,
    onSaved: PropTypes.func,
    onSave: PropTypes.func,
    data: PropTypes.object,
    extraParams: PropTypes.object,
    loading: PropTypes.bool
};

export default RoleModal;
