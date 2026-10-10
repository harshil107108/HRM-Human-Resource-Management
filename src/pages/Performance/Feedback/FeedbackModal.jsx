import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useFeedbackConfig } from "./useFeedbackConfig";
import { MessageSquareQuote } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";

const FeedbackModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useFeedbackConfig();
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [editData, setEditData] = useState(null);
    const { apiCall, isPending } = useApiCall();
    const { successAlert, errorAlert } = useAlert();

    const closeModal = onClose || onModalClose;
    const feedbackId = extraParams?.id || data?._id;

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
        const fetchFeedbackById = async () => {
            if (!feedbackId) {
                setEditData(null);
                return;
            }
            if (data && data._id === feedbackId) {
                setEditData(data);
                return;
            }
            try {
                const res = await apiCall({
                    id: "getFeedbackById",
                    api: api + apiEndpoints.performance.feedback.FeedbackGetByID,
                    payload: { _id: feedbackId }
                });
                if (res?.success && res.data) {
                    setEditData(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch feedback", err);
            }
        };
        fetchFeedbackById();
    }, [feedbackId, data]);

    const formattedData = useMemo(() => {
        const source = editData || data;
        if (!source) return initialValue;
        return {
            ...source,
            givenTo: source.givenTo?._id || source.givenTo || source.toEmployeeId?._id || source.toEmployeeId || "",
            givenBy: source.givenBy?._id || source.givenBy || source.fromEmployeeId?._id || source.fromEmployeeId || "",
            rating: Number(source.rating || 5),
            strengths: source.strengths || source.message || "",
            suggestions: source.suggestions || "",
            isAnonymous: !!source.isAnonymous,
            status: source.status || "Published"
        };
    }, [editData, data, initialValue]);

    const activeSchema = useMemo(() => {
        const base = Array.isArray(schema)
            ? schema
            : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
        return base.map(f => {
            if (f.id === "givenBy" || f.id === "givenTo") return { ...f, options: employeeOptions };
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
            ...(feedbackId ? { _id: feedbackId } : {})
        };

        const res = await apiCall({
            id: "saveFeedback",
            api: api + apiEndpoints.performance.feedback.FeedbackAddEdit,
            payload
        });

        if (res?.success) {
            successAlert({
                title: "Success",
                text: res.message || "Feedback shared successfully"
            });
            onSaved?.();
            closeModal?.();
        } else {
            errorAlert({
                title: "Error",
                text: res?.message || "Failed to save feedback"
            });
        }
    };

    const handleClear = () => {
        formInstance.methods.setValues(initialValue);
    };

    return (
        <HpCommonModal
            open={open}
            title={feedbackId ? "Edit Feedback" : "Share Continuous Feedback & Recognition"}
            size="lg"
            icon={<MessageSquareQuote size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || isPending("saveFeedback") || isPending("getFeedbackById")}
            showClearButton={!feedbackId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
                formSchema={activeSchema}
            />
        </HpCommonModal>
    );
};

FeedbackModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onModalClose: PropTypes.func,
    onSaved: PropTypes.func,
    onSave: PropTypes.func,
    data: PropTypes.object,
    extraParams: PropTypes.object,
    loading: PropTypes.bool
};

export default FeedbackModal;
