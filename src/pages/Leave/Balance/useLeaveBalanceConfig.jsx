import { useMemo } from "react";

export const useLeaveBalanceConfig = ({ handleDelete, isAdmin = true } = {}) => {
  const leaveBalanceListingColDef = useMemo(() => {
    const cols = [];
    if (isAdmin) {
      cols.push({
        id: "employeeName",
        field: "employeeName",
        headerName: "Employee",
        width: 220,
      });
    }
    cols.push(
      {
        id: "leaveTypeName",
        field: "leaveTypeName",
        headerName: "Leave Type",
        width: 170,
      },
      {
        id: "year",
        field: "year",
        headerName: "Year",
        width: 100,
        type: "number",
      },
      {
        id: "credited",
        field: "credited",
        headerName: "Credited (Days)",
        width: 130,
        type: "number",
      },
      {
        id: "used",
        field: "used",
        headerName: "Used (Days)",
        width: 120,
        type: "number",
      },
      {
        id: "pending",
        field: "pending",
        headerName: "Pending (Days)",
        width: 130,
        type: "number",
      },
      {
        id: "remaining",
        field: "remaining",
        headerName: "Remaining (Days)",
        width: 180,
        type: "number",
        render: (value) => {
          const num = Number(value) || 0;
          if (num <= 0) {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                0 (Over / Exhausted)
              </span>
            );
          }
          if (num === 1) {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                1 Day Left
              </span>
            );
          }
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {num} Days Available
            </span>
          );
        },
      }
    );
    if (isAdmin && handleDelete) {
      cols.push({
        id: "action",
        field: "action",
        headerName: "Action",
        width: 80,
        type: "actions",
        onClick: (data) => {
          handleDelete?.(data._id);
        },
      });
    }
    return cols;
  }, [isAdmin, handleDelete]);

  const initialValue = useMemo(
    () => ({
      employeeId: "",
      leaveTypeId: "",
      year: new Date().getFullYear(),
      openingBalance: 0,
      credited: 12,
      used: 0,
      pending: 0,
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
      pending: {
        type: "number",
        label: "Pending Days",
        placeholder: "0",
        className: "col-span-3",
      },
      remaining: {
        type: "number",
        label: "Remaining Balance",
        placeholder: "12",
        className: "col-span-3",
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
