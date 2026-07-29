import React from "react";

const useHolidayMasterConfig = () => {
    const holidayListingColDef = [
        {
            id: "holidayId",
            field: "holidayId",
            headerName: "Id",
            width: 80,
        },
        {
            id: "holidayName",
            field: "holidayName",
            headerName: "Holiday Name",
            width: 220,
        },
        {
            id: "holidayCode",
            field: "holidayCode",
            headerName: "Holiday Code",
            width: 150,
        },
        {
            id: "holidayDate",
            field: "holidayDate",
            headerName: "Holiday Date",
            width: 150,
        },
        {
            id: "holidayType",
            field: "holidayType",
            headerName: "Holiday Type",
            width: 180,
        },
        {
            id: "holidayCalendar",
            field: "holidayCalendar",
            headerName: "Holiday Calendar",
            width: 220,
        },
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

    const holidayRowData = [
        {
            holidayId: 1,
            holidayName: "Republic Day",
            holidayCode: "REPUBLIC_DAY",
            holidayDate: "2026-01-26",
            holidayType: "National Holiday",
            holidayCalendar: "India Calendar",
            isActive: true,
        },
        {
            holidayId: 2,
            holidayName: "Holi",
            holidayCode: "HOLI",
            holidayDate: "2026-03-04",
            holidayType: "Festival",
            holidayCalendar: "India Calendar",
            isActive: true,
        },
        {
            holidayId: 3,
            holidayName: "Good Friday",
            holidayCode: "GOOD_FRIDAY",
            holidayDate: "2026-04-03",
            holidayType: "Regional Holiday",
            holidayCalendar: "Corporate Calendar",
            isActive: true,
        },
        {
            holidayId: 4,
            holidayName: "Labour Day",
            holidayCode: "LABOUR_DAY",
            holidayDate: "2026-05-01",
            holidayType: "National Holiday",
            holidayCalendar: "Corporate Calendar",
            isActive: true,
        },
        {
            holidayId: 5,
            holidayName: "Independence Day",
            holidayCode: "INDEPENDENCE_DAY",
            holidayDate: "2026-08-15",
            holidayType: "National Holiday",
            holidayCalendar: "India Calendar",
            isActive: true,
        },
        {
            holidayId: 6,
            holidayName: "Janmashtami",
            holidayCode: "JANMASHTAMI",
            holidayDate: "2026-09-05",
            holidayType: "Festival",
            holidayCalendar: "Factory Calendar",
            isActive: true,
        },
        {
            holidayId: 7,
            holidayName: "Gandhi Jayanti",
            holidayCode: "GANDHI_JAYANTI",
            holidayDate: "2026-10-02",
            holidayType: "National Holiday",
            holidayCalendar: "India Calendar",
            isActive: true,
        },
        {
            holidayId: 8,
            holidayName: "Diwali",
            holidayCode: "DIWALI",
            holidayDate: "2026-11-08",
            holidayType: "Festival",
            holidayCalendar: "Corporate + Factory",
            isActive: true,
        },
        {
            holidayId: 9,
            holidayName: "Christmas",
            holidayCode: "CHRISTMAS",
            holidayDate: "2026-12-25",
            holidayType: "Festival",
            holidayCalendar: "Corporate Calendar",
            isActive: true,
        },
        {
            holidayId: 10,
            holidayName: "Foundation Day",
            holidayCode: "FOUNDATION_DAY",
            holidayDate: "2026-07-15",
            holidayType: "Company Holiday",
            holidayCalendar: "Corporate Calendar",
            isActive: false,
        },
    ];

    return {
        holidayListingColDef,
        holidaySchema,
        holidayRowData,
        initialValue,
    };
};

export default useHolidayMasterConfig;