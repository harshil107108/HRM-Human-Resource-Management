import { HpCommonModal } from "@/hp-common-modal";
import { Building2 } from "lucide-react";
import React, { useEffect } from "react";
import useCityMasterConfig from "./useCityMasterConfig";
import { formMethod, FormRenderer } from "@/form-engine";

const CityMasterModal = ({ mode, onModalClose, open, extraParams }) => {
    const { citySchema, initialValue } = useCityMasterConfig();

    const formmethod = formMethod.createForm({
        schema: [...citySchema],
        initialValue,
    });

    const handleSave = () => {
        console.log("Save City");
        console.log(formmethod)
        console.log(formmethod.methods.getValues());
        formmethod.methods.setValue('cityName', "abc")
    };


    useEffect(() => {
        console.log("work")
    }, [])


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