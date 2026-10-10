import PropTypes from 'prop-types';
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useShiftConfig } from "./useShiftConfig";
import { useMemo, useEffect } from "react";
import { Clock } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const ShiftModal = ({
    open,
    onClose,
    onModalClose,
    onSaved,
    onSave,
    data,
    extraParams,
    loading
}) => {
    const { initialValue, schema } = useShiftConfig();
    const { apiCall } = useApiCall();

    const closeModal = onClose || onModalClose;
    const shiftId = extraParams?.id || data?._id;

    const formInstance = useMemo(() => {
        return formMethod.createForm({
            schema: [...schema],
            initialValue: data || initialValue,
        });
    }, [schema]);

    const getShiftById = async () => {
        if (!shiftId) return;
        const res = await apiCall({
            id: "getShiftById",
            api: api + apiEndpoints.attendance.shift.ShiftGetByID,
            payload: { _id: shiftId },
        });
        if (res?.success && res.data?.data) {
            formInstance.methods.setValues(res.data.data);
        }
    };

    useEffect(() => {
        if (open) {
            if (shiftId) {
                if (data) {
                    formInstance.methods.setValues(data);
                } else {
                    getShiftById();
                }
            } else {
                formInstance.methods.setValues(initialValue);
            }
        }
    }, [open, shiftId, data]);

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
            ...(shiftId ? { _id: shiftId } : {}),
        };

        const res = await apiCall({
            id: "addEditShift",
            api: api + apiEndpoints.attendance.shift.ShiftAddEdit,
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
            title={shiftId ? "Edit Shift" : "Add Work Shift"}
            size="lg"
            icon={<Clock size={20} />}
            onSave={handleSave}
            onClose={closeModal}
            onClear={handleClear}
            loading={loading || formInstance.methods.isSubmitting()}
            showClearButton={!shiftId}
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formInstance}
                formSchema={schema}
            />
        </HpCommonModal>
    );
};

ShiftModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    data: PropTypes.object,
    loading: PropTypes.bool
};

export default ShiftModal;
