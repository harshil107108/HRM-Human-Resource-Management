import { formatDateForInput } from "@/utils/dateUtils";
import { Download, Eye } from "lucide-react";

const usePayslipConfig = ({ handleDelete, handleDownload, handleView, isPrivileged = true } = {}) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const payslipListingColDef = [
    {
      id: "payslipNumber",
      field: "payslipNumber",
      headerName: "Payslip",
      width: 170,
    },
    {
      id: "employeeName",
      field: "employeeName",
      headerName: "Employee",
      width: 220,
    },
    {
      id: "period",
      field: "period",
      headerName: "Period",
      width: 110,
    },
    {
      id: "grossEarnings",
      field: "grossEarnings",
      headerName: "Gross (₹)",
      width: 130,
      render: (val) => {
        const num = Number(val || 0);
        return (
          <span style={{ color: "#0f172a", fontWeight: 600, fontSize: "13px" }}>
            ₹{num.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      id: "totalDeductions",
      field: "totalDeductions",
      headerName: "Deductions (₹)",
      width: 130,
      render: (val) => {
        const num = Number(val || 0);
        return (
          <span style={{ color: "#0f172a", fontWeight: 600, fontSize: "13px" }}>
            ₹{num.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      id: "leaveDeduction",
      field: "leaveDeduction",
      headerName: "Leave Ded. (₹)",
      width: 130,
      render: (val) => {
        const num = Number(val || 0);
        return (
          <span style={{ color: num > 0 ? "#b91c1c" : "#64748b", fontWeight: 600, fontSize: "13px" }}>
            ₹{num.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      id: "netPay",
      field: "netPay",
      headerName: "Net Pay (₹)",
      width: 140,
      render: (val, row) => {
        const v = row?.netSalary != null ? row.netSalary : (row?.netPay != null ? row.netPay : val);
        const num = Number(v || 0);
        return (
          <span style={{ color: "#0f172a", fontWeight: 800, fontSize: "13px" }}>
            ₹{num.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      id: "status",
      field: "status",
      headerName: "Status",
      width: 110,
      render: (val, row) => {
        const statusVal = row?.status || row?.paymentStatus || val || "Paid";
        const isPaid = String(statusVal).toLowerCase() === "paid";
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "2px 10px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: isPaid ? "#ecfdf5" : "#fffbeb",
              color: isPaid ? "#047857" : "#b45309",
              border: `1px solid ${isPaid ? "#a7f3d0" : "#fde68a"}`,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "9999px",
                backgroundColor: isPaid ? "#10b981" : "#f59e0b",
              }}
            />
            {statusVal}
          </span>
        );
      },
    },
    {
      id: "action",
      field: "action",
      headerName: "Action",
      width: isPrivileged ? 110 : 80,
      type: "actions",
      stickpos: "last",
      actions: [
        {
          label: "Download Payslip",
          type: "download",
          icon: <Download size={15} style={{ color: "#2563eb" }} />,
          onClick: (row) => handleDownload?.(row),
        },
        ...(!isPrivileged
          ? [
            {
              label: "View Payslip",
              type: "view",
              icon: <Eye size={15} style={{ color: "#059669" }} />,
              onClick: (row) => handleView?.(row),
            },
          ]
          : []),
      ],
      ...(isPrivileged
        ? {
          onClick: (data) => {
            handleDelete?.(data._id);
          },
        }
        : {}),
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
      id: "paymentStatus",
      type: "selectWrapper",
      label: "Payment Status",
      options: [
        { label: "Paid", value: "Paid" },
        { label: "Unpaid", value: "Unpaid" },
        { label: "On Hold", value: "On Hold" },
      ],
      className: "col-span-3",
    },
    {
      id: "paymentMode",
      type: "selectWrapper",
      label: "Payment Mode",
      options: [
        { label: "Bank Transfer", value: "Bank Transfer" },
        { label: "Cheque", value: "Cheque" },
        { label: "Cash", value: "Cash" },
        { label: "UPI", value: "UPI" },
      ],
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
      id: "conveyance",
      type: "number",
      label: "Conveyance (₹)",
      placeHolder: "2000",
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
      id: "otherAllowances",
      type: "number",
      label: "Other Allowances (₹)",
      placeHolder: "0",
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
      id: "epf",
      type: "number",
      label: "Provident Fund / EPF (₹)",
      placeHolder: "1800",
      className: "col-span-3",
    },
    {
      id: "professionalTax",
      type: "number",
      label: "Professional Tax (₹)",
      placeHolder: "200",
      className: "col-span-3",
    },
    {
      id: "tds",
      type: "number",
      label: "TDS / Income Tax (₹)",
      placeHolder: "1500",
      className: "col-span-3",
    },
    {
      id: "esi",
      type: "number",
      label: "ESI (₹)",
      placeHolder: "0",
      className: "col-span-3",
    },
    {
      id: "leaveDeduction",
      type: "number",
      label: "Deduction of Leave (₹)",
      disabled: true,
      placeHolder: "0",
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
      id: "paymentDate",
      type: "date",
      label: "Disbursement Date",
      className: "col-span-6",
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
    otherAllowances: 0,
    grossEarnings: 55000,
    epf: 1800,
    esi: 0,
    professionalTax: 200,
    tds: 1500,
    leaveDeduction: 0,
    unpaidLeaveDays: 0,
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
