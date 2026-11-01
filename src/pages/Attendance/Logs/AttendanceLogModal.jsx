import { useEffect, useState, useMemo } from "react";
import PropTypes from 'prop-types';
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useAttendanceLogConfig } from "./useAttendanceLogConfig";
import { Clock } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";

const AttendanceLogModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useAttendanceLogConfig();
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const { apiCall } = useApiCall();

    const closeModal = onClose || onModalClose;
    const logId = extraParams?.id || data?._id;

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
    }, []);

    // Keep a single form instance so values loaded by getById survive
    // when dropdown options arrive; only push the new options in.
    useEffect(() => {
        formInstance.methods.setSchema(activeSchema);
    }, [activeSchema]);

    const getLogById = async () => {
        if (!logId) return;
        const res = await apiCall({
            id: "getAttendanceLogById",
            api: api + apiEndpoints.attendance.log.LogGetByID,
            payload: { _id: logId },
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
            if (logId) {
                if (data) {
                    formInstance.methods.setValues(formattedData);
                } else {
                    getLogById();
                }
            } else {
                formInstance.methods.setValues({
                    ...initialValue,
                    ...(extraParams?.defaultDate ? { date: extraParams.defaultDate } : {}),
                });
            }
        }
    }, [open, logId, data]);

    const handleSave = async () => {
        const isValid = formInstance.methods.validate();
        if (!isValid) return;
        const formData = formInstance.methods.getValues();

        const payload = {
            ...formData,
            ...(logId ? { _id: logId } : {}),
        };

        const res = await apiCall({
            id: "addEditAttendanceLog",
            api: api + apiEndpoints.attendance.log.LogAddEdit,
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
            title={logId ? "Edit Attendance Log" : "Add Attendance Log"}
            size="lg"
            icon={<Clock size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || formInstance.methods.isSubmitting()}
            showClearButton={!logId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
                formSchema={activeSchema}
            />
        </HpCommonModal>
    );
};

AttendanceLogModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onModalClose: PropTypes.func,
    onSaved: PropTypes.func,
    data: PropTypes.object,
    extraParams: PropTypes.object,
    loading: PropTypes.bool
};

export default AttendanceLogModal;
