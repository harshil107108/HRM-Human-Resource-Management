import { HpGrid } from '@/hp-grid/src'
import React, { useEffect, useState } from 'react'
import useCountyMasterConfig from './useCountyMasterConfig'
import useModal from '@/hooks/useModal';
import CountyMasterModal from './CountyMasterModal';
import useApiCall from '@/hooks/useApiCall';
import { api, apiEndpoints } from '@/api/api';
import useAlert from '@/hooks/useAlert';
import useDocumentTitle from '@/hooks/useDocumentTitle';

const CountryMasterListing = () => {

    const { apiCall, isPending } = useApiCall();
    const { deleteAlert, successAlert } = useAlert();

    const handleDelete = (id) => {
        deleteAlert({
            title: "Delete Country?",
            text: "Are you sure you want to delete this country? This action cannot be undone.",

            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",

            onClick: async () => {
                const res = await apiCall({
                    id: "deleteListing",
                    api: api + apiEndpoints.master.country.CountryDeleteByID,
                    payload: { _id: id },
                });

                if (res.success) {
                    successAlert({
                        title: "Country deleted",
                        text: "Country has been deleted successfully.",
                    });

                    getCountryListing();
                }
            },
        });
    };

    const { countryListingListingColDef } = useCountyMasterConfig({ handleDelete });
    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const [countryListingData, setCountryListingData] = useState([])


    const getCountryListing = async () => {
        const res = await apiCall({
            id: 'getCountyListing',
            api: api + apiEndpoints?.master?.country?.CountryGetData,
            payload: {}
        });

        const data = res.data.data;
        if (res?.success) {
            setCountryListingData(data);
        }
    }

    useEffect(() => {
        getCountryListing();
    }, [])

    const handleAdd = () => {
        onModalOpen({
            mode: "add",
        });
    }

    const handleDoubleClick = (data) => {
        const id = data.data._id;
        onModalOpen({
            mode: "edit",
            id: id
        });
    }

    useDocumentTitle("orvexa | Country Master")

    return (
        <>
            {isModalOpen && (
                <CountyMasterModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    onSaved={getCountryListing}
                    extraParams={extraParams}
                />
            )}
            <HpGrid
                id='companyListing'
                rowData={countryListingData}
                colDef={countryListingListingColDef}
                style={{ height: '100%' }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Country"
                columnFilterable={true}
            />
        </>
    )
}

export default CountryMasterListing