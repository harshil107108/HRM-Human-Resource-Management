import React from "react";

const useCityMasterConfig = () => {
    const cityListingColDef = [
        {
            id: "cityId",
            field: "cityId",
            headerName: "Id",
            width: 80,
        },
        {
            id: "countryName",
            field: "countryName",
            headerName: "Country",
            width: 180,
        },
        {
            id: "stateName",
            field: "stateName",
            headerName: "State",
            width: 180,
        },
        {
            id: "cityCode",
            field: "cityCode",
            headerName: "City Code",
            width: 130,
        },
        {
            id: "cityName",
            field: "cityName",
            headerName: "City Name",
            width: 220,
        },
        {
            id: "postalPrefix",
            field: "postalPrefix",
            headerName: "Postal Prefix",
            width: 140,
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
        },
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
            options: [
                { label: "India", value: 1 },
                { label: "United States", value: 2 },
                { label: "Canada", value: 3 },
            ],
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
            options: [
                { label: "Gujarat", value: 1 },
                { label: "Maharashtra", value: 2 },
                { label: "Rajasthan", value: 3 },
            ],
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
            label: "Postal Prefix",
            placeHolder: "380",
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