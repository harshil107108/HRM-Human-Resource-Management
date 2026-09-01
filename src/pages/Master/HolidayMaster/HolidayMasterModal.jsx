import { HpCommonModal } from "@/hp-common-modal";
import { CalendarDays } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import useHolidayMasterConfig from "./useHolidayMasterConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import Toggle from "@hooks/Toogle";
import { formatDateForInput } from "@/utils/dateUtils";

const HolidayMasterModal = ({
    onModalClose,
    onSaved,
    open,
    extraParams,
}) => {
    const { holidaySchema, initialValue } = useHolidayMasterConfig();

    const { apiCall } = useApiCall();

    const holidayId = extraParams?.id;
    const mode = extraParams?.mode;

    const [recurringEveryYear, setRecurringEveryYear] = useState(true);
    const [optionalHoliday, setOptionalHoliday] = useState(false);
    const [paidHoliday, setPaidHoliday] = useState(true);

    const formmethod = useMemo(() => {
        return formMethod.createForm({
            schema: [...holidaySchema],
            initialValue,
        });
    }, []);

    const handleSave = async () => {
        const result = await formmethod.methods.handleFormSave(
            async (data) => {

                const payload = {
                    ...data,
                    recurringEveryYear,
                    optionalHoliday,
                    paidHoliday,
                    ...(holidayId && { _id: holidayId }),
                };

                const res = await apiCall({
                    id: "addEditHoliday",
                    api: api + apiEndpoints.master.holiday.HolidayAddEdit,
                    payload,
                    showSuccessAlert: true,
                });

                if (!res?.success) {
                    throw new Error(res?.message || 'Failed to save City');
                }

                return res;
            },
            {
                successMessage: 'City saved successfully',
                onSuccess: async () => {
                    onModalClose();
                    await onSaved?.();
                },
            },
        );

        return result;
    };

    const getDataById = async () => {
        const res = await apiCall({
            id: "getHolidayById",
            api: api + apiEndpoints.master.holiday.HolidayGetByID,
            payload: {
                _id: holidayId,
            },
        });

        if (res.success) {
            const data = res.data.data;

            const formattedData = {
                ...data,
                holidayDate: formatDateForInput(data.holidayDate),
            };

            formmethod.methods.setValues(formattedData);

            setRecurringEveryYear(data.recurringEveryYear ?? true);
            setOptionalHoliday(data.optionalHoliday ?? false);
            setPaidHoliday(data.paidHoliday ?? true);
        }
    };

    useEffect(() => {
        if (open && mode === "edit" && holidayId) {
            getDataById();
        }
    }, [open, mode, holidayId]);


    const handleClear = () => {
        formmethod.methods.reset();
        setRecurringEveryYear(true);
        setOptionalHoliday(false);
        setPaidHoliday(true);
    };

    return (
        <HpCommonModal
            open={open}
            title="Holiday"
            size="md"
            icon={<CalendarDays size={20} />}
            onSave={handleSave}
            onClose={onModalClose}
            onClear={handleClear}
            showClearButton
            confirmBeforeClose
        >
            <FormRenderer
                formMethod={formmethod}
                formSchema={holidaySchema}
            />

            <div className="mt-5 space-y-3">
                <Toggle
                    title="Recurring Every Year"
                    description="Automatically create this holiday every year on the same date."
                    value={recurringEveryYear}
                    onChange={setRecurringEveryYear}
                />

                <Toggle
                    title="Optional Holiday"
                    description="Employees can choose whether to take this holiday."
                    value={optionalHoliday}
                    onChange={setOptionalHoliday}
                />

                <Toggle
                    title="Paid Holiday"
                    description="Employees will receive regular pay for this holiday."
                    value={paidHoliday}
                    onChange={setPaidHoliday}
                />
            </div>
        </HpCommonModal>
    );
};

export default HolidayMasterModal;
