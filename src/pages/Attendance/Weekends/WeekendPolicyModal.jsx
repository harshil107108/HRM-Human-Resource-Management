import PropTypes from 'prop-types';
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useWeekendPolicyConfig } from "./useWeekendPolicyConfig";
import { CalendarDays } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WeekendPolicyModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useWeekendPolicyConfig();
    const { apiCall } = useApiCall();

    const closeModal = onClose || onModalClose;
    const policyId = extraParams?.id || data?._id;

    const [selectedDays, setSelectedDays] = useState(data?.days || ["Sunday"]);

    const schemaArray = useMemo(() => {
        return Array.isArray(schema)
            ? schema
            : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
    }, [schema]);

    const formInstance = useMemo(() => {
        return formMethod.createForm({
            schema: schemaArray,
            initialValue: data || initialValue,
        });
    }, [schemaArray]);

    const getPolicyById = async () => {
        if (!policyId) return;
        const res = await apiCall({
            id: "getWeekendPolicyById",
            api: api + apiEndpoints.attendance.weekend.WeekendGetByID,
            payload: { _id: policyId },
        });
        if (res?.success && res.data?.data) {
            formInstance.methods.setValues(res.data.data);
            setSelectedDays(res.data.data.days || ["Sunday"]);
        }
    };

    useEffect(() => {
        if (open) {
            if (policyId) {
                if (data) {
                    formInstance.methods.setValues(data);
                    setSelectedDays(data?.days || ["Sunday"]);
                } else {
                    getPolicyById();
                }
            } else {
                formInstance.methods.setValues(initialValue);
                setSelectedDays(["Sunday"]);
            }
        }
    }, [open, policyId, data]);

    const toggleDay = (day) => {
        setSelectedDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSave = async () => {
        const isValid = formInstance.methods.validate();
        if (!isValid) return;
        const formData = formInstance.methods.getValues();

        if (onSave && typeof onSave === "function" && onSave.length > 0) {
            onSave({
                ...formData,
                days: selectedDays
            });
            return;
        }

        const payload = {
            ...formData,
            days: selectedDays,
            ...(policyId ? { _id: policyId } : {}),
        };

        const res = await apiCall({
            id: "addEditWeekendPolicy",
            api: api + apiEndpoints.attendance.weekend.WeekendAddEdit,
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
        setSelectedDays(["Sunday"]);
    };

    return (
        <HpCommonModal
            open={open}
            title={policyId ? "Edit Weekend Policy" : "Add Weekend Policy"}
            size="md"
            icon={<CalendarDays size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || formInstance.methods.isSubmitting()}
            showClearButton={!policyId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
                formSchema={schemaArray}
            />
            <div className="mt-4 border-t pt-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Weekend Days Off</label>
                <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => {
                        const isSelected = selectedDays.includes(day);
                        return (
                            <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(day)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                                    isSelected 
                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        </HpCommonModal>
    );
};

WeekendPolicyModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    data: PropTypes.object,
    loading: PropTypes.bool
};

export default WeekendPolicyModal;
