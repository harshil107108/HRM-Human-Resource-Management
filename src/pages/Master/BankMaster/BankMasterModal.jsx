import { HpCommonModal } from "@/hp-common-modal";
import { Building2 } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import useBankMasterConfig from "./useBankMasterConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const BankMasterModal = ({ onModalClose, open, extraParams, onSaved }) => {
    const { bankSchema, initialValue } = useBankMasterConfig();

    const { apiCall } = useApiCall();

    const bankId = extraParams?.id;
    const mode = extraParams?.mode;

    const formmethod = useMemo(() => {
        return formMethod.createForm({
            schema: [...bankSchema],
            initialValue,
        });
    }, []);

    const handleSave = async () => {
        const data = formmethod.methods.getValues();

        const payload = bankId
            ? { ...data, _id: bankId }
            : data;

        const res = await apiCall({
            id: 'addEditCountry',
            api: api + apiEndpoints.master.bank.BankAddEdit,
            payload,
            showSuccessAlert: true
        });

        if (res.success) {
            onModalClose();
            await onSaved?.();
        }
    };


    const getDataById = async () => {
        const res = await apiCall({
            id: 'addEditBank',
            api: api + apiEndpoints.master.bank.BankGetByID,
            payload: { _id: bankId },
        });

        const data = res.data;

        if (data.success) {
            formmethod.methods.setValues(data.data);
        }
    };


    useEffect(() => {
        if (open && mode === "edit" && bankId) {
            getDataById();
        }
    }, [open, mode, bankId]);


    return (
        <HpCommonModal
            open={open}
            title="Bank"
            size="xs"
            icon={<Building2 size={20} />}
            onSave={handleSave}
            onClose={onModalClose}
            onClear={() => formmethod.methods.reset()}
            showClearButton
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formmethod}
                formSchema={bankSchema}
            />
        </HpCommonModal>
    );
};

export default BankMasterModal;