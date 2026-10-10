import { formatDateForInput } from "@/utils/dateUtils";

const usePayslipConfig = ({ handleDelete } = {}) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const payslipListingColDef = [
    {
      id: "payslipNumber",
      field: "payslipNumber",
      headerName: "Payslip #",
      width: 170,
    },
    {
      id: "employeeName",
      field: "employeeName",
      headerName: "Employee",
      width: 190,
    },
    {
      id: "period",
      field: "period",
      headerName: "Period",
      width: 130,
    },
    {
      id: "grossEarnings",
      field: "grossEarnings",
      headerName: "Gross (₹)",
      width: 130,
      type: "number",
    },
    {
      id: "totalDeductions",
      field: "totalDeductions",
      headerName: "Deductions (₹)",
      width: 130,
      type: "number",
    },
    {
      id: "netPay",
      field: "netPay",
      headerName: "Net Pay (₹)",
      width: 130,
      type: "number",
    },
    {
      id: "paymentStatus",
      field: "paymentStatus",
      headerName: "Status",
      width: 110,
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

  const payslipSchema = [
    {
      id: "payslipNumber",
      type: "text",
      label: "Payslip Number",
      required: true,
      className: "col-span-6",
    },
    {
      id: "employeeId",
      type: "selectWrapper",
      label: "Employee",
      required: true,
      placeHolder: "Select Employee",
      options: [],
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
      id: "basicSalary",
      type: "number",
      label: "Basic Salary (₹)",
      placeHolder: "35000",
      className: "col-span-3",
    },
    {
      id: "hra",
      type: "number",
      label: "HRA (₹)",
      placeHolder: "14000",
      className: "col-span-3",
    },
    {
      id: "specialAllowance",
      type: "number",
      label: "Special Allowance (₹)",
      placeHolder: "4000",
      className: "col-span-3",
    },
    {
      id: "grossEarnings",
      type: "number",
      label: "Gross Earnings (₹)",
      placeHolder: "55000",
      className: "col-span-3",
    },
    {
      id: "totalDeductions",
      type: "number",
      label: "Total Deductions (₹)",
      placeHolder: "3500",
      className: "col-span-3",
    },
    {
      id: "netPay",
      type: "number",
      label: "Net Pay (₹)",
      placeHolder: "51500",
      className: "col-span-3",
    },
    {
      id: "paymentStatus",
      type: "selectWrapper",
      label: "Payment Status",
      options: [
        { label: "Paid", value: "Paid" },
        { label: "Unpaid", value: "Unpaid" },
        { label: "On Hold", value: "On Hold" },
      ],
      className: "col-span-4",
    },
    {
      id: "paymentMode",
      type: "selectWrapper",
      label: "Payment Mode",
      options: [
        { label: "Bank Transfer", value: "Bank Transfer" },
        { label: "Cheque", value: "Cheque" },
        { label: "Cash", value: "Cash" },
      ],
      className: "col-span-4",
    },
    {
      id: "paymentDate",
      type: "date",
      label: "Disbursement Date",
      className: "col-span-4",
    },
  ];

  const initialValue = {
    payslipNumber: `PAY-${currentYear}-${currentMonth}-${Math.floor(1000 + Math.random() * 9000)}`,
    employeeId: "",
    month: currentMonth,
    year: currentYear,
    basicSalary: 35000,
    hra: 14000,
    conveyance: 2000,
    specialAllowance: 4000,
    grossEarnings: 55000,
    epf: 1800,
    esi: 0,
    professionalTax: 200,
    tds: 1500,
    totalDeductions: 3500,
    netPay: 51500,
    paymentStatus: "Paid",
    paymentMode: "Bank Transfer",
    paymentDate: formatDateForInput(new Date()),
  };

  return {
    payslipListingColDef,
    payslipSchema,
    initialValue,
    schema: payslipSchema,
  };
};

export { usePayslipConfig };
export default usePayslipConfig;
