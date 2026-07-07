import { HpGrid } from '@/hp-grid/src';
import { useNavigate } from 'react-router-dom';
import useCompanyConfig from './useCompanyConfig';

const CompanyListing = () => {
    const { companyListingColDef } = useCompanyConfig();
    const navigate = useNavigate();
    const companyRowData = [
        {
            companyid: '1',
            companyName: "Orvexa Technologies",
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
        {
            companyid: '2',
            companyName: "NovaSoft Solutions",
            legalName: "NovaSoft Solutions LLP",
            companyCode: "NOV002",
            businessEmail: "contact@novasoft.in",
            phone: "+91 9123456789",
            website: "https://www.novasoft.in",
            establishDate: "2019-08-20",
            registrationNumber: "AAL-5678",
            panNumber: "AAFCN5678L",
            gstNumber: "24AAFCN5678L1Z8",
            industry: "Software Development",
            date: Date.now(),
            copanySize: "201-500",
            addressLine1: "204, Titanium City Center",
            addressLine2: "Prahlad Nagar",
            country: "India",
            state: "Gujarat",
            city: "Ahmedabad",
            postalCode: "380015",
        },
        {
            companyid: '3',
            companyName: "Skyline Industries",
            legalName: "Skyline Industries Limited",
            companyCode: "SKY003",
            businessEmail: "support@skylineind.com",
            phone: "+91 9988776655",
            website: "https://www.skylineind.com",
            establishDate: "2015-03-10",
            registrationNumber: "L28999MH2015PLC112233",
            panNumber: "AACCS9876J",
            gstNumber: "27AACCS9876J1Z2",
            industry: "Manufacturing",
            date: Date.now(),
            copanySize: "500+",
            addressLine1: "12 Industrial Estate",
            addressLine2: "MIDC",
            country: "India",
            state: "Maharashtra",
            city: "Pune",
            postalCode: "411019",
        },
        {
            companyid: '4',
            companyName: "GreenLeaf Healthcare",
            legalName: "GreenLeaf Healthcare Private Limited",
            companyCode: "GLH004",
            businessEmail: "hello@greenleafhealth.com",
            phone: "+91 9012345678",
            website: "https://www.greenleafhealth.com",
            establishDate: "2018-11-05",
            registrationNumber: "U85110DL2018PTC445566",
            panNumber: "AAECG4455M",
            gstNumber: "07AAECG4455M1Z9",
            industry: "Healthcare",
            date: Date.now(),
            copanySize: "101-250",
            addressLine1: "45 Health Plaza",
            addressLine2: "Connaught Place",
            country: "India",
            state: "Delhi",
            city: "New Delhi",
            postalCode: "110001",
        },
        {
            companyid: '5',
            companyName: "Future Retail Hub",
            legalName: "Future Retail Hub Private Limited",
            companyCode: "FRH005",
            businessEmail: "sales@futureretail.com",
            phone: "+91 9090909090",
            website: "https://www.futureretail.com",
            establishDate: "2020-01-18",
            registrationNumber: "U52100KA2020PTC778899",
            panNumber: "AACCF7788N",
            gstNumber: "29AACCF7788N1Z3",
            industry: "Retail",
            date: Date.now(),
            copanySize: "51-100",
            addressLine1: "89 MG Road",
            addressLine2: "Ashok Nagar",
            country: "India",
            state: "Karnataka",
            city: "Bengaluru",
            postalCode: "560001",
        },
    ];


    const handleDoubleClick = (params) => {
        const { data } = params;
        navigate(`${location.pathname}/addedit`, {
            state: {
                companyid: data?.companyid,
            },
        });
    }

    const handleAdd = () => {
        navigate(`${location.pathname}/addedit`);
    }

    return (
        <>
            <HpGrid
                id='companyListing'
                rowData={companyRowData}
                colDef={companyListingColDef}
                style={{ height: '100%' }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Company"
            />
        </>
    )
}

export default CompanyListing