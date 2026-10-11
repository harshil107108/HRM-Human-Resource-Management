import { useMemo } from "react";

export const useShiftConfig = ({ handleDelete } = {}) => {
    const shiftListingColDef = [
        {
            id: "shiftName",
            field: "shiftName",
            headerName: "Shift Name",
            width: 220,
        },
        {
            id: "shiftCode",
            field: "shiftCode",
            headerName: "Code",
            width: 140,
        },
        {
            id: "startTime",
            field: "startTime",
            headerName: "Start Time",
            width: 130,
        },
        {
            id: "endTime",
            field: "endTime",
            headerName: "End Time",
            width: 130,
        },
        {
            id: "breakDuration",
            field: "breakDuration",
            headerName: "Break (mins)",
            width: 140,
            type: "number",
        },
        {
            id: "graceTime",
            field: "graceTime",
            headerName: "Grace (mins)",
            width: 130,
            type: "number",
        },
        {
            id: "isNightShiftText",
            field: "isNightShiftText",
            headerName: "Night Shift",
            width: 130,
        },
        {
            type: "status",
            id: "isActive",
            field: "isActive",
            headerName: "Status",
            width: 120,
        },
        {
            id: "action",
            field: "action",
            headerName: "Action",
            width: 80,
            type: "actions",
            onClick: (data) => {
                handleDelete?.(data._id);
            },
        },
    ];

    const initialValue = useMemo(() => ({
        shiftName: "",
        shiftCode: "",
        startTime: "09:00",
        endTime: "18:00",
        breakDuration: 60,
        graceTime: 15,
        halfDayHours: 4,
        fullDayHours: 8,
        isNightShift: false,
        isActive: true,
        description: ""
    }), []);

    const schema = useMemo(() => [
        {
            id: "shiftName",
            type: "text",
            label: "Shift Name",
            required: true,
            placeholder: "e.g. General Day Shift",
            className: "col-span-6"
        },
        {
            id: "shiftCode",
            type: "text",
            label: "Shift Code",
            required: true,
            placeholder: "e.g. SHIFT-GEN",
            className: "col-span-6"
        },
        {
            id: "startTime",
            type: "text",
            label: "Start Time (HH:MM)",
            required: true,
            placeholder: "09:00",
            className: "col-span-3"
        },
        {
            id: "endTime",
            type: "text",
            label: "End Time (HH:MM)",
            required: true,
            placeholder: "18:00",
            className: "col-span-3"
        },
        {
            id: "breakDuration",
            type: "number",
            label: "Break Duration (Mins)",
            placeholder: "60",
            className: "col-span-3"
        },
        {
            id: "graceTime",
            type: "number",
            label: "Grace Time (Mins)",
            placeholder: "15",
            className: "col-span-3"
        },
        {
            id: "halfDayHours",
            type: "number",
            label: "Half Day Hours",
            placeholder: "4",
            className: "col-span-3"
        },
        {
            id: "fullDayHours",
            type: "number",
            label: "Full Day Hours",
            placeholder: "8",
            className: "col-span-3"
        },
        {
            id: "isNightShift",
            type: "checkbox",
            label: "Is Night Shift",
            className: "col-span-3"
        },
        {
            id: "isActive",
            type: "checkbox",
            label: "Is Active",
            className: "col-span-3"
        },
        {
            id: "description",
            type: "textarea",
            label: "Description",
            placeholder: "Shift policy notes...",
            className: "col-span-12"
        }
    ], []);

    return {
        shiftListingColDef,
        initialValue,
        schema,
        shiftSchema: schema,
    };
};

export default useShiftConfig;
