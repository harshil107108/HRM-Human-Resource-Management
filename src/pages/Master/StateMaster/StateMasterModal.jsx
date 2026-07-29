import { HpCommonModal } from "@/hp-common-modal";
import { Building2 } from "lucide-react";
import React from "react";
import useStateMasterConfig from "./useStateMasterConfig";
import { formMethod, FormRenderer } from "@/form-engine";

const StateMasterModal = ({ mode, onModalClose, open, extraParams }) => {
    const { stateSchema, initialValue } = useStateMasterConfig();

    const formmethod = formMethod.createForm({
        schema: [...stateSchema],
        initialValue,
    });

    const handleSave = () => {
        console.log("Save State");
    };

    return (
        <HpCommonModal
            open={open}
            title="State"
            size="md"
            icon={<Building2 size={20} />}
            onSave={handleSave}
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