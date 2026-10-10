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
      id: "status",
      type: "selectWrapper",
      label: "Status",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
      className: "col-span-6",
    },
    {
      id: "basicSalary",
      type: "number",
      label: "Basic Salary (₹)",
      required: true,
      placeHolder: "30000",
      className: "col-span-3",
    },
    {
      id: "hra",
      type: "number",
      label: "HRA (₹)",
      placeHolder: "12000",
      className: "col-span-3",
    },
    {
      id: "da",
      type: "number",
      label: "Dearness Allowance (₹)",
      placeHolder: "3000",
      className: "col-span-3",
    },
    {
      id: "conveyance",
      type: "number",
      label: "Conveyance Allowance (₹)",
      placeHolder: "2000",
      className: "col-span-3",
    },
    {
      id: "specialAllowance",
      type: "number",
      label: "Special Allowance (₹)",
      placeHolder: "5000",
      className: "col-span-3",
    },
    {
      id: "grossSalary",
      type: "number",
      label: "Gross Salary (₹)",
      placeHolder: "52000",
      className: "col-span-3",
    },
    {
      id: "epf",
      type: "number",
      label: "Provident Fund (EPF) (₹)",
      placeHolder: "1800",
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
      id: "professionalTax",
      type: "number",
      label: "Professional Tax (₹)",
      placeHolder: "200",
      className: "col-span-4",
    },
    {
      id: "totalDeductions",
      type: "number",
      label: "Total Deductions (₹)",
      placeHolder: "2000",
      className: "col-span-4",
    },
    {
      id: "netSalary",
      type: "number",
      label: "Net Salary (₹)",
      placeHolder: "50000",
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
    basicSalary: 30000,
    hra: 12000,
    da: 3000,
    conveyance: 2000,
    specialAllowance: 5000,
    epf: 1800,
    esi: 0,
    professionalTax: 200,
    grossSalary: 52000,
    totalDeductions: 2000,
    netSalary: 50000,
    status: "Active",
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
export default useSalaryStructureConfig;
