import { HpCommonModal } from "@/hp-common-modal";
import { CalendarDays } from "lucide-react";
import React, { useState } from "react";
import useHolidayMasterConfig from "./useHolidayMasterConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import Toggle from "@hooks/Toogle"; // Update the path

const HolidayMasterModal = ({ mode, onModalClose, open, extraParams }) => {
    const { holidaySchema, initialValue } = useHolidayMasterConfig();

    const formmethod = formMethod.createForm({
        schema: [...holidaySchema],
        initialValue,
    });

    const [recurringEveryYear, setRecurringEveryYear] = useState(true);
    const [optionalHoliday, setOptionalHoliday] = useState(false);
    const [paidHoliday, setPaidHoliday] = useState(true);

    const handleSave = () => {
        const data = {
            ...formmethod.getValues(),
            recurringEveryYear,
            optionalHoliday,
            paidHoliday,
        };

        console.log(data);
    };

    return (
        <HpCommonModal
            open={open}
            title="Holiday"
            size="md"
            icon={<CalendarDays size={20} />}
            onSave={handleSave}
            onClose={onModalClose}
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