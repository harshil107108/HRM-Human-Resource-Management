import { HpGrid } from "@/hp-grid/src";
import React, { useState, useEffect } from "react";
import useStateMasterConfig from "./useStateMasterConfig";
import useModal from "@/hooks/useModal";
import StateMasterModal from "./StateMasterModal";
import useApiCall from '@/hooks/useApiCall';
import { api, apiEndpoints } from '@/api/api';
import useAlert from '@/hooks/useAlert';
import useDocumentTitle from "@/hooks/useDocumentTitle";

const StateMasterListing = () => {
    const handleDelete = (id) => {
        deleteAlert({
            title: "Delete State?",
            text: "Are you sure you want to delete this State? This action cannot be undone.",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            onClick: async () => {
                const res = await apiCall({
                    id: "deleteListing",
                    api: api + apiEndpoints.master.state.StateDeleteByID,
                    payload: { _id: id },
                });

                if (res.success) {
                    successAlert({
                        title: "State deleted",
                        text: "State has been deleted successfully.",
                    });

                    getStateListing();
                }
            },
        });
    };

    const { stateListingColDef } = useStateMasterConfig({ handleDelete });
    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const { apiCall } = useApiCall();
    const { deleteAlert, successAlert } = useAlert();
    const [stateListingData, setStateListingData] = useState([])


    const handleAdd = () => {
        onModalOpen({
            mode: "add",
        });
    };

    const getStateListing = async () => {
        const res = await apiCall({
            id: 'getStateListing',
            api: api + apiEndpoints?.master?.state?.StateGetData,
            payload: {}
        });

        if (res?.success) {
            const data = res.data.data;

            const formattedData = data.map((item) => ({
                ...item,
                countryId: item.countryId?._id,
                countryName: item.countryId?.countryName,
            }));

            setStateListingData(formattedData);
        }
    };
    useEffect(() => {
        getStateListing();
    }, [])

    const handleDoubleClick = (data) => {
        const id = data.data._id;
        onModalOpen({
            mode: "edit",
            id: id
        });
    }

    useDocumentTitle("orvexa | State Master")

    return (
        <>
            {isModalOpen && (
                <StateMasterModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    onSaved={getStateListing}
                    extraParams={extraParams}
                />
            )}

            <HpGrid
                id="stateListing"
                rowData={stateListingData}
                colDef={stateListingColDef}
                style={{ height: "100%" }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="State"
            />
        </>
    );
};

export default StateMasterListing;