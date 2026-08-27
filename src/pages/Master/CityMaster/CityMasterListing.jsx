import { HpGrid } from "@/hp-grid/src";
import React from "react";
import useCityMasterConfig from "./useCityMasterConfig";
import useModal from "@/hooks/useModal";
import CityMasterModal from "./CityMasterModal";
import { api, apiEndpoints } from "@/api/api";
import { useState, useEffect } from "react";

const CityMasterListing = () => {

    const handleDelete = async (id) => {
        const res = await apiCall({
            id: 'deleteListing',
            api: api + apiEndpoints.master.city.CityDeleteByID,
            payload: { _id: id }
        });

        if (res.success) {
            getCityListing();
        }
    }

    const { cityListingColDef } = useCityMasterConfig({ handleDelete });

    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const [CityListingData, setCityListingData] = useState([])

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
            id: 'getCityListing',
            api: api + apiEndpoints?.master?.city?.CityGetData,
            payload: {}
        });

        const data = res.data.data;
        if (res?.success) {
            setCityListingData(data);
        }
    }

    useEffect(() => {
        getCityListing();
    }, [])

    return (
        <>
            {isModalOpen && (
                <CityMasterModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    extraParams={extraParams}
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