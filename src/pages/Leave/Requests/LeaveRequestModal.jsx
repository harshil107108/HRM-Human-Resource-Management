import { useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from 'prop-types';
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer, useWatch } from "@/form-engine";
import { useLeaveRequestConfig } from "./useLeaveRequestConfig";
import { Calendar, AlertTriangle, Info } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";
import { useAuth } from "@/context/AuthContext";
import useAlert from "@/hooks/useAlert";
import { calculateLeaveWorkingDays } from "@/utils/leaveUtils";

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
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [weekendPolicy, setWeekendPolicy] = useState(null);

    const { apiCall } = useApiCall();
    const { user } = useAuth();
    const { warningAlert } = useAlert();
    const isEmployee = user?.roleCode === "EMPLOYEE";

    const { initialValue, schema } = useLeaveRequestConfig({ weekendPolicy, holidays });

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
                const [empRes, leaveRes, holRes, weekendRes] = await Promise.all([
                    apiCall({ id: "empHelp", api: api + apiEndpoints.employee.employee.EmployeeGetData, payload: {} }),
                    apiCall({ id: "leaveHelp", api: api + apiEndpoints.leave.type.TypeHelp, payload: {} }),
                    apiCall({ id: "holidaysHelp", api: api + (apiEndpoints.master?.holiday?.HolidayGetData || apiEndpoints.holiday?.getHoliday || "/master/holiday/getHoliday"), payload: {} }),
                    apiCall({ id: "weekendHelp", api: api + (apiEndpoints.attendance?.weekend?.WeekendGetData || "/attendance/weekend/getWeekendPolicies"), payload: {} }),
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

                if (holRes?.success) {
                    const holList = holRes.data?.data || holRes.data || [];
                    setHolidays(Array.isArray(holList) ? holList : []);
                }

                if (weekendRes?.success) {
                    const policies = weekendRes.data?.data || weekendRes.data || [];
                    const active = Array.isArray(policies)
                        ? policies.find((p) => p.isActive !== false && p.status !== "Inactive")
                        : policies;
                    setWeekendPolicy(active || null);
                }
            } catch (err) {
                console.error("Failed to load options for leave modal", err);
            }
        };
        fetchDropdowns();
    }, [isEmployee, apiCall]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setRequestValues = useCallback((values) => {
        formInstance.methods.setValues(values, { triggerHooks: false });
        formInstance.methods.setFieldConfig("endDate", {
            disabled: Boolean(values.isHalfDay),
            min: values.startDate || formatDateForInput(new Date()),
        });
    }, [formInstance]);

    // Watch date values to dynamically calculate working days
    const watchedStartDate = useWatch(formInstance, "startDate");
    const watchedEndDate = useWatch(formInstance, "endDate");
    const watchedIsHalfDay = useWatch(formInstance, "isHalfDay");

    const leaveCalculation = useMemo(() => {
        return calculateLeaveWorkingDays({
            startDate: watchedStartDate,
            endDate: watchedEndDate,
            isHalfDay: Boolean(watchedIsHalfDay),
            weekendPolicy,
            holidays,
        });
    }, [watchedStartDate, watchedEndDate, watchedIsHalfDay, weekendPolicy, holidays]);

    // Keep days form value continuously synchronized with calculated working days
    useEffect(() => {
        if (watchedStartDate) {
            formInstance.methods.setValue("days", leaveCalculation.totalWorkingDays);
        }
    }, [leaveCalculation.totalWorkingDays, watchedStartDate, formInstance]);

    // Update schema when options or config change
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
    }, [activeSchema, formInstance]);

    const getRequestById = useCallback(async () => {
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
    }, [requestId, apiCall, setRequestValues]);

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
    }, [open, requestId, data, isEmployee, user?._id, formattedData, getRequestById, initialValue, setRequestValues]);

    const handleSave = async () => {
        const isValid = formInstance.methods.validate();
        if (!isValid) return;
        const formData = formInstance.methods.getValues();

        // Calculate verified working days
        const calc = calculateLeaveWorkingDays({
            startDate: formData.startDate,
            endDate: formData.isHalfDay ? formData.startDate : formData.endDate,
            isHalfDay: Boolean(formData.isHalfDay),
            weekendPolicy,
            holidays,
        });

        // EDGE CASE 1 & 2: If all selected days are weekends / holidays -> STOP & POPUP WARNING!
        if (calc.isAllNonWorking || calc.totalWorkingDays === 0) {
            const list = calc.excludedDays.map(d => `${d.date} (${d.reason})`).join(", ");
            warningAlert({
                title: "Invalid Leave Application",
                text: `The selected leave dates fall entirely on non-working days (${list}). Leave requests cannot be submitted for weekends or official holidays.`,
                confirmButtonText: "OK",
            });
            return; // Do NOT proceed! Leave request not added!
        }

        if (onSave && typeof onSave === "function" && onSave.length > 0) {
            onSave({ ...formData, totalDays: calc.totalWorkingDays });
            return;
        }

        const payload = {
            employeeId: isEmployee ? user?._id : formData.employeeId,
            leaveType: formData.leaveTypeId,
            startDate: formData.startDate,
            endDate: formData.isHalfDay ? formData.startDate : formData.endDate,
            totalDays: Number(calc.totalWorkingDays),
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
            {/* Informative / Warning Banner based on Weekend and Holiday Exclusions */}
            {watchedStartDate && (
                <>
                    {leaveCalculation.isAllNonWorking ? (
                        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-900 shadow-sm">
                            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-600" />
                            <div>
                                <div className="font-bold text-rose-700 text-[13px]">Non-Working Days Warning</div>
                                <div className="mt-0.5 leading-relaxed">
                                    {leaveCalculation.summaryText}
                                </div>
                                <div className="mt-1 font-semibold text-rose-800">
                                    ⚠️ Leave cannot be submitted for weekends or official holidays.
                                </div>
                            </div>
                        </div>
                    ) : leaveCalculation.hasExcludedDays ? (
                        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-teal-200 bg-teal-50/70 p-3.5 text-xs text-teal-900 shadow-sm">
                            <Info size={18} className="mt-0.5 shrink-0 text-teal-600" />
                            <div>
                                <div className="font-bold text-teal-800 text-[13px]">Weekend & Holiday Deductions</div>
                                <div className="mt-0.5 leading-relaxed">
                                    {leaveCalculation.summaryText}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </>
            )}

            <FormRenderer
                formMethod={formInstance}
            />
        </HpCommonModal>
    );
};

LeaveRequestModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onModalClose: PropTypes.func,
    onSave: PropTypes.func,
    onSaved: PropTypes.func,
    data: PropTypes.object,
    extraParams: PropTypes.object,
    loading: PropTypes.bool
};

export default LeaveRequestModal;
