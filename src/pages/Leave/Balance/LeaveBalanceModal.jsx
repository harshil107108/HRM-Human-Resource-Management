import { useEffect, useState, useMemo } from "react";
import PropTypes from 'prop-types';
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useLeaveBalanceConfig } from "./useLeaveBalanceConfig";
import { PieChart } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const LeaveBalanceModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useLeaveBalanceConfig();
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
    const { apiCall } = useApiCall();

    const closeModal = onClose || onModalClose;
    const balanceId = extraParams?.id || data?._id;

    const formattedData = useMemo(() => {
        if (!data) return initialValue;
        return {
            ...data,
            employeeId: data.employeeId?._id || data.employeeId || "",
            leaveTypeId: data.leaveTypeId?._id || data.leaveTypeId || ""
        };
    }, [data, initialValue]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [empRes, leaveRes] = await Promise.all([
                    apiCall({ id: "empHelp", api: api + apiEndpoints.employee.employee.EmployeeGetData, payload: {} }),
                    apiCall({ id: "leaveHelp", api: api + apiEndpoints.leave.type.LeaveTypeGetData, payload: {} })
                ]);
                if (empRes?.success) {
                    setEmployeeOptions(
                        (empRes.data?.data || []).map(e => ({
                            label: `${e.firstName || ""} ${e.lastName || ""} (${e.employeeId || "EMP"})`,
                            value: e._id
                        }))
                    );
                }
                if (leaveRes?.success) {
                    setLeaveTypeOptions(
                        (leaveRes.data?.data || []).map(l => ({
                            label: `${l.typeName} (${l.typeCode})`,
                            value: l._id
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to load options", err);
            }
        };
        fetchDropdowns();
    }, []);

    const activeSchema = useMemo(() => {
        const base = Array.isArray(schema)
            ? schema
            : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
        return base.map(f => {
            if (f.id === "employeeId") return { ...f, options: employeeOptions };
            if (f.id === "leaveTypeId") return { ...f, options: leaveTypeOptions };
            return f;
        });
    }, [schema, employeeOptions, leaveTypeOptions]);

    const formInstance = useMemo(() => {
        return formMethod.createForm({
            schema: activeSchema,
            initialValue: formattedData,
        });
    }, [activeSchema]);

    const getBalanceById = async () => {
        if (!balanceId) return;
        const res = await apiCall({
            id: "getLeaveBalanceById",
            api: api + apiEndpoints.leave.balance.BalanceGetByID,
            payload: { _id: balanceId },
        });
        if (res?.success && res.data?.data) {
            const d = res.data.data;
            formInstance.methods.setValues({
                ...d,
                employeeId: d.employeeId?._id || d.employeeId || "",
                leaveTypeId: d.leaveTypeId?._id || d.leaveTypeId || "",
            });
        }
    };

    useEffect(() => {
        if (open) {
            if (balanceId) {
                if (data) {
                    formInstance.methods.setValues(formattedData);
                } else {
                    getBalanceById();
                }
            } else {
                formInstance.methods.setValues(initialValue);
            }
        }
    }, [open, balanceId, data]);

    const handleSave = async () => {
        const isValid = formInstance.methods.validate();
        if (!isValid) return;
        const formData = formInstance.methods.getValues();

        if (onSave && typeof onSave === "function" && onSave.length > 0) {
            onSave(formData);
            return;
        }

        const payload = {
            ...formData,
            ...(balanceId ? { _id: balanceId } : {}),
        };

        const res = await apiCall({
            id: "addEditLeaveBalance",
            api: api + apiEndpoints.leave.balance.BalanceAddEdit,
            payload,
            showSuccessAlert: true,
        });

        if (res?.success) {
            closeModal?.();
            await onSaved?.();
        }
    };

    const handleClear = () => {
        formInstance.methods.setValues(initialValue);
    };

    return (
        <HpCommonModal
            open={open}
            title={balanceId ? "Edit Leave Balance" : "Assign / Adjust Leave Balance"}
            size="lg"
            icon={<PieChart size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || formInstance.methods.isSubmitting()}
            showClearButton={!balanceId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
                formSchema={activeSchema}
            />
        </HpCommonModal>
    );
};

LeaveBalanceModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    data: PropTypes.object,
    loading: PropTypes.bool
};

export default LeaveBalanceModal;
