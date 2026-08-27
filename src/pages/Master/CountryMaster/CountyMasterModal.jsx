import { HpCommonModal } from '@/hp-common-modal'
import { Building2 } from 'lucide-react'
import React, { useEffect, useMemo } from 'react'
import useCountyMasterConfig from './useCountyMasterConfig'
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from '@/hooks/useApiCall';
import { api, apiEndpoints } from '@/api/api';

const CountyMasterModal = ({ onModalClose, onSaved, open, extraParams }) => {

    const { countrySchema, initialValue } = useCountyMasterConfig();
    const { apiCall, isPending } = useApiCall();

    const countryId = extraParams?.id;
    const mode = extraParams?.mode;

    // Create FormStore only once
    const formmethod = useMemo(() => {
        return formMethod.createForm({
            schema: [...countrySchema],
            initialValue,
        });
    }, []);

    const handleSave = async () => {
        const data = formmethod.methods.getValues();

        const payload = countryId
            ? { ...data, _id: countryId }
            : data;

        const res = await apiCall({
            id: 'addEditCountry',
            api: api + apiEndpoints.master.country.CountryAddEdit,
            payload,
        });

        if (res.success) {
            onModalClose();
            await onSaved?.();
        }
    };

    const getDataById = async () => {
        const res = await apiCall({
            id: 'addEditCountry',
            api: api + apiEndpoints.master.country.CountryGetByID,
            payload: { _id: countryId },
        });

        const data = res.data;

        if (data.success) {
            console.log("API DATA:", data.data);

            formmethod.methods.setValues(data.data);
        }
    };

    useEffect(() => {
        if (open && mode === "edit" && countryId) {
            getDataById();
        }
    }, [open, mode, countryId]);

    return (
        <HpCommonModal
            open={open}
            title="Country"
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
                formSchema={countrySchema}
            />
        </HpCommonModal>
    );
};

export default CountyMasterModal;