import { HpGrid } from "@/hp-grid/src";
import React from "react";
import useCityMasterConfig from "./useCityMasterConfig";
import useModal from "@/hooks/useModal";
import CityMasterModal from "./CityMasterModal";

const CityMasterListing = () => {
    const { cityListingColDef, cityRowData } = useCityMasterConfig();

    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();

    const handleAdd = () => {
        onModalOpen({
            mode: "add",
        });
    };

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
                rowData={cityRowData}
                colDef={cityListingColDef}
                style={{ height: "100%" }}
                // onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="City"
            />
        </>
    );
};

export default CityMasterListing;