import React from "react";

const useCityMasterConfig = ({ handleDelete } = {}) => {
    const bankListingColDef = [
        {
            id: "bankName",
            field: "bankName",
            headerName: "Bank Name",
            width: 120,
        },
        {
            id: "shortName",
            field: "shortName",
            headerName: "Short Name",
            width: 100,
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

    const initialValue = {
        bankName: "",
        shortName: "",
    };


    const bankSchema = [
        {
            id: "bankName",
            type: "text",
            label: "Bank Name",
            placeHolder: "Enter Bank Name",
            required: true,
            prevFocusField: "bankName",
            nextFocusField: "shortName",
            className: "col-span-12",
            textTransform: "uppercase",
        },
        {
            id: "shortName",
            type: "text",
            label: "Short Name",
            placeHolder: "Enter Short Name",
            required: true,
            prevFocusField: "bankName",
            nextFocusField: "shortName",
            className: "col-span-12",
        },
    ];

    return {
        bankListingColDef,
        bankSchema,
        initialValue
    };
};

export default useCityMasterConfig;