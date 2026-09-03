
const useCountyMasterConfig = ({ handleDelete } = {}) => {

    const countryListingListingColDef = [
        {
            id: "countryName",
            field: "countryName",
            headerName: "Country Name",
            width: 180,
        },
        {
            id: "countryCode",
            field: "countryCode",
            headerName: "Country Code",
            width: 130,
        },
        {
            id: "isoCode",
            field: "isoCode",
            headerName: "ISO Code",
            width: 120,
        },
        {
            id: "phoneCode",
            field: "phoneCode",
            headerName: "Phone Code",
            width: 120,
        },
        {
            id: "nationality",
            field: "nationality",
            headerName: "Nationality",
            width: 160,
        },

        {
            id: "action",
            field: "action",
            headerName: "Action",
            width: 80,
            type: "actions",
            onClick: (data) => {
                handleDelete(data._id);
            }
        }
    ];

    const countrySchema = [
        {
            id: "countryName",
            type: "text",
            label: "Country Name",
            placeHolder: "Enter country name",
            required: true,
            prevFocusField: "countryName",
            nextFocusField: "countryCode",
            className: "col-span-6",
        },
        {
            id: "countryCode",
            type: "text",
            label: "Country Code",
            placeHolder: "IN",
            required: true,
            prevFocusField: "countryName",
            nextFocusField: "isoCode",
            className: "col-span-6",
            maxLength: 2,
            textTransform: "uppercase",
        },
        {
            id: "isoCode",
            type: "text",
            label: "ISO Code",
            placeHolder: "IND",
            required: true,
            prevFocusField: "countryCode",
            nextFocusField: "phoneCode",
            className: "col-span-6",
            maxLength: 3,
            textTransform: "uppercase",
        },
        {
            id: "phoneCode",
            type: "number",
            label: "Phone Code",
            placeHolder: "+91",
            required: false,
            prevFocusField: "isoCode",
            nextFocusField: "nationality",
            minLength: 2,
            maxLength: 2,
            className: "col-span-6",
        },
        {
            id: "nationality",
            type: "text",
            label: "Nationality",
            placeHolder: "Indian",
            required: false,
            prevFocusField: "phoneCode",
            nextFocusField: "nationality",
            className: "col-span-6",
        },
    ];

    return { countryListingListingColDef, countrySchema };
}

export default useCountyMasterConfig