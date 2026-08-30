import { HpGrid } from "@/hp-grid/src";
import React, { useEffect, useState } from "react";
import useHolidayMasterConfig from "./useHolidayMasterConfig";
import useModal from "@/hooks/useModal";
import HolidayMasterModal from "./HolidayMasterModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import { formatDateForInput } from "@/utils/dateUtils";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const HolidayMasterListing = () => {
    const { apiCall } = useApiCall();
    const { deleteAlert, successAlert } = useAlert();

    const [holidayListingData, setHolidayListingData] = useState([]);

    const handleDelete = (id) => {
        deleteAlert({
            title: "Delete Holiday?",
            text: "Are you sure you want to delete this holiday? This action cannot be undone.",

            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",

            onClick: async () => {
                const res = await apiCall({
                    id: "deleteListing",
                    api: api + apiEndpoints.master.holiday.HolidayDeleteByID,
                    payload: { _id: id },
                });

                if (res.success) {
                    successAlert({
                        title: "Holiday deleted",
                        text: "Holiday has been deleted successfully.",
                    });

                    getHolidayListing();
                }
            },
        });
    };

    const {
        holidayListingColDef,
    } = useHolidayMasterConfig({
        handleDelete,
    });

    const {
        isModalOpen,
        extraParams,
        onModalOpen,
        onModalClose,
    } = useModal();


    const getHolidayListing = async () => {
        const res = await apiCall({
            id: "getHolidayListing",
            api: api + apiEndpoints.master.holiday.HolidayGetData,
            payload: {},
        });

        if (res?.success) {
            const holidays = res.data.data.map((item) => ({
                ...item,
                holidayDate: formatDateForInput(item.holidayDate),
            }));

            setHolidayListingData(holidays);
        }
    };

    useEffect(() => {
        getHolidayListing();
    }, []);


    const handleAdd = () => {
        onModalOpen({
            mode: "add",
        });
    };

    const handleDoubleClick = (data) => {
        const id = data.data._id;

        onModalOpen({
            mode: "edit",
            id: id,
        });
    };

    useDocumentTitle("orvexa | Holiday Master")

    return (
        <>
            {isModalOpen && (
                <HolidayMasterModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    onSaved={getHolidayListing}
                    extraParams={extraParams}
                />
            )}

            <HpGrid
                id="holidayListing"
                rowData={holidayListingData}
                colDef={holidayListingColDef}
                style={{ height: "100%" }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Holiday"
                columnFilterable={true}
            />
        </>
    );
};

export default HolidayMasterListing;
