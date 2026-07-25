import { HpCommonModal } from '@/hp-common-modal'
import { Building2 } from 'lucide-react'
import React from 'react'
import useCountyMasterConfig from './useCountyMasterConfig'
import { formMethod, FormRenderer } from "@/form-engine";

const CountyMasterModal = ({ mode, onModalClose, open, extraParams }) => {


    const { countrySchema, initialValue } = useCountyMasterConfig();

    const formmethod = formMethod.createForm({
        schema: [...countrySchema],
        initialValue,
    });

    const handleSave = () => {
        console.log("Save")
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
                // onClear={() => formMethod.reset()}
                showClearButton
                confirmBeforeClose
            >
                <FormRenderer formMethod={formmethod} formSchema={countrySchema} />
            </HpCommonModal>
        </div>
    )
}

export default CountyMasterModal