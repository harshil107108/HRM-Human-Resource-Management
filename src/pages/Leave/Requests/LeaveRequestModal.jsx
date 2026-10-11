import { useEffect, useState, useMemo } from "react";
import PropTypes from 'prop-types';
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useLeaveRequestConfig } from "./useLeaveRequestConfig";
import { Calendar } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";

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

    const closeModal = onClose || onModalClose;
    const requestId = extraParams?.id || data?._id;

    const formattedData = useMemo(() => {
        if (!data) return initialValue;
        return {
            ...data,
            employeeId: data.employeeId?._id || data.employeeId || "",
            leaveTypeId: data.leaveTypeId?._id || data.leaveTypeId || "",
            startDate: formatDateForInput(data.startDate),
            endDate: formatDateForInput(data.endDate)
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
    }, []);

    // Keep a single form instance so values loaded by getById survive
    // when dropdown options arrive; only push the new options in.
    useEffect(() => {
        formInstance.methods.setSchema(activeSchema);
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
            formInstance.methods.setValues({
                ...d,
                employeeId: d.employeeId?._id || d.employeeId || "",
                leaveTypeId: d.leaveTypeId?._id || d.leaveTypeId || "",
                startDate: formatDateForInput(d.startDate),
                endDate: formatDateForInput(d.endDate),
            });
        }
    };

    useEffect(() => {
        if (open) {
            if (requestId) {
                if (data) {
                    formInstance.methods.setValues(formattedData);
                } else {
                    getRequestById();
                }
            } else {
                formInstance.methods.setValues(initialValue);
            }
        }
    }, [open, requestId, data]);

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
        formInstance.methods.setValues(initialValue);
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
                formSchema={activeSchema}
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
