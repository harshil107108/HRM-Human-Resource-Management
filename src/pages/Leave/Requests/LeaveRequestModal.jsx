import { useEffect, useState, useMemo } from "react";
import PropTypes from 'prop-types';
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useLeaveRequestConfig } from "./useLeaveRequestConfig";
import { Calendar } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";
import { useAuth } from "@/context/AuthContext";

const LeaveRequestModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useLeaveRequestConfig();
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
    const { apiCall } = useApiCall();
    const { user } = useAuth();
    const isEmployee = user?.roleCode === "EMPLOYEE";

    const closeModal = onClose || onModalClose;
    const requestId = extraParams?.id || data?._id;

    const formattedData = useMemo(() => {
        if (!data) return initialValue;
        return {
            ...data,
            employeeId: data.employeeId?._id || data.employeeId || user?._id || "",
            leaveTypeId: data.leaveType?._id || data.leaveTypeId?._id || data.leaveTypeId || "",
            startDate: formatDateForInput(data.startDate),
            endDate: data.isHalfDay ? "" : formatDateForInput(data.endDate),
            days: Number(data.totalDays ?? data.days ?? 1),
            isHalfDay: Boolean(data.isHalfDay || Number(data.totalDays ?? data.days) === 0.5),
        };
    }, [data, initialValue, user?._id]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [empRes, leaveRes] = await Promise.all([
                    apiCall({ id: "empHelp", api: api + apiEndpoints.employee.employee.EmployeeGetData, payload: {} }),
                    apiCall({ id: "leaveHelp", api: api + apiEndpoints.leave.type.TypeHelp, payload: {} })
                ]);
                if (empRes?.success && !isEmployee) {
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
    }, [isEmployee]);

    const availableEmployeeOptions = useMemo(() => {
        if (!isEmployee) return employeeOptions;
        return user
            ? [{ label: `${user.name || "My"} (${user.employeeCode || "My account"})`, value: user._id }]
            : [];
    }, [employeeOptions, isEmployee, user]);

    const activeSchema = useMemo(() => {
        const base = Array.isArray(schema)
            ? schema
            : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
        return base.map(f => {
            if (f.id === "employeeId") {
                return {
                    ...f,
                    options: availableEmployeeOptions,
                    disabled: isEmployee,
                };
            }
            if (f.id === "leaveTypeId") return { ...f, options: leaveTypeOptions };
            return f;
        });
    }, [schema, availableEmployeeOptions, leaveTypeOptions, isEmployee]);

    const formInstance = useMemo(() => {
        return formMethod.createForm({
            schema: activeSchema,
            initialValue: formattedData,
        });
    }, []);

    const setRequestValues = (values) => {
        formInstance.methods.setValues(values, { triggerHooks: false });
        formInstance.methods.setFieldConfig("endDate", {
            disabled: Boolean(values.isHalfDay),
            min: values.startDate || formatDateForInput(new Date()),
        });
    };

    // Keep a single form instance so values loaded by getById survive
    // when dropdown options arrive; only push the new options in.
    useEffect(() => {
        const currentEndDateConfig = formInstance.methods.getFieldConfig("endDate");
        formInstance.methods.setSchema(
            activeSchema.map((field) =>
                field.id === "endDate"
                    ? {
                        ...field,
                        disabled: currentEndDateConfig?.disabled ?? field.disabled,
                        min: currentEndDateConfig?.min ?? field.min,
                    }
                    : field,
            ),
        );
    }, [activeSchema]);

    const getRequestById = async () => {
        if (!requestId) return;
        const res = await apiCall({
            id: "getLeaveRequestById",
            api: api + apiEndpoints.leave.request.RequestGetByID,
            payload: { _id: requestId },
        });
        if (res?.success && res.data?.data) {
            const d = res.data.data;
            setRequestValues({
                ...d,
                employeeId: d.employeeId?._id || d.employeeId || "",
                leaveTypeId: d.leaveType?._id || d.leaveTypeId?._id || d.leaveTypeId || "",
                startDate: formatDateForInput(d.startDate),
                endDate: d.isHalfDay ? "" : formatDateForInput(d.endDate),
                days: Number(d.totalDays ?? d.days ?? 1),
                isHalfDay: Boolean(d.isHalfDay || Number(d.totalDays ?? d.days) === 0.5),
            });
        }
    };

    useEffect(() => {
        if (open) {
            if (requestId) {
                if (data) {
                    setRequestValues(formattedData);
                } else {
                    getRequestById();
                }
            } else {
                setRequestValues({
                    ...initialValue,
                    employeeId: isEmployee ? user?._id || "" : "",
                });
            }
        }
    }, [open, requestId, data, isEmployee, user?._id]);

    const handleSave = async () => {
        const isValid = formInstance.methods.validate();
        if (!isValid) return;
        const formData = formInstance.methods.getValues();

        if (onSave && typeof onSave === "function" && onSave.length > 0) {
            onSave(formData);
            return;
        }

        const payload = {
            employeeId: isEmployee ? user?._id : formData.employeeId,
            leaveType: formData.leaveTypeId,
            startDate: formData.startDate,
            endDate: formData.isHalfDay ? formData.startDate : formData.endDate,
            totalDays: Number(formData.days),
            isHalfDay: Boolean(formData.isHalfDay),
            reason: formData.reason,
            ...(requestId ? { _id: requestId } : {}),
        };

        const res = await apiCall({
            id: "addEditLeaveRequest",
            api: api + apiEndpoints.leave.request.RequestAddEdit,
            payload,
            showSuccessAlert: true,
        });

        if (res?.success) {
            closeModal?.();
            await onSaved?.();
        }
    };

    const handleClear = () => {
        setRequestValues({
            ...initialValue,
            employeeId: isEmployee ? user?._id || "" : "",
        });
    };

    return (
        <HpCommonModal
            open={open}
            title={requestId ? "Edit Leave Application" : "Apply for Leave"}
            size="lg"
            icon={<Calendar size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || formInstance.methods.isSubmitting()}
            showClearButton={!requestId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
            />
        </HpCommonModal>
    );
};

LeaveRequestModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    data: PropTypes.object,
    loading: PropTypes.bool
};

export default LeaveRequestModal;
