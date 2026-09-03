import { api, apiEndpoints } from "@/api/api";
import React from "react";

const useStateMasterConfig = ({ handleDelete } = {}) => {
    const stateListingColDef = [
        {
            id: "stateName",
            field: "stateName",
            headerName: "State Name",
            width: 120,
        },
        {
            id: "stateCode",
            field: "stateCode",
            headerName: "State Code",
            width: 100,
        },

        {
            id: "countryName",
            field: "countryName",
            headerName: "Country",
            width: 100,
        },
        {
            id: "gstStateCode",
            field: "gstStateCode",
            headerName: "GST StateCode",
            width: 120,
        },
        {
            id: "capital",
            field: "capital",
            headerName: "Capital",
            width: 120,
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

    const stateSchema = [
        {
            id: "countryId",
            type: "selectWrapper",
            label: "Country",
            placeHolder: "Select Country",
            required: true,
            prevFocusField: "countryId",
            nextFocusField: "stateCode",
            className: "col-span-6",
            api: api + apiEndpoints.master.country.CountryHelp,
            labelKey: "countryName",
            valueKey: "_id",

        },
        {
            id: "stateCode",
            type: "text",
            label: "State Code",
            placeHolder: "GJ",
            required: true,
            prevFocusField: "countryId",
            nextFocusField: "stateName",
            className: "col-span-6",
            maxLength: 3,
            textTransform: "uppercase",
        },
        {
            id: "stateName",
            type: "text",
            label: "State Name",
            placeHolder: "Enter State Name",
            required: true,
            prevFocusField: "stateCode",
            nextFocusField: "gstStateCode",
            className: "col-span-6",
        },
        {
            id: "gstStateCode",
            type: "number",
            label: "GST State Code",
            placeHolder: "24",
            required: true,
            prevFocusField: "stateName",
            nextFocusField: "capital",
            className: "col-span-6",
            minLength: 2,
            maxLength: 2,
        },
        {
            id: "capital",
            type: "text",
            label: "Capital",
            placeHolder: "Enter Capital",
            required: false,
            prevFocusField: "gstStateCode",
            nextFocusField: "capital",
            className: "col-span-6",
        },
    ];



    return {
        stateListingColDef,
        stateSchema,
    };
};

export default useStateMasterConfig;