import { api, apiEndpoints } from "@/api/api";

const useBranchConfig = ({ handleDelete } = {}) => {
    const contactInfoSchema = [
        {
            id: "officialemail",
            type: "text",
            label: "Official Email",
            placeHolder: "branch@company.com",
            required: true,
            prevFocusField: null,
            nextFocusField: "phonen0",
        },
        {
            id: "phonen0",
            type: "text",
            label: "Phone Number",
            placeHolder: "+91 9876543210",
            required: true,
            prevFocusField: "officialemail",
            nextFocusField: "altphoneno",
        },
        {
            id: "altphoneno",
            type: "text",
            label: "Alternate Phone",
            placeHolder: "+91 9876543211",
            required: false,
            prevFocusField: "phonen0",
            nextFocusField: "website",
        },
        {
            id: "website",
            type: "text",
            label: "Website",
            placeHolder: "https://www.company.com",
            required: false,
            prevFocusField: "altphoneno",
            nextFocusField: "supportemail",
        },
        {
            id: "supportemail",
            type: "text",
            label: "Support Email",
            placeHolder: "support@company.com",
            required: false,
            prevFocusField: "website",
            nextFocusField: null,
        },
    ];

    const basicInfoSchema = [
        {
            id: "branchcode",
            type: "text",
            label: "Branch Code",
            placeHolder: "e.g. GUJ001",
            required: true,
            prevFocusField: null,
            nextFocusField: "branchname",
            className: "col-span-3",

        },
        {
            id: "branchname",
            type: "text",
            label: "Branch Name",
            placeHolder: "e.g. Gujarat Central Hub",
            required: true,
            prevFocusField: "branchcode",
            nextFocusField: "parentcompany",
            className: "col-span-3",
        },
        {
            id: "parentcompany",
            type: "selectWrapper",
            label: "Parent Company",
            required: true,
            prevFocusField: "branchname",
            nextFocusField: "branchtype",
            api: api + apiEndpoints.organization.company.CompanyHelp,
            labelKey: "companyName",
            valueKey: "_id",
            className: "col-span-3",
        },
        {
            id: "branchtype",
            type: "selectWrapper",
            label: "Branch Type",
            required: true,
            prevFocusField: "parentcompany",
            nextFocusField: null,
            className: "col-span-3",
            options: [
                { label: "Head Office", value: "HEAD_OFFICE" },
                { label: "Regional Office", value: "REGIONAL_OFFICE" },
                { label: "Branch Office", value: "BRANCH_OFFICE" },
                { label: "Corporate Office", value: "CORPORATE_OFFICE" },
                { label: "Zonal Office", value: "ZONAL_OFFICE" },
                { label: "Area Office", value: "AREA_OFFICE" },
                { label: "Sales Office", value: "SALES_OFFICE" },
                { label: "Service Office", value: "SERVICE_OFFICE" },
                { label: "Warehouse", value: "WAREHOUSE" },
                { label: "Factory / Plant", value: "FACTORY_PLANT" },
                { label: "Regional Headquarters", value: "REGIONAL_HEADQUARTERS" },
                { label: "Other", value: "OTHER" },
            ],
        },
    ];
    const addressSchema = [
        {
            id: "addressLine1",
            type: "text",
            label: "Address Line 1",
            placeHolder: "Street address, P.O. box, company name",
            required: true,
            nextFocusField: "addressLine2",
            className: "col-span-6",
        },
        {
            id: "addressLine2",
            type: "text",
            label: "Address Line 2 (Optional)",
            placeHolder: "Apartment, suite, unit, building, floor",
            prevFocusField: "addressLine1",
            nextFocusField: "country",
            className: "col-span-6",
        },
        {
            id: "country",
            type: "selectWrapper",
            label: "Country",
            placeHolder: "Select Country",
            api: api + apiEndpoints.master.country.CountryHelp,
            labelKey: "countryName",
            valueKey: "_id",
            required: true,
            prevFocusField: "addressLine2",
            nextFocusField: "state",
        },
        {
            id: "state",
            type: "selectWrapper",
            label: "State / Province",
            placeHolder: "Enter state",
            required: true,
            api: api + apiEndpoints.master.state.StateHelp,
            labelKey: "stateName",
            valueKey: "_id",
            prevFocusField: "country",
            nextFocusField: "city",
        },
        {
            id: "city",
            type: "selectWrapper",
            label: "City",
            placeHolder: "City name",
            required: true,
            api: api + apiEndpoints.master.city.CityHelp,
            labelKey: "cityName",
            valueKey: "_id",
            prevFocusField: "state",
            nextFocusField: "postalCode",
        },
        {
            id: "postalCode",
            type: "text",
            label: "Postal Code",
            placeHolder: "Zip/Postal",
            required: true,
            prevFocusField: "city",
            nextFocusField: "officialemail",
        },
    ];

    const branchListingColDef = [
        {
            id: "branchname",
            field: "branchname",
            headerName: "Branch Name",
            width: 220,
        },
        {
            id: "companyName",
            field: "companyName",
            headerName: "Parent Company Name",
            width: 160,
        },
        {
            id: "companyCode",
            field: "companyCode",
            headerName: "Parent Company Code",
            width: 160,
        },
        {
            id: "officialemail",
            field: "officialemail",
            headerName: "Official Email",
            width: 180,
        },
        {
            id: "phonen0",
            field: "phonen0",
            headerName: "PhoneNo.",
            width: 160,
        },
        {
            id: "altphoneno",
            field: "altphoneno",
            headerName: "Alt PhoneNo.",
            width: 160,
        },
        {
            id: "addressLine1",
            field: "addressLine1",
            headerName: "AddressLine1",
            width: 220,
        },
        {
            id: "addressLine2",
            field: "addressLine2",
            headerName: "AddressLine2",
            width: 220,
        },
        {
            id: "countryName",
            field: "countryName",
            headerName: "Country",
            width: 120,
        },
        {
            id: "stateName",
            field: "stateName",
            headerName: "State",
            width: 120,
        },
        {
            id: "cityName",
            field: "cityName",
            headerName: "City",
            width: 120,
        },
        {
            id: "postalCode",
            field: "postalCode",
            headerName: "PostalCode",
            width: 120,
        }, {
            id: "action",
            field: "action",
            headerName: "Action",
            width: 60,
            type: "actions",
            onClick: (data) => {
                handleDelete(data._id);
            }
        }
    ]

    return {
        contactInfoSchema,
        basicInfoSchema,
        addressSchema,
        branchListingColDef
    };
}

export default useBranchConfig