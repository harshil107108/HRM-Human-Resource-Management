import { HpGrid } from '@/hp-grid/src';
import { useLocation, useNavigate } from 'react-router-dom';
import useBranchConfig from './useBranchConfig';

const BranchListing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { branchListingColDef } = useBranchConfig()

    const branchRowData = [
        {
            branchid: '1',
            branchname: "Orvexa Technologies",
            legalName: "Orvexa Technologies Private Limited",
            companyCode: "ORV001",
            businessEmail: "info@orvexa.com",
            phone: "+91 9876543210",
            website: "https://www.orvexa.com",
            establishDate: "2021-05-12",
            registrationNumber: "U72900GJ2021PTC123456",
            panNumber: "AABCO1234P",
            gstNumber: "24AABCO1234P1Z5",
            industry: "Information Technology",
            date: Date.now(),
            copanySize: "51-200",
            addressLine1: "101, Orion Business Park",
            addressLine2: "SG Highway",
            country: "India",
            state: "Gujarat",
            city: "Ahmedabad",
            postalCode: "380054",
        },
    ];


    const handleAdd = () => {
        navigate(location.pathname + '/addedit')
    }

    const handleDoubleClick = (params) => {
        const { data } = params;
        navigate(`${location.pathname}/addedit`, {
            state: {
                branchid: data?.branchid,
            },
        });
    }


    return (
        <>
            <HpGrid
                id='branchListing'
                title="Branch"
                rowData={branchRowData}
                colDef={branchListingColDef}
                style={{ height: '100%' }}
                onAddClick={handleAdd}
                onDoubleClick={handleDoubleClick}
            />
        </>
    )
}

export default BranchListing