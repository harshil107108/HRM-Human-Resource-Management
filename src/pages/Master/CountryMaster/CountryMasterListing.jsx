import { HpGrid } from '@/hp-grid/src'
import React, { useEffect, useState } from 'react'
import useCountyMasterConfig from './useCountyMasterConfig'
import useModal from '@/hooks/useModal';
import CountyMasterModal from './CountyMasterModal';
import useApiCall from '@/hooks/useApiCall';

const CountryMasterListing = () => {

    const { apiCall, isPending } = useApiCall();

    const handleDelete = async (id) => {
        const res = await apiCall({
            id: 'deleteListing',
            api: 'http://localhost:8080/master/country/deleteCountryById',
            payload: { _id: id }
        });

        if (res.success) {
            getCountryListing();
        }
    }

    const { countryListingListingColDef } = useCountyMasterConfig({ handleDelete });
    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const [countryListingData, setCountryListingData] = useState([])


    const getCountryListing = async () => {
        const res = await apiCall({
            id: 'getCountyListing',
            api: 'http://localhost:8080/master/country/getCountry',
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
                // onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Country"
                columnFilterable={false}
            />
        </>
    )
}

export default CountryMasterListing