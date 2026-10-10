import { formatDateForInput } from "@/utils/dateUtils";

const useLoanConfig = ({ handleDelete } = {}) => {
  const loanListingColDef = [
    {
      id: "employeeName",
      field: "employeeName",
      headerName: "Employee",
      width: 200,
    },
    {
      id: "loanType",
      field: "loanType",
      headerName: "Loan Type",
      width: 160,
    },
    {
      id: "loanAmount",
      field: "loanAmount",
      headerName: "Principal (₹)",
      width: 140,
      type: "number",
    },
    {
      id: "tenureMonths",
      field: "tenureMonths",
      headerName: "Tenure (Mos)",
      width: 120,
      type: "number",
    },
    {
      id: "monthlyDeduction",
      field: "monthlyDeduction",
      headerName: "EMI (₹)",
      width: 130,
      type: "number",
    },
    {
      id: "remainingAmount",
      field: "remainingAmount",
      headerName: "Balance (₹)",
      width: 130,
      type: "number",
    },
    {
      id: "status",
      field: "status",
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

  const loanSchema = [
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
      id: "loanType",
      type: "selectWrapper",
      label: "Loan Type",
      required: true,
      options: [
        { label: "Salary Advance", value: "Salary Advance" },
        { label: "Personal Loan", value: "Personal Loan" },
        { label: "Emergency Assistance", value: "Emergency Assistance" },
        { label: "Home Loan", value: "Home Loan" },
      ],
      className: "col-span-6",
    },
    {
      id: "loanAmount",
      type: "number",
      label: "Principal Loan Amount (₹)",
      required: true,
      placeHolder: "50000",
      className: "col-span-3",
    },
    {
      id: "tenureMonths",
      type: "number",
      label: "Tenure (Months)",
      required: true,
      placeHolder: "10",
      className: "col-span-3",
    },
    {
      id: "monthlyDeduction",
      type: "number",
      label: "Monthly EMI Deduction (₹)",
      placeHolder: "5000",
      className: "col-span-3",
    },
    {
      id: "interestRate",
      type: "number",
      label: "Interest Rate (%)",
      placeHolder: "0",
      className: "col-span-3",
    },
    {
      id: "repaidAmount",
      type: "number",
      label: "Repaid Amount (₹)",
      placeHolder: "0",
      className: "col-span-3",
    },
    {
      id: "disbursementDate",
      type: "date",
      label: "Disbursement Date",
      className: "col-span-3",
    },
    {
      id: "status",
      type: "selectWrapper",
      label: "Loan Status",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "Approved", value: "Approved" },
        { label: "Active", value: "Active" },
        { label: "Closed", value: "Closed" },
        { label: "Rejected", value: "Rejected" },
      ],
      className: "col-span-6",
    },
    {
      id: "reason",
      type: "textarea",
      label: "Reason for Loan Request",
      placeHolder: "Emergency family expense, education, etc...",
      className: "col-span-12",
    },
  ];

  const initialValue = {
    employeeId: "",
    loanType: "Salary Advance",
    loanAmount: 50000,
    tenureMonths: 10,
    monthlyDeduction: 5000,
    interestRate: 0,
    repaidAmount: 0,
    remainingAmount: 50000,
    disbursementDate: formatDateForInput(new Date()),
    status: "Pending",
    reason: "",
  };

  return {
    loanListingColDef,
    loanSchema,
    initialValue,
    schema: loanSchema,
  };
};

export { useLoanConfig };
export default useLoanConfig;
