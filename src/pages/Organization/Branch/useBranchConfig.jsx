
const useBranchConfig = () => {
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
            options: [
                { label: "United States", value: "US" },
                { label: "India", value: "IN" },
                { label: "United Kingdom", value: "UK" },
                { label: "Canada", value: "CA" },
            ],
            required: true,
            prevFocusField: "addressLine2",
            nextFocusField: "state",
        },
        {
            id: "state",
            type: "text",
            label: "State / Province",
            placeHolder: "Enter state",
            required: true,
            prevFocusField: "country",
            nextFocusField: "city",
        },
        {
            id: "city",
            type: "text",
            label: "City",
            placeHolder: "City name",
            required: true,
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
            id: "branchid",
            field: "branchid",
            headerName: "Id",
            width: 60,
        },
        {
            id: "branchname",
            field: "branchname",
            headerName: "Branch Name",
            width: 220,
        },
        {
            id: "legalName",
            field: "legalName",
            headerName: "Legal Name",
            width: 220,
        },
        {
            id: "companyCode",
            field: "companyCode",
            headerName: "Company Code",
            width: 120,
        },
        {
            id: "businessEmail",
            field: "businessEmail",
            headerName: "Business Email",
            width: 220,
        },
        {
            id: "phone",
            field: "phone",
            headerName: "Phone",
            width: 160,
        },
        {
            id: "establishDate",
            field: "establishDate",
            headerName: "Establish Date",
            width: 140,
        },
        {
            id: "registrationNumber",
            field: "registrationNumber",
            headerName: "Registration Number",
            width: 220,
        },
        {
            id: "panNumber",
            field: "panNumber",
            headerName: "Pan Number",
            width: 150,
        },
        {
            id: "gstNumber",
            field: "gstNumber",
            headerName: "GST Number",
            width: 190,
        },
        {
            id: "companySize",
            field: "companySize",
            headerName: "Company Size",
            width: 120,
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
            id: "country",
            field: "country",
            headerName: "Country",
            width: 120,
        },
        {
            id: "state",
            field: "state",
            headerName: "State",
            width: 120,
        },
        {
            id: "city",
            field: "city",
            headerName: "City",
            width: 120,
        },
        {
            id: "postalCode",
            field: "postalCode",
            headerName: "PostalCode",
            width: 120,
        },
    ]

    return {
        contactInfoSchema,
        basicInfoSchema,
        addressSchema,
        branchListingColDef
    };
}

export default useBranchConfig