const usePayrollProcessConfig = ({ handleDelete } = {}) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const payrollProcessListingColDef = [
    {
      id: "batchName",
      field: "batchName",
      headerName: "Batch Name",
      width: 220,
    },
    {
      id: "period",
      field: "period",
      headerName: "Period",
      width: 130,
    },
    {
      id: "totalEmployees",
      field: "totalEmployees",
      headerName: "Employees",
      width: 120,
      type: "number",
    },
    {
      id: "totalGrossPay",
      field: "totalGrossPay",
      headerName: "Gross Disbursed (₹)",
      width: 160,
      type: "number",
    },
    {
      id: "totalNetPay",
      field: "totalNetPay",
      headerName: "Net Disbursed (₹)",
      width: 160,
      type: "number",
    },
    {
      id: "status",
      field: "status",
      headerName: "Status",
      width: 130,
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

  const payrollProcessSchema = [
    {
      id: "batchName",
      type: "text",
      label: "Batch Name",
      required: true,
      placeHolder: "e.g. October 2026 Monthly Payroll",
      className: "col-span-6",
    },
    {
      id: "status",
      type: "selectWrapper",
      label: "Processing Status",
      options: [
        { label: "Draft", value: "Draft" },
        { label: "Processing", value: "Processing" },
        { label: "Completed", value: "Completed" },
        { label: "Approved", value: "Approved" },
        { label: "Disbursed", value: "Disbursed" },
      ],
      className: "col-span-6",
    },
    {
      id: "month",
      type: "selectWrapper",
      label: "Month",
      required: true,
      options: [
        { label: "January (1)", value: 1 },
        { label: "February (2)", value: 2 },
        { label: "March (3)", value: 3 },
        { label: "April (4)", value: 4 },
        { label: "May (5)", value: 5 },
        { label: "June (6)", value: 6 },
        { label: "July (7)", value: 7 },
        { label: "August (8)", value: 8 },
        { label: "September (9)", value: 9 },
        { label: "October (10)", value: 10 },
        { label: "November (11)", value: 11 },
        { label: "December (12)", value: 12 },
      ],
      className: "col-span-3",
    },
    {
      id: "year",
      type: "number",
      label: "Year",
      required: true,
      placeHolder: "2026",
      className: "col-span-3",
    },
    {
      id: "totalEmployees",
      type: "number",
      label: "Total Employees Covered",
      placeHolder: "25",
      className: "col-span-6",
    },
    {
      id: "totalGrossPay",
      type: "number",
      label: "Total Gross Pay (₹)",
      placeHolder: "1250000",
      className: "col-span-4",
    },
    {
      id: "totalDeductions",
      type: "number",
      label: "Total Deductions (₹)",
      placeHolder: "120000",
      className: "col-span-4",
    },
    {
      id: "totalNetPay",
      type: "number",
      label: "Total Net Disbursed (₹)",
      placeHolder: "1130000",
      className: "col-span-4",
    },
  ];

  const initialValue = {
    batchName: `Payroll - ${currentMonth}/${currentYear}`,
    month: currentMonth,
    year: currentYear,
    totalEmployees: 25,
    totalGrossPay: 1250000,
    totalDeductions: 120000,
    totalNetPay: 1130000,
    status: "Draft",
  };

  return {
    payrollProcessListingColDef,
    payrollProcessSchema,
    initialValue,
    schema: payrollProcessSchema,
  };
};

export { usePayrollProcessConfig };
export default usePayrollProcessConfig;
