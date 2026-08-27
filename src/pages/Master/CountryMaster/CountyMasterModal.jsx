import { HpCommonModal } from '@/hp-common-modal'
import { Building2 } from 'lucide-react'
import React from 'react'
import useCountyMasterConfig from './useCountyMasterConfig'
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from '@/hooks/useApiCall';

const CountyMasterModal = ({ mode, onModalClose, onSaved, open, extraParams }) => {

    const { countrySchema, initialValue } = useCountyMasterConfig();
    const { apiCall, isPending } = useApiCall()

    const formmethod = formMethod.createForm({
        schema: [...countrySchema],
        initialValue,
    });

    const handleSave = async () => {
        const data = formmethod.methods.getValues();

        const res = await apiCall({
            id: 'addEditCountry',
            api: 'http://localhost:8080/master/country/addEditCountry',
            payload: data
        });

        if (res.success) {
            onModalClose();
            await onSaved?.();
        }
    }

    return (
        <div>

            <HpCommonModal
                open={open}
                title="Country"
                size="md"
                icon={<Building2 size={20} />}
                // formMethod={formMethod}
                // loading={loading}
                onSave={handleSave}
                onClose={onModalClose}
                onClear={() => formmethod.methods.reset()}
                showClearButton
                confirmBeforeClose
            >
                <FormRenderer formMethod={formmethod} formSchema={countrySchema} />
            </HpCommonModal>
        </div>
    )
}

export default CountyMasterModal