import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useGoalConfig } from "./useGoalConfig";
import { Target } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";
import useAlert from "@/hooks/useAlert";

const GoalModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useGoalConfig();
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [editData, setEditData] = useState(null);
    const { apiCall, isPending } = useApiCall();
    const { successAlert, errorAlert } = useAlert();

    const closeModal = onClose || onModalClose;
    const goalId = extraParams?.id || data?._id;

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

    useEffect(() => {
        const fetchGoalById = async () => {
            if (!goalId) {
                setEditData(null);
                return;
            }
            if (data && data._id === goalId) {
                setEditData(data);
                return;
            }
            try {
                const res = await apiCall({
                    id: "getGoalById",
                    api: api + apiEndpoints.performance.goal.GoalGetByID,
                    payload: { _id: goalId }
                });
                if (res?.success && res.data?.data) {
                    setEditData(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch goal", err);
            }
        };
        fetchGoalById();
    }, [goalId, data]);

    const formattedData = useMemo(() => {
        const source = editData || data;
        if (!source) return initialValue;
        return {
            ...source,
            employeeId: source.employeeId?._id || source.employeeId || "",
            targetDate: formatDateForInput(source.targetDate || source.dueDate),
            progressPercentage: Number(source.progressPercentage ?? source.currentValue ?? 0),
            weightagePercentage: Number(source.weightagePercentage ?? 25),
        };
    }, [editData, data, initialValue]);

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
            ...(goalId ? { _id: goalId } : {})
        };

        const res = await apiCall({
            id: "saveGoal",
            api: api + apiEndpoints.performance.goal.GoalAddEdit,
            payload
        });

        if (res?.success) {
            successAlert({
                title: "Success",
                text: res.message || "Goal saved successfully"
            });
            onSaved?.();
            closeModal?.();
        } else if (!res?.error) {
            // useApiCall already reported request failures; only cover other cases.
            errorAlert({
                title: "Error",
                text: res?.message || "Failed to save goal"
            });
        }
    };

    const handleClear = () => {
        formInstance.methods.setValues(initialValue);
    };

    return (
        <HpCommonModal
            open={open}
            title={goalId ? "Edit Performance Goal" : "Create Performance Goal (OKR)"}
            size="lg"
            icon={<Target size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || isPending("saveGoal") || isPending("getGoalById")}
            showClearButton={!goalId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
                formSchema={activeSchema}
            />
        </HpCommonModal>
    );
};

GoalModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onModalClose: PropTypes.func,
    onSaved: PropTypes.func,
    onSave: PropTypes.func,
    data: PropTypes.object,
    extraParams: PropTypes.object,
    loading: PropTypes.bool
};

export default GoalModal;
