import { HpGrid } from "@/hp-grid/src";
import React from "react";
import useStateMasterConfig from "./useStateMasterConfig";
import useModal from "@/hooks/useModal";
import StateMasterModal from "./StateMasterModal";

const StateMasterListing = () => {
    const { stateListingColDef, stateRowData } = useStateMasterConfig();

    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();

    const handleAdd = () => {
        onModalOpen({
            mode: "add",
        });
    };

    return (
        <>
            {isModalOpen && (
                <StateMasterModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    extraParams={extraParams}
                />
            )}

            <HpGrid
                id="stateListing"
                rowData={stateRowData}
                colDef={stateListingColDef}
                style={{ height: "100%" }}
                // onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="State"
            />
        </>
    );
};

export default StateMasterListing;