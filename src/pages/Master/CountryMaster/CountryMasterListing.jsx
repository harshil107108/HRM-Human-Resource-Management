import { HpGrid } from '@/hp-grid/src'
import React from 'react'
import useCountyMasterConfig from './useCountyMasterConfig'
import useModal from '@/hooks/useModal';
import CountyMasterModal from './CountyMasterModal';

const CountryMasterListing = () => {

    const { countryListingListingColDef, countryRowData } = useCountyMasterConfig();
    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();

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
                    extraParams={extraParams}
                />
            )}
            <HpGrid
                id='companyListing'
                rowData={countryRowData}
                colDef={countryListingListingColDef}
                style={{ height: '100%' }}
                // onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Company"
            />
        </>
    )
}

export default CountryMasterListing