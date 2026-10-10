import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useReviewConfig } from "./useReviewConfig";
import { Award } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";
import useAlert from "@/hooks/useAlert";

const ReviewModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useReviewConfig();
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [editData, setEditData] = useState(null);
    const { apiCall, isPending } = useApiCall();
    const { successAlert, errorAlert } = useAlert();

    const closeModal = onClose || onModalClose;
    const reviewId = extraParams?.id || data?._id;

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
        const fetchReviewById = async () => {
            if (!reviewId) {
                setEditData(null);
                return;
            }
            if (data && data._id === reviewId) {
                setEditData(data);
                return;
            }
            try {
                const res = await apiCall({
                    id: "getReviewById",
                    api: api + apiEndpoints.performance.review.ReviewGetByID,
                    payload: { _id: reviewId }
                });
                if (res?.success && res.data) {
                    setEditData(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch review", err);
            }
        };
        fetchReviewById();
    }, [reviewId, data]);

    const formattedData = useMemo(() => {
        const source = editData || data;
        if (!source) return initialValue;
        return {
            ...source,
            employeeId: source.employeeId?._id || source.employeeId || "",
            reviewerId: source.reviewerId?._id || source.reviewerId || "",
            reviewPeriod: source.reviewPeriod || source.cycle || "Annual Review 2025-2026",
            selfRating: Number(source.selfRating || source.rating || 4),
            managerRating: Number(source.managerRating || source.rating || 4),
            reviewDate: formatDateForInput(source.reviewDate)
        };
    }, [editData, data, initialValue]);

    const activeSchema = useMemo(() => {
        const base = Array.isArray(schema)
            ? schema
            : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
        return base.map(f => {
            if (f.id === "employeeId" || f.id === "reviewerId") return { ...f, options: employeeOptions };
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
            ...(reviewId ? { _id: reviewId } : {})
        };

        const res = await apiCall({
            id: "saveReview",
            api: api + apiEndpoints.performance.review.ReviewAddEdit,
            payload
        });

        if (res?.success) {
            successAlert({
                title: "Success",
                text: res.message || "Performance review saved successfully"
            });
            onSaved?.();
            closeModal?.();
        } else {
            errorAlert({
                title: "Error",
                text: res?.message || "Failed to save performance review"
            });
        }
    };

    const handleClear = () => {
        formInstance.methods.setValues(initialValue);
    };

    return (
        <HpCommonModal
            open={open}
            title={reviewId ? "Edit Performance Review" : "Conduct Performance Review"}
            size="lg"
            icon={<Award size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || isPending("saveReview") || isPending("getReviewById")}
            showClearButton={!reviewId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
                formSchema={activeSchema}
            />
        </HpCommonModal>
    );
};

ReviewModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onModalClose: PropTypes.func,
    onSaved: PropTypes.func,
    onSave: PropTypes.func,
    data: PropTypes.object,
    extraParams: PropTypes.object,
    loading: PropTypes.bool
};

export default ReviewModal;
