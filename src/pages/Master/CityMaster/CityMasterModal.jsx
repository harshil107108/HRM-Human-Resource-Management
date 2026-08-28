import { HpCommonModal } from "@/hp-common-modal";
import { Building2 } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import useCityMasterConfig from "./useCityMasterConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const CityMasterModal = ({ onModalClose, open, extraParams }) => {
    const { citySchema, initialValue } = useCityMasterConfig();

    const { apiCall, isPending } = useApiCall();

    const cityId = extraParams?.id;
    const mode = extraParams?.mode; 

    const formmethod = useMemo(() => {
        return formMethod.createForm({
            schema: [...citySchema],
            initialValue,
        });
    }, []);

    const handleSave = async () => {
        const data = formmethod.methods.getValues();

        const payload = cityId
            ? { ...data, _id: cityId }
            : data;

        const res = await apiCall({
            id: 'addEditCountry',
            api: api + apiEndpoints.master.city.CityAddEdit,
            payload,
        });

        if (res.success) {
            onModalClose();
            await onSaved?.();
        }
    };


    const getDataById = async () => {
        const res = await apiCall({
            id: 'addEditCity',
            api: api + apiEndpoints.master.city.CityGetByID,
            payload: { _id: cityId },
        });

        const data = res.data;

        if (data.success) {
            formmethod.methods.setValues(data.data);
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