import { HpGrid } from "@/hp-grid/src";
import React from "react";
import useCityMasterConfig from "./useCityMasterConfig";
import useModal from "@/hooks/useModal";
import CityMasterModal from "./CityMasterModal";
import { api, apiEndpoints } from "@/api/api";
import { useState, useEffect } from "react";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const CityMasterListing = () => {

    const { deleteAlert, successAlert } = useAlert()

    const handleDelete = async (id) => {

        deleteAlert({
            title: "Delete City?",
            text: "Are you sure you want to delete this city? This action cannot be undone.",

            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",

            onClick: async () => {
                const res = await apiCall({
                    id: 'deleteListing',
                    api: api + apiEndpoints.master.city.CityDeleteByID,
                    payload: { _id: id } 
                });


                if (res.success) {
                    successAlert({
                        title: "City deleted",
                        text: "City has been deleted successfully.",
                    });

                    getCityListing();
                }
            },
        });
    }

    const { cityListingColDef } = useCityMasterConfig({ handleDelete });

    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const [CityListingData, setCityListingData] = useState([])

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

    const getCityListing = async () => {
        const res = await apiCall({
            id: "getCityListing",
            api: api + apiEndpoints.master.city.CityGetData,
            payload: {}
        });

        if (res?.success) {
            const data = res.data.data.map((city) => ({
                ...city,
                countryName: city.countryId?.countryName || "",
                stateName: city.stateId?.stateName || "",
            }));

            setCityListingData(data);
        }
    };

    useEffect(() => {
        getCityListing();
    }, [])

    useDocumentTitle("orvexa | City Master")

    return (
        <>
            {isModalOpen && (
                <CityMasterModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    extraParams={extraParams}
                    onSaved={getCityListing}
                />
            )}

            <HpGrid
                id="cityListing"
                rowData={CityListingData}
                colDef={cityListingColDef}
                style={{ height: "100%" }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="City"
            />
        </>
    );
};

export default CityMasterListing;