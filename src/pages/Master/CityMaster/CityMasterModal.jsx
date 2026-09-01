import { HpCommonModal } from "@/hp-common-modal";
import { Building2 } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import useCityMasterConfig from "./useCityMasterConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const CityMasterModal = ({ onModalClose, open, extraParams, onSaved }) => {
    const { citySchema, initialValue } = useCityMasterConfig();

    const { apiCall } = useApiCall();

    const cityId = extraParams?.id;
    const mode = extraParams?.mode;


    const formmethod = useMemo(() => {
        return formMethod.createForm({
            schema: [...citySchema],
            initialValue,
        });
    }, []);


    const handleSave = async () => {
        const result = await formmethod.methods.handleFormSave(
            async (data) => {

                const payload = cityId
                    ? { ...data, _id: cityId }
                    : data;

                const res = await apiCall({
                    id: 'addEditCountry',
                    api: api + apiEndpoints.master.city.CityAddEdit,
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
            id: 'addEditCity',
            api: api + apiEndpoints.master.city.CityGetByID,
            payload: { _id: cityId },
        });

        const data = res.data;

        if (data.success) {
            formmethod.methods.setValues({
                ...data.data,
                countryId: data.data.countryId._id
            });
        }
    };


    useEffect(() => {
        if (open && mode === "edit" && cityId) {
            getDataById();
        }
    }, [open, mode, cityId]);


    return (
        <HpCommonModal
            open={open}
            title="City"
            size="md"
            icon={<Building2 size={20} />}
            onSave={handleSave}
            onClose={onModalClose}
            onClear={() => formmethod.methods.reset()}
            showClearButton
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formmethod}
                formSchema={citySchema}
            />
        </HpCommonModal>
    );
};

export default CityMasterModal;