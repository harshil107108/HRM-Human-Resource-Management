import React from "react";

const useHolidayMasterConfig = ({ handleDelete } = {}) => {
    const holidayListingColDef = [
        {
            id: "holidayName",
            field: "holidayName",
            headerName: "Holiday Name",
            width: 150,
        },
        {
            id: "holidayCode",
            field: "holidayCode",
            headerName: "Holiday Code",
            width: 100,
        },
        {
            id: "holidayDate",
            field: "holidayDate",
            headerName: "Holiday Date",
            width: 120,
        },
        {
            id: "holidayType",
            field: "holidayType",
            headerName: "Holiday Type",
            width: 120,
        },
        {
            id: "action",
            field: "action",
            headerName: "Action",
            width: 60,
            type: "actions",
            onClick: (data) => {
                handleDelete(data._id);
            }
        }
    ];

    const holidaySchema = [
        {
            id: "holidayName",
            type: "text",
            label: "Holiday Name",
            placeHolder: "Enter Holiday Name",
            required: true,
            nextFocusField: "holidayCode",
            className: "col-span-6",
        },
        {
            id: "holidayCode",
            type: "text",
            label: "Holiday Code",
            placeHolder: "DIWALI",
            required: true,
            prevFocusField: "holidayName",
            nextFocusField: "holidayDate",
            className: "col-span-6",
            maxLength: 15,
            textTransform: "uppercase",
        },
        {
            id: "holidayDate",
            type: "date",
            label: "Holiday Date",
            placeHolder: "Select Holiday Date",
            required: true,
            prevFocusField: "holidayCode",
            nextFocusField: "holidayType",
            className: "col-span-6",
        },
        {
            id: "holidayType",
            type: "selectWrapper",
            label: "Holiday Type",
            placeHolder: "Select Holiday Type",
            required: true,
            prevFocusField: "holidayDate",
            nextFocusField: "holidayCalendar",
            className: "col-span-6",
            options: [
                {
                    label: "National Holiday",
                    value: "national",
                },
                {
                    label: "Regional Holiday",
                    value: "regional",
                },
                {
                    label: "Festival",
                    value: "festival",
                },
                {
                    label: "Company Holiday",
                    value: "company",
                },
                {
                    label: "Bank Holiday",
                    value: "bank",
                },
                {
                    label: "Optional Holiday",
                    value: "optional",
                },
            ],
        },

    ];

    const initialValue = {
        holidayName: "",
        holidayCode: "",
        holidayDate: "",
        holidayType: "",
        holidayCalendar: "",
        isActive: true,
    };



    return {
        holidayListingColDef,
        holidaySchema,
        initialValue,
    };
};

export default useHolidayMasterConfig;