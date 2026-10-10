const useTaxConfig = ({ handleDelete } = {}) => {
  const taxListingColDef = [
    {
      id: "employeeName",
      field: "employeeName",
      headerName: "Employee",
      width: 200,
    },
    {
      id: "financialYear",
      field: "financialYear",
      headerName: "FY",
      width: 120,
    },
    {
      id: "regime",
      field: "regime",
      headerName: "Tax Regime",
      width: 150,
    },
    {
      id: "taxableIncome",
      field: "taxableIncome",
      headerName: "Taxable Income (₹)",
      width: 160,
      type: "number",
    },
    {
      id: "annualTax",
      field: "annualTax",
      headerName: "Annual Tax (₹)",
      width: 140,
      type: "number",
    },
    {
      id: "monthlyTDS",
      field: "monthlyTDS",
      headerName: "Monthly TDS (₹)",
      width: 140,
      type: "number",
    },
    {
      id: "verificationStatus",
      field: "verificationStatus",
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

  const taxSchema = [
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
      id: "financialYear",
      type: "text",
      label: "Financial Year",
      required: true,
      placeHolder: "2026-2027",
      className: "col-span-6",
    },
    {
      id: "regime",
      type: "selectWrapper",
      label: "Tax Regime",
      required: true,
      options: [
        { label: "New Regime (Section 115BAC)", value: "New Regime" },
        { label: "Old Regime (With Exemptions)", value: "Old Regime" },
      ],
      className: "col-span-6",
    },
    {
      id: "verificationStatus",
      type: "selectWrapper",
      label: "Verification Status",
      options: [
        { label: "Draft", value: "Draft" },
        { label: "Submitted", value: "Submitted" },
        { label: "Verified", value: "Verified" },
        { label: "Rejected", value: "Rejected" },
      ],
      className: "col-span-6",
    },
    {
      id: "declared80C",
      type: "number",
      label: "Section 80C Investment (₹)",
      placeHolder: "150000",
      className: "col-span-4",
    },
    {
      id: "declared80D",
      type: "number",
      label: "Section 80D Health Insurance (₹)",
      placeHolder: "25000",
      className: "col-span-4",
    },
    {
      id: "declaredHRA",
      type: "number",
      label: "HRA Exemption Claim (₹)",
      placeHolder: "120000",
      className: "col-span-4",
    },
    {
      id: "taxableIncome",
      type: "number",
      label: "Estimated Taxable Income (₹)",
      placeHolder: "750000",
      className: "col-span-4",
    },
    {
      id: "annualTax",
      type: "number",
      label: "Estimated Annual Tax (₹)",
      placeHolder: "37500",
      className: "col-span-4",
    },
    {
      id: "monthlyTDS",
      type: "number",
      label: "Computed Monthly TDS (₹)",
      placeHolder: "3125",
      className: "col-span-4",
    },
    {
      id: "verifierNotes",
      type: "textarea",
      label: "Verifier Notes / Comments",
      placeHolder: "Proof documents status...",
      className: "col-span-12",
    },
  ];

  const initialValue = {
    financialYear: "2026-2027",
    regime: "New Regime",
    employeeId: "",
    declared80C: 150000,
    declared80D: 25000,
    declaredHRA: 120000,
    declaredOther: 0,
    totalExemptions: 295000,
    taxableIncome: 750000,
    annualTax: 37500,
    monthlyTDS: 3125,
    verificationStatus: "Draft",
    verifierNotes: "",
  };

  return {
    taxListingColDef,
    taxSchema,
    initialValue,
    schema: taxSchema,
  };
};

export { useTaxConfig };
export default useTaxConfig;
