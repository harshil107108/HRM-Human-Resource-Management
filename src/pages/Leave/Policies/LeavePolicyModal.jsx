import PropTypes from 'prop-types';
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useLeavePolicyConfig } from "./useLeavePolicyConfig";
import { useMemo, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { formatDateForInput } from "@/utils/dateUtils";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const LeavePolicyModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useLeavePolicyConfig();
    const { apiCall } = useApiCall();

    const closeModal = onClose || onModalClose;
    const policyId = extraParams?.id || data?._id;

    const formattedData = useMemo(() => {
        if (!data) return initialValue;
        return {
            ...data,
            effectiveFrom: formatDateForInput(data.effectiveFrom),
        };
    }, [data, initialValue]);

    const schemaArray = useMemo(() => {
        return Array.isArray(schema)
            ? schema
            : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
    }, [schema]);

    const formInstance = useMemo(() => {
        return formMethod.createForm({
            schema: schemaArray,
            initialValue: formattedData,
        });
    }, [schemaArray]);

    const getPolicyById = async () => {
        if (!policyId) return;
        const res = await apiCall({
            id: "getLeavePolicyById",
            api: api + apiEndpoints.leave.policy.PolicyGetByID,
            payload: { _id: policyId },
        });
        if (res?.success && res.data?.data) {
            const d = res.data.data;
            formInstance.methods.setValues({
                ...d,
                effectiveFrom: formatDateForInput(d.effectiveFrom),
            });
        }
    };

    useEffect(() => {
        if (open) {
            if (policyId) {
                if (data) {
                    formInstance.methods.setValues(formattedData);
                } else {
                    getPolicyById();
                }
            } else {
                formInstance.methods.setValues(initialValue);
            }
        }
    }, [open, policyId, data]);

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
            ...(policyId ? { _id: policyId } : {}),
        };

        const res = await apiCall({
            id: "addEditLeavePolicy",
            api: api + apiEndpoints.leave.policy.PolicyAddEdit,
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
            title={policyId ? "Edit Leave Policy" : "Add Leave Policy"}
            size="lg"
            icon={<BookOpen size={20} />}
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
        </HpCommonModal>
    );
};

LeavePolicyModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    data: PropTypes.object,
    loading: PropTypes.bool
};

export default LeavePolicyModal;
