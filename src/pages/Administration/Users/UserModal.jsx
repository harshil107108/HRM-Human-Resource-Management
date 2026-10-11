import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useUserConfig } from "./useUserConfig";
import { UserCheck } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";

const UserModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useUserConfig();
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [editData, setEditData] = useState(null);
    const { apiCall, isPending } = useApiCall();
    const { successAlert, errorAlert } = useAlert();

    const closeModal = onClose || onModalClose;
    const userId = extraParams?.id || data?._id;

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await apiCall({
                    id: "empHelp",
                    api: api + apiEndpoints.employee.employee.EmployeeGetData,
                    payload: {}
                });
                if (res?.success) {
                    setEmployeeOptions([
                        { label: "-- None / Independent Account --", value: "" },
                        ...(res.data?.data || []).map(emp => ({
                            label: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.employeeId || "EMP"})`,
                            value: emp._id
                        }))
                    ]);
                }
            } catch (err) {
                console.error("Failed to load employees", err);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        const fetchUserById = async () => {
            if (!userId) {
                setEditData(null);
                return;
            }
            if (data && data._id === userId) {
                setEditData(data);
                return;
            }
            try {
                const res = await apiCall({
                    id: "getUserById",
                    api: api + apiEndpoints.administration.user.UserGetByID,
                    payload: { _id: userId }
                });
                if (res?.success && res.data?.data) {
                    setEditData(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch user", err);
            }
        };
        fetchUserById();
    }, [userId, data]);

    const formattedData = useMemo(() => {
        const source = editData || data;
        if (!source) return initialValue;
        return {
            ...source,
            fullName: source.fullName || source.username || "",
            password: "",
            employeeRef: source.employeeRef?._id || source.employeeRef || source.employeeId?._id || source.employeeId || "",
            role: source.role || "Employee",
            status: source.status || "Active"
        };
    }, [editData, data, initialValue]);

    const activeSchema = useMemo(() => {
        const base = Array.isArray(schema)
            ? schema
            : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
        return base.map(f => {
            if (f.id === "employeeRef") return { ...f, options: employeeOptions };
            return f;
        });
    }, [schema, employeeOptions]);

    const formInstance = useMemo(() => {
        return formMethod.createForm({
            schema: activeSchema,
            initialValue: formattedData,
        });
    }, [activeSchema]);

    useEffect(() => {
        if (open) {
            formInstance.methods.setValues(formattedData);
        }
    }, [open, formattedData, formInstance]);

    const handleSave = async () => {
        const isValid = formInstance.methods.validate();
        if (!isValid) return;
        const formData = formInstance.methods.getValues();

        if (onSave) {
            onSave(formData);
            return;
        }

        const payload = {
            ...formData,
            fullName: formData.fullName || formData.username,
            ...(userId ? { _id: userId } : {})
        };
        if (!payload.password) {
            delete payload.password;
        }

        const res = await apiCall({
            id: "saveUser",
            api: api + apiEndpoints.administration.user.UserAddEdit,
            payload
        });

        if (res?.success) {
            successAlert({
                title: "Success",
                text: res.message || "User account saved successfully"
            });
            onSaved?.();
            closeModal?.();
        } else if (!res?.error) {
            // useApiCall already reported request failures; only cover other cases.
            errorAlert({
                title: "Error",
                text: res?.message || "Failed to save user account"
            });
        }
    };

    const handleClear = () => {
        formInstance.methods.setValues(initialValue);
    };

    return (
        <HpCommonModal
            open={open}
            title={userId ? "Edit User Account" : "Create User Account"}
            size="lg"
            icon={<UserCheck size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || isPending("saveUser") || isPending("getUserById")}
            showClearButton={!userId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
                formSchema={activeSchema}
            />
        </HpCommonModal>
    );
};

UserModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onModalClose: PropTypes.func,
    onSaved: PropTypes.func,
    onSave: PropTypes.func,
    data: PropTypes.object,
    extraParams: PropTypes.object,
    loading: PropTypes.bool
};

export default UserModal;
