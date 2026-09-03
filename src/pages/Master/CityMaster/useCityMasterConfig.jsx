import React from "react";
import { api, apiEndpoints } from "@/api/api";

const useCityMasterConfig = ({ handleDelete } = {}) => {
    const cityListingColDef = [

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
            id: "cityCode",
            field: "cityCode",
            headerName: "City Code",
            width: 100,
        },
        {
            id: "cityName",
            field: "cityName",
            headerName: "City Name",
            width: 120,
        },
        {
            id: "postalPrefix",
            field: "postalPrefix",
            headerName: "Postal Code",
            width: 120,
        },
        {
            id: "latitude",
            field: "latitude",
            headerName: "Latitude",
            width: 140,
        },
        {
            id: "longitude",
            field: "longitude",
            headerName: "Longitude",
            width: 140,
        }, {
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

    const citySchema = [
        {
            id: "countryId",
            type: "selectWrapper",
            label: "Country",
            placeHolder: "Select Country",
            required: true,
            nextFocusField: "stateId",
            className: "col-span-6",
            api: api + apiEndpoints.master.country.CountryHelp,
            labelKey: "countryName",
            valueKey: "_id",

        },
        {
            id: "stateId",
            type: "selectWrapper",
            label: "State",
            placeHolder: "Select State",
            required: true,
            prevFocusField: "countryId",
            nextFocusField: "cityCode",
            className: "col-span-6",
            api: api + apiEndpoints.master.state.StateHelp,
            labelKey: "stateName",
            valueKey: "_id",

        },
        {
            id: "cityCode",
            type: "text",
            label: "City Code",
            placeHolder: "AMD",
            required: true,
            prevFocusField: "stateId",
            nextFocusField: "cityName",
            className: "col-span-6",
            maxLength: 5,
            textTransform: "uppercase",
        },
        {
            id: "cityName",
            type: "text",
            label: "City Name",
            placeHolder: "Enter City Name",
            required: true,
            prevFocusField: "cityCode",
            nextFocusField: "postalPrefix",
            className: "col-span-6",
        },
        {
            id: "postalPrefix",
            type: "text",
            label: "Postal Code",
            placeHolder: "383235",
            required: false,
            prevFocusField: "cityName",
            nextFocusField: "latitude",
            className: "col-span-6",
            maxLength: 6,
        },
        {
            id: "latitude",
            type: "number",
            label: "Latitude",
            placeHolder: "23.0225",
            required: false,
            prevFocusField: "postalPrefix",
            nextFocusField: "longitude",
            className: "col-span-6",
        },
        {
            id: "longitude",
            type: "number",
            label: "Longitude",
            placeHolder: "72.5714",
            required: false,
            prevFocusField: "latitude",
            nextFocusField: "isActive",
            className: "col-span-6",
        },
    ];

    const initialValue = {
        countryId: "",
        stateId: "",
        cityCode: "",
        cityName: "",
        postalPrefix: "",
        latitude: "",
        longitude: "",
        isActive: true,
    };

    return {
        cityListingColDef,
        citySchema,
        initialValue,
    };
};

export default useCityMasterConfig;