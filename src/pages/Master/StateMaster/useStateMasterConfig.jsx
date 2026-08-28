import { api, apiEndpoints } from "@/api/api";
import React from "react";

const useStateMasterConfig = () => {
    const stateListingColDef = [

        {
            id: "countryName",
            field: "countryName",
            headerName: "Country",
            width: 180,
        },
        {
            id: "stateCode",
            field: "stateCode",
            headerName: "State Code",
            width: 130,
        },
        {
            id: "stateName",
            field: "stateName",
            headerName: "State Name",
            width: 220,
        },
        {
            id: "gstStateCode",
            field: "gstStateCode",
            headerName: "GST State Code",
            width: 150,
        },
        {
            id: "capital",
            field: "capital",
            headerName: "Capital",
            width: 180,
        },
    ];

    const stateSchema = [
        {
            id: "countryId",
            type: "selectWrapper",
            label: "Country",
            placeHolder: "Select Country",
            required: true,
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
        },
        {
            id: "capital",
            type: "text",
            label: "Capital",
            placeHolder: "Enter Capital",
            required: false,
            prevFocusField: "gstStateCode",
            nextFocusField: "isActive",
            className: "col-span-6",
        },
    ];



    return {
        stateListingColDef,
        stateSchema,
    };
};

export default useStateMasterConfig;