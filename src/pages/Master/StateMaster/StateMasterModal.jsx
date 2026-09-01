import { HpCommonModal } from "@/hp-common-modal";
import { Building2 } from "lucide-react";
import React, { useMemo, useEffect } from "react";
import useStateMasterConfig from "./useStateMasterConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const StateMasterModal = ({ onModalClose, onSaved, open, extraParams }) => {
    const { stateSchema, initialValue } = useStateMasterConfig();

    const { apiCall, isPending } = useApiCall();

    const StateId = extraParams?.id;
    const mode = extraParams?.mode;

    const formmethod = useMemo(() => {
        return formMethod.createForm({
            schema: [...stateSchema],
            initialValue,
        });
    }, []);


    const handleSave = async () => {
        const result = await formmethod.methods.handleFormSave(
            async (data) => {

                const payload = StateId
                    ? { ...data, _id: StateId }
                    : data;

                const res = await apiCall({
                    id: 'addEditCountry',
                    api: api + apiEndpoints.master.state.StateAddEdit,
                    payload,
                    showSuccessAlert: true

                });

                if (!res?.success) {
                    throw new Error(res?.message || 'Failed to save City');
                }

                return res;
            },
            {
                successMessage: 'City saved successfully',
                onSuccess: async () => {
                    onModalClose();
                    await onSaved?.();
                },
            },
        );

        return result;
    };

    const getDataById = async () => {
        const res = await apiCall({
            id: "getStateById",
            api: api + apiEndpoints.master.state.StateGetByID,
            payload: { _id: StateId },
        });

        if (res.success) {
            const data = res.data;
            formmethod.methods.setValues({
                ...data.data,
                countryId: data.data.countryId?._id || "",
            });
        }
    };

    useEffect(() => {
        if (open && mode === "edit" && StateId) {
            getDataById();
        }
    }, [open, mode, StateId]);

    return (
        <HpCommonModal
            open={open}
            title="State"
            size="md"
            icon={<Building2 size={20} />}
            onSave={handleSave}
            onClear={() => formmethod.methods.reset()}
            onClose={onModalClose}
            showClearButton
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formmethod}
                formSchema={stateSchema}
            />
        </HpCommonModal>
    );
};

export default StateMasterModal;