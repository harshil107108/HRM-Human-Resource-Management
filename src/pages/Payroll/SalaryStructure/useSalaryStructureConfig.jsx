const getSalaryTotals = (values = {}) => {
  const amount = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

  const grossSalary = roundCurrency(
    amount(values.basicSalary) +
      amount(values.hra) +
      amount(values.da) +
      amount(values.conveyance) +
      amount(values.specialAllowance),
  );
  const totalDeductions = roundCurrency(
    amount(values.providentFund) +
      amount(values.esi) +
      amount(values.professionalTax) +
      amount(values.otherDeductions),
  );

  return {
    grossSalary,
    totalDeductions,
    netSalary: roundCurrency(grossSalary - totalDeductions),
  };
};

const updateSalaryTotals = (form) => {
  form.methods.setValues(getSalaryTotals(form.methods.getValues()), {
    triggerHooks: false,
  });
};

const useSalaryStructureConfig = ({ handleDelete } = {}) => {
  const salaryStructureListingColDef = [
    {
      id: "structureName",
      field: "structureName",
      headerName: "Structure Name",
      width: 220,
    },
    {
      id: "basicSalary",
      field: "basicSalary",
      headerName: "Basic (₹)",
      width: 140,
      type: "number",
    },
    {
      id: "grossSalary",
      field: "grossSalary",
      headerName: "Gross Salary (₹)",
      width: 150,
      type: "number",
    },
    {
      id: "totalDeductions",
      field: "totalDeductions",
      headerName: "Deductions (₹)",
      width: 140,
      type: "number",
    },
    {
      id: "netSalary",
      field: "netSalary",
      headerName: "Net Salary (₹)",
      width: 150,
      type: "number",
    },
    {
      type: "status",
      id: "isActive",
      field: "isActive",
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

  const salaryStructureSchema = [
    {
      id: "structureName",
      type: "text",
      label: "Structure Name",
      required: true,
      placeHolder: "e.g. Senior Software Engineer Grade 1",
      className: "col-span-6",
    },
    {
      id: "isActive",
      type: "checkbox",
      label: "Is Active",
      className: "col-span-6",
    },
    {
      id: "basicSalary",
      type: "number",
      label: "Basic Salary (₹)",
      required: true,
      min: 0,
      minMessage: "Salary amounts cannot be negative.",
      precision: 2,
      onChange: updateSalaryTotals,
      className: "col-span-3",
    },
    {
      id: "hra",
      type: "number",
      label: "HRA (₹)",
      min: 0,
      minMessage: "Salary amounts cannot be negative.",
      precision: 2,
      onChange: updateSalaryTotals,
      className: "col-span-3",
    },
    {
      id: "da",
      type: "number",
      label: "Dearness Allowance (₹)",
      min: 0,
      minMessage: "Salary amounts cannot be negative.",
      precision: 2,
      onChange: updateSalaryTotals,
      className: "col-span-3",
    },
    {
      id: "conveyance",
      type: "number",
      label: "Conveyance Allowance (₹)",
      min: 0,
      minMessage: "Salary amounts cannot be negative.",
      precision: 2,
      onChange: updateSalaryTotals,
      className: "col-span-3",
    },
    {
      id: "specialAllowance",
      type: "number",
      label: "Special Allowance (₹)",
      min: 0,
      minMessage: "Salary amounts cannot be negative.",
      precision: 2,
      onChange: updateSalaryTotals,
      className: "col-span-3",
    },
    {
      id: "grossSalary",
      type: "number",
      label: "Gross Salary (₹)",
      min: 0,
      minMessage: "Gross salary cannot be negative.",
      precision: 2,
      readOnly: true,
      className: "col-span-3",
    },
    {
      id: "providentFund",
      type: "number",
      label: "Provident Fund (EPF) (₹)",
      min: 0,
      minMessage: "Deduction amounts cannot be negative.",
      precision: 2,
      onChange: updateSalaryTotals,
      className: "col-span-3",
    },
    {
      id: "esi",
      type: "number",
      label: "ESI (₹)",
      min: 0,
      minMessage: "Deduction amounts cannot be negative.",
      precision: 2,
      onChange: updateSalaryTotals,
      className: "col-span-3",
    },
    {
      id: "professionalTax",
      type: "number",
      label: "Professional Tax (₹)",
      min: 0,
      minMessage: "Deduction amounts cannot be negative.",
      precision: 2,
      onChange: updateSalaryTotals,
      className: "col-span-3",
    },
    {
      id: "otherDeductions",
      type: "number",
      label: "Other Deductions (₹)",
      min: 0,
      minMessage: "Deduction amounts cannot be negative.",
      precision: 2,
      onChange: updateSalaryTotals,
      className: "col-span-3",
    },
    {
      id: "totalDeductions",
      type: "number",
      label: "Total Deductions (₹)",
      min: 0,
      minMessage: "Deduction amounts cannot be negative.",
      precision: 2,
      readOnly: true,
      className: "col-span-4",
    },
    {
      id: "netSalary",
      type: "number",
      label: "Net Salary (₹)",
      min: 0,
      minMessage: "Total deductions cannot exceed gross salary.",
      precision: 2,
      readOnly: true,
      className: "col-span-4",
    },
    {
      id: "description",
      type: "textarea",
      label: "Description / Notes",
      placeHolder: "Band and grade criteria...",
      className: "col-span-12",
    },
  ];

  const initialValue = {
    structureName: "",
    basicSalary: "",
    hra: "",
    da: "",
    conveyance: "",
    specialAllowance: "",
    providentFund: "",
    esi: "",
    professionalTax: "",
    otherDeductions: "",
    ...getSalaryTotals(),
    isActive: true,
    description: "",
  };

  return {
    salaryStructureListingColDef,
    salaryStructureSchema,
    initialValue,
    schema: salaryStructureSchema,
  };
};

export { useSalaryStructureConfig };
export { getSalaryTotals };
export default useSalaryStructureConfig;
