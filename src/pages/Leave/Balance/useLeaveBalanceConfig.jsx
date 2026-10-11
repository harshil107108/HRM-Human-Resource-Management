import { useMemo } from "react";

export const useLeaveBalanceConfig = ({ handleDelete } = {}) => {
  const leaveBalanceListingColDef = [
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
      width: 180,
    },
    {
      id: "year",
      field: "year",
      headerName: "Year",
      width: 110,
      type: "number",
    },
    {
      id: "credited",
      field: "credited",
      headerName: "Credited (Days)",
      width: 140,
      type: "number",
    },
    {
      id: "used",
      field: "used",
      headerName: "Used (Days)",
      width: 130,
      type: "number",
    },
    {
      id: "remaining",
      field: "remaining",
      headerName: "Remaining (Days)",
      width: 150,
      type: "number",
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

  const initialValue = useMemo(
    () => ({
      employeeId: "",
      leaveTypeId: "",
      year: new Date().getFullYear(),
      openingBalance: 0,
      credited: 12,
      used: 0,
      remaining: 12,
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
      year: {
        type: "number",
        label: "Year",
        required: true,
        placeholder: "2026",
        className: "col-span-3",
      },
      openingBalance: {
        type: "number",
        label: "Opening Balance",
        placeholder: "0",
        className: "col-span-3",
      },
      credited: {
        type: "number",
        label: "Credited / Accrued",
        placeholder: "12",
        className: "col-span-3",
      },
      used: {
        type: "number",
        label: "Used / Taken",
        placeholder: "0",
        className: "col-span-3",
      },
      remaining: {
        type: "number",
        label: "Remaining Balance",
        placeholder: "12",
        className: "col-span-6",
      },
    }),
    [],
  );

  return {
    leaveBalanceListingColDef,
    initialValue,
    schema,
    leaveBalanceSchema: schema,
  };
};

export default useLeaveBalanceConfig;
