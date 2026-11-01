import { useMemo, useCallback } from "react";
import { formatDateForInput } from "@/utils/dateUtils";
import { calculateLeaveWorkingDays } from "@/utils/leaveUtils";

export const useLeaveRequestConfig = ({ handleDelete, weekendPolicy = null, holidays = [] } = {}) => {
  const today = formatDateForInput(new Date());

  const getTotalDays = useCallback((startDate, endDate, isHalfDay) => {
    if (!startDate) return 0;
    const calc = calculateLeaveWorkingDays({
      startDate,
      endDate: isHalfDay ? startDate : (endDate || startDate),
      isHalfDay,
      weekendPolicy,
      holidays,
    });
    return calc.totalWorkingDays;
  }, [weekendPolicy, holidays]);

  const updateTotalDays = useCallback((form) => {
    const values = form.methods.getValues();
    form.methods.setValue(
      "days",
      getTotalDays(values.startDate, values.endDate, values.isHalfDay),
    );
  }, [getTotalDays]);

  const leaveRequestListingColDef = [
    {
      id: "employeeName",
      field: "employeeName",
      headerName: "Employee",
      width: 220,
    },
    {
      id: "leaveTypeName",
      field: "leaveTypeName",
      headerName: "Leave Type",
      width: 170,
    },
    {
      id: "startDate",
      field: "startDate",
      headerName: "Start Date",
      width: 130,
    },
    {
      id: "endDate",
      field: "endDate",
      headerName: "End Date",
      width: 130,
    },
    {
      id: "days",
      field: "days",
      headerName: "Days",
      width: 110,
      type: "number",
    },
    {
      id: "status",
      field: "status",
      headerName: "Status",
      width: 120,
      type: "custom",
      render: (status) => {
        const styles = {
          Pending: "border-amber-200 bg-amber-50 text-amber-700",
          Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
          Rejected: "border-rose-200 bg-rose-50 text-rose-700",
          Cancelled: "border-slate-200 bg-slate-50 text-slate-600",
        };
        const currentStatus = status || "Pending";
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
              styles[currentStatus] || styles.Cancelled
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {currentStatus}
          </span>
        );
      },
    },
    {
      id: "reason",
      field: "reason",
      headerName: "Reason",
      width: 260,
    },
    {
      id: "action",
      field: "action",
      headerName: "Action",
      width: 80,
      type: "actions",
      deleteDisabled: (row) => row.status !== "Pending",
      onClick: (data) => {
        handleDelete?.(data._id);
      },
    },
  ];

  const initialValue = useMemo(
    () => ({
      employeeId: "",
      leaveTypeId: "",
      startDate: formatDateForInput(new Date()),
      endDate: formatDateForInput(new Date()),
      days: 1,
      isHalfDay: false,
      reason: "",
    }),
    [],
  );

  const schema = useMemo(
    () => ({
      employeeId: {
        type: "selectWrapper",
        label: "Employee",
        required: true,
        placeholder: "Select Employee",
        options: [],
        className: "col-span-6",
      },
      leaveTypeId: {
        type: "selectWrapper",
        label: "Leave Type",
        required: true,
        placeholder: "Select Leave Type",
        options: [],
        className: "col-span-6",
      },
      startDate: {
        type: "date",
        label: "Start Date",
        required: true,
        min: today,
        validate: (value) =>
          value && value < today ? "Start date cannot be before today" : undefined,
        onChange: (form) => {
          const startDate = form.methods.getValue("startDate");
          const endDate = form.methods.getValue("endDate");
          const isHalfDay = Boolean(form.methods.getValue("isHalfDay"));
          form.methods.setFieldConfig("endDate", {
            min: startDate || today,
            disabled: isHalfDay,
          });
          if (
            !isHalfDay &&
            startDate &&
            (!endDate || endDate < startDate)
          ) {
            form.methods.setValue("endDate", startDate);
          }
          updateTotalDays(form);
        },
        className: "col-span-3",
      },
      endDate: {
        type: "date",
        label: "End Date",
        required: false,
        min: today,
        validate: (value, values) =>
          !values.isHalfDay && !value
            ? "End Date is required"
            : !values.isHalfDay && values.startDate && value < values.startDate
            ? "End date cannot be before the start date"
            : undefined,
        onChange: updateTotalDays,
        className: "col-span-3",
      },
      days: {
        type: "number",
        label: "Total Days",
        required: true,
        placeholder: "1",
        disabled: true,
        className: "col-span-3",
      },
      isHalfDay: {
        type: "checkbox",
        label: "Is Half Day",
        onChange: (form) => {
          const isHalfDay = Boolean(form.methods.getValue("isHalfDay"));
          const startDate = form.methods.getValue("startDate") || today;
          form.methods.setFieldConfig("endDate", {
            disabled: isHalfDay,
            min: startDate,
          });
          form.methods.setValue("endDate", isHalfDay ? "" : startDate);
          const count = getTotalDays(startDate, isHalfDay ? startDate : startDate, isHalfDay);
          form.methods.setValue("days", count);
        },
        className: "col-span-3",
      },
      reason: {
        type: "textarea",
        label: "Reason for Leave",
        required: true,
        placeholder: "Explain purpose of leave...",
        className: "col-span-12",
      },
    }),
    [getTotalDays, today, updateTotalDays],
  );

  return {
    leaveRequestListingColDef,
    initialValue,
    schema,
    leaveRequestSchema: schema,
  };
};

export default useLeaveRequestConfig;
