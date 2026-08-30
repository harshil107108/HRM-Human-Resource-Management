import { HpGrid } from "@/hp-grid/src";
import React from "react";
import useBankMasterConfig from "./useBankMasterConfig";
import useModal from "@/hooks/useModal";
import BankMasterModal from "./BankMasterModal";
import { api, apiEndpoints } from "@/api/api";
import { useState, useEffect } from "react";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const BankMasterListing = () => {

    const { deleteAlert, successAlert } = useAlert()

    const handleDelete = async (id) => {

        deleteAlert({
            title: "Delete Bank?",
            text: "Are you sure you want to delete this bank? This action cannot be undone.",

            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",

            onClick: async () => {
                const res = await apiCall({
                    id: 'deleteListing',
                    api: api + apiEndpoints.master.bank.BankDeleteByID,
                    payload: { _id: id }
                });


                if (res.success) {
                    successAlert({
                        title: "Bank deleted",
                        text: "Bank has been deleted successfully.",
                    });

                    getBankListing();
                }
            },
        });
    }

    const { bankListingColDef } = useBankMasterConfig({ handleDelete });

    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const [BankListingData, setBankListingData] = useState([])

    const { apiCall } = useApiCall();

    const handleAdd = () => {
        onModalOpen({
            mode: "add",
        });
    };

    const handleDoubleClick = (data) => {
        const id = data.data._id;
        onModalOpen({
            mode: "edit",
            id: id
        });
    }

    const getBankListing = async () => {
        const res = await apiCall({
            id: "getBankListing",
            api: api + apiEndpoints.master.bank.BankGetData,
            payload: {}
        });

        if (res?.success) {
            const data = res.data.data;
            setBankListingData(data);
        }
    };

    useEffect(() => {
        getBankListing();
    }, [])

    useDocumentTitle("orvexa | Bank Master")

    return (
        <>
            {isModalOpen && (
                <BankMasterModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    extraParams={extraParams}
                    onSaved={getBankListing}
                />
            )}

            <HpGrid
                id="bankListing"
                rowData={BankListingData}
                colDef={bankListingColDef}
                style={{ height: "100%" }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Bank"
            />
        </>
    );
};

export default BankMasterListing;