import { HpGrid } from "@/hp-grid/src";
import React from "react";
import useHolidayMasterConfig from "./useHolidayMasterConfig";
import useModal from "@/hooks/useModal";
import HolidayMasterModal from "./HolidayMasterModal";

const HolidayMasterListing = () => {
    const {
        holidayListingColDef,
        holidayRowData,
    } = useHolidayMasterConfig();

    const {
        isModalOpen,
        extraParams,
        onModalOpen,
        onModalClose,
    } = useModal();

    const handleAdd = () => {
        onModalOpen({
            mode: "add",
        });
    };

    return (
        <>
            {isModalOpen && (
                <HolidayMasterModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    extraParams={extraParams}
                />
            )}

            <HpGrid
                id="holidayListing"
                rowData={holidayRowData}
                colDef={holidayListingColDef}
                style={{ height: "100%" }}
                // onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Holiday"
            />
        </>
    );
};

export default HolidayMasterListing;