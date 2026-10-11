import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useAppraisalConfig } from "./useAppraisalConfig";
import { TrendingUp } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";
import useAlert from "@/hooks/useAlert";

const AppraisalModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useAppraisalConfig();
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [designationOptions, setDesignationOptions] = useState([]);
    const [editData, setEditData] = useState(null);
    const { apiCall, isPending } = useApiCall();
    const { successAlert, errorAlert } = useAlert();

    const closeModal = onClose || onModalClose;
    const appraisalId = extraParams?.id || data?._id;

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [empRes, desigRes] = await Promise.all([
                    apiCall({ id: "empHelp", api: api + apiEndpoints.employee.employee.EmployeeGetData, payload: {} }),
                    apiCall({ id: "desigHelp", api: api + apiEndpoints.organization.designation.DesignationGetData, payload: {} })
                ]);
                if (empRes?.success) {
                    setEmployeeOptions(
                        (empRes.data?.data || []).map(emp => ({
                            label: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.employeeId || "EMP"})`,
                            value: emp._id
                        }))
                    );
                }
                if (desigRes?.success) {
                    setDesignationOptions(
                        (desigRes.data?.data || desigRes.data || []).map(d => ({
                            label: `${d.designationname || d.name} (${d.designationcode || d.code || ""})`,
                            value: d._id
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to load dropdown options", err);
            }
        };
        fetchDropdowns();
    }, []);

    useEffect(() => {
        const fetchAppraisalById = async () => {
            if (!appraisalId) {
                setEditData(null);
                return;
            }
            if (data && data._id === appraisalId) {
                setEditData(data);
                return;
            }
            try {
                const res = await apiCall({
                    id: "getAppraisalById",
                    api: api + apiEndpoints.performance.appraisal.AppraisalGetByID,
                    payload: { _id: appraisalId }
                });
                if (res?.success && res.data?.data) {
                    setEditData(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch appraisal", err);
            }
        };
        fetchAppraisalById();
    }, [appraisalId, data]);

    const formattedData = useMemo(() => {
        const source = editData || data;
        if (!source) return initialValue;
        return {
            ...source,
            employeeId: source.employeeId?._id || source.employeeId || "",
            reviewCycle: source.reviewCycle || source.cycle || "FY 2025-2026",
            effectiveDate: formatDateForInput(source.effectiveDate),
            currentSalary: Number(source.currentSalary ?? source.previousSalary ?? 50000),
            recommendedIncrementPercentage: Number(source.recommendedIncrementPercentage ?? source.incrementPercentage ?? 12),
            revisedSalary: Number(source.revisedSalary ?? source.newSalary ?? 56000),
            promotionRecommended: !!(source.promotionRecommended ?? source.promotion),
            proposedDesignation: source.proposedDesignation?._id || source.proposedDesignation || source.newDesignation || "",
            status: source.status || "Recommended",
            remarks: source.remarks || source.comments || ""
        };
    }, [editData, data, initialValue]);

    const activeSchema = useMemo(() => {
        const base = Array.isArray(schema)
            ? schema
            : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
        return base.map(f => {
            if (f.id === "employeeId") return { ...f, options: employeeOptions };
            if (f.id === "proposedDesignation") return { ...f, options: designationOptions };
            return f;
        });
    }, [schema, employeeOptions, designationOptions]);

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
            ...(appraisalId ? { _id: appraisalId } : {})
        };

        const res = await apiCall({
            id: "saveAppraisal",
            api: api + apiEndpoints.performance.appraisal.AppraisalAddEdit,
            payload
        });

        if (res?.success) {
            successAlert({
                title: "Success",
                text: res.message || "Appraisal saved successfully"
            });
            onSaved?.();
            closeModal?.();
        } else if (!res?.error) {
            // useApiCall already reported request failures; only cover other cases.
            errorAlert({
                title: "Error",
                text: res?.message || "Failed to save appraisal"
            });
        }
    };

    const handleClear = () => {
        formInstance.methods.setValues(initialValue);
    };

    return (
        <HpCommonModal
            open={open}
            title={appraisalId ? "Edit Appraisal Record" : "Process Salary Appraisal / Hike"}
            size="lg"
            icon={<TrendingUp size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || isPending("saveAppraisal") || isPending("getAppraisalById")}
            showClearButton={!appraisalId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
                formSchema={activeSchema}
            />
        </HpCommonModal>
    );
};

AppraisalModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onModalClose: PropTypes.func,
    onSaved: PropTypes.func,
    onSave: PropTypes.func,
    data: PropTypes.object,
    extraParams: PropTypes.object,
    loading: PropTypes.bool
};

export default AppraisalModal;
