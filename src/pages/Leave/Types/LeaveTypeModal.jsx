import PropTypes from 'prop-types';
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useLeaveTypeConfig } from "./useLeaveTypeConfig";
import { useMemo, useEffect } from "react";
import { FileText } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const LeaveTypeModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useLeaveTypeConfig();
    const { apiCall } = useApiCall();

    const closeModal = onClose || onModalClose;
    const typeId = extraParams?.id || data?._id;

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

    const getTypeById = async () => {
        if (!typeId) return;
        const res = await apiCall({
            id: "getLeaveTypeById",
            api: api + apiEndpoints.leave.type.TypeGetByID,
            payload: { _id: typeId },
        });
        if (res?.success && res.data?.data) {
            formInstance.methods.setValues(res.data.data);
        }
    };

    useEffect(() => {
        if (open) {
            if (typeId) {
                if (data) {
                    formInstance.methods.setValues(data);
                } else {
                    getTypeById();
                }
            } else {
                formInstance.methods.setValues(initialValue);
            }
        }
    }, [open, typeId, data]);

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
            ...(typeId ? { _id: typeId } : {}),
        };

        const res = await apiCall({
            id: "addEditLeaveType",
            api: api + apiEndpoints.leave.type.TypeAddEdit,
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
            title={typeId ? "Edit Leave Type" : "Add Leave Type"}
            size="lg"
            icon={<FileText size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || formInstance.methods.isSubmitting()}
            showClearButton={!typeId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
                formSchema={schemaArray}
            />
        </HpCommonModal>
    );
};

LeaveTypeModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    data: PropTypes.object,
    loading: PropTypes.bool
};

export default LeaveTypeModal;
