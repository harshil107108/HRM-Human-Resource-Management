import { useEffect, useState, useMemo } from "react";
import PropTypes from 'prop-types';
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useAttendanceRequestConfig } from "./useAttendanceRequestConfig";
import { ClipboardCheck } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";

const AttendanceRequestModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useAttendanceRequestConfig();
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const { apiCall } = useApiCall();

    const closeModal = onClose || onModalClose;
    const requestId = extraParams?.id || data?._id;

    const formattedData = useMemo(() => {
        if (!data) return initialValue;
        return {
            ...data,
            employeeId: data.employeeId?._id || data.employeeId || "",
            date: formatDateForInput(data.date)
        };
    }, [data, initialValue]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await apiCall({
                    id: "empHelp",
                    api: api + apiEndpoints.employee.employee.EmployeeGetData,
                    payload: {}
                });
                if (res?.success) {
                    setEmployeeOptions(
                        (res.data?.data || []).map(emp => ({
                            label: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.employeeId || "EMP"})`,
                            value: emp._id
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to load employees", err);
            }
        };
        fetchEmployees();
    }, []);

    const activeSchema = useMemo(() => {
        const base = Array.isArray(schema)
            ? schema
            : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
        return base.map(f => {
            if (f.id === "employeeId") return { ...f, options: employeeOptions };
            return f;
        });
    }, [schema, employeeOptions]);

    const formInstance = useMemo(() => {
        return formMethod.createForm({
            schema: activeSchema,
            initialValue: formattedData,
        });
    }, [activeSchema]);

    const getRequestById = async () => {
        if (!requestId) return;
        const res = await apiCall({
            id: "getRequestById",
            api: api + apiEndpoints.attendance.request.RequestGetByID,
            payload: { _id: requestId },
        });
        if (res?.success && res.data?.data) {
            const d = res.data.data;
            formInstance.methods.setValues({
                ...d,
                employeeId: d.employeeId?._id || d.employeeId || "",
                date: formatDateForInput(d.date),
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
            id: "addEditAttendanceRequest",
            api: api + apiEndpoints.attendance.request.RequestAddEdit,
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
            title={requestId ? "Edit Attendance Request" : "Submit Attendance Request"}
            size="lg"
            icon={<ClipboardCheck size={20} />}
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

AttendanceRequestModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    data: PropTypes.object,
    loading: PropTypes.bool
};

export default AttendanceRequestModal;
