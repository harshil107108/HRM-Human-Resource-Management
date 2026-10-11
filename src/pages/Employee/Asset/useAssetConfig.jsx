import { api, apiEndpoints } from "@/api/api";

// Validator for an end date that must not fall before its start date.
// Dates are ISO "YYYY-MM-DD" strings, so string comparison is safe.
const notBeforeField = (startFieldId, message) => (value, allValues) => {
  const start = allValues?.[startFieldId];
  if (!value || !start) return undefined;
  return value < start ? message : undefined;
};

// Re-checks an end date as soon as it (or its start date) changes, so the
// error shows immediately instead of only on Save.
const revalidate = (fieldId) => (form) => {
  if (form.methods.getValue(fieldId)) form.methods.validateField(fieldId);
};

// Fields that only apply while the asset is ASSIGNED.
export const ASSIGNMENT_FIELDS = [
  "assignedEmployee",
  "assignedDate",
  "expectedReturnDate",
];

const todayIso = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Required only while the asset is ASSIGNED.
const requiredWhenAssigned = (message) => (value, allValues) =>
  allValues?.assetStatus === "ASSIGNED" && !value ? message : undefined;

const useAssetConfig = ({ handleDelete } = {}) => {
  const assetListingColDef = [
    {
      id: "assetName",
      field: "assetName",
      headerName: "Asset",
      width: 180,
    },
    {
      id: "assetCode",
      field: "assetCode",
      headerName: "Asset ID",
      width: 130,
    },
    {
      id: "assetCategory",
      field: "assetCategory",
      headerName: "Category",
      width: 150,
    },
    {
      id: "assetTag",
      field: "assetTag",
      headerName: "Asset Tag",
      width: 120,
    },
    {
      id: "serialNumber",
      field: "serialNumber",
      headerName: "Serial Number",
      width: 170,
    },
    {
      id: "brand",
      field: "brand",
      headerName: "Brand",
      width: 130,
    },
    {
      id: "model",
      field: "model",
      headerName: "Model",
      width: 160,
    },
    {
      id: "assignedEmployee",
      field: "assignedEmployee",
      headerName: "Assigned To",
      width: 180,
    },
    {
      id: "companyName",
      field: "companyName",
      headerName: "Company",
      width: 160,
    },
    {
      id: "branchName",
      field: "branchname",
      headerName: "Branch",
      width: 150,
    },
    {
      id: "purchaseDate",
      field: "purchaseDate",
      headerName: "Purchase Date",
      width: 140,
    },
    {
      id: "warrantyEndDate",
      field: "warrantyEndDate",
      headerName: "Warranty",
      width: 140,
    },
    {
      id: "assetStatus",
      field: "assetStatus",
      headerName: "Status",
      width: 130,
    },
    {
      id: "action",
      field: "action",
      headerName: "Action",
      width: 70,
      type: "actions",
      onClick: (data) => {
        handleDelete?.(data._id);
      },
    },
  ];

  const basicInformationSchema = [
    {
      id: "assetName",
      type: "text",
      label: "Asset Name",
      placeHolder: "Enter Asset Name",
      required: true,
      nextFocusField: "assetCategory",
      className: "col-span-3",
    },
    {
      id: "assetCode",
      type: "text",
      label: "Asset Code",
      placeHolder: "Auto Generated",
      required: true,
      disabled: true,
      nextFocusField: "assetCategory",
      prevFocusField: "assetName",
      className: "col-span-3",
    },
    {
      id: "assetCategory",
      type: "selectWrapper",
      label: "Asset Category",
      placeHolder: "Select Category",
      required: true,
      nextFocusField: "assetTag",
      prevFocusField: "assetName",
      className: "col-span-3",
      options: [
        { label: "IT Equipment", value: "it-equipment" },
        { label: "Computer / Laptop", value: "computer-laptop" },
        { label: "Mobile / Tablet", value: "mobile-tablet" },
        { label: "Office Equipment", value: "office-equipment" },
        { label: "Furniture", value: "furniture" },
        { label: "Vehicle", value: "vehicle" },
        { label: "Electrical Equipment", value: "electrical-equipment" },
        { label: "Networking Equipment", value: "networking-equipment" },
        { label: "Software / License", value: "software-license" },
        { label: "Machinery", value: "machinery" },
        { label: "Tools & Equipment", value: "tools-equipment" },
        { label: "Security Equipment", value: "security-equipment" },
        { label: "Communication Equipment", value: "communication-equipment" },
        { label: "Other", value: "other" },
      ],
    },
    {
      id: "assetTag",
      type: "text",
      label: "Asset Tag",
      placeHolder: "Enter Asset Tag",
      required: true,
      nextFocusField: "brand",
      prevFocusField: "assetCategory",
      className: "col-span-3",
    },
  ];

  const assetDetailsSchema = [
    {
      id: "brand",
      type: "text",
      label: "Brand",
      placeHolder: "Enter Brand",
      required: false,
      nextFocusField: "model",
      prevFocusField: "assetTag",
      className: "col-span-4",
    },
    {
      id: "model",
      type: "text",
      label: "Model",
      placeHolder: "Enter Model",
      required: false,
      nextFocusField: "serialNumber",
      prevFocusField: "brand",
      className: "col-span-4",
    },
    {
      id: "serialNumber",
      type: "text",
      label: "Serial Number",
      placeHolder: "Enter Serial Number",
      required: false,
      nextFocusField: "condition",
      prevFocusField: "model",
      className: "col-span-4",
    },
    {
      id: "condition",
      type: "selectWrapper",
      label: "Condition",
      placeHolder: "Select Condition",
      required: true,
      nextFocusField: "purchaseDate",
      prevFocusField: "serialNumber",
      className: "col-span-4",
      options: [
        {
          label: "New",
          value: "NEW",
        },
        {
          label: "Excellent",
          value: "EXCELLENT",
        },
        {
          label: "Good",
          value: "GOOD",
        },
        {
          label: "Fair",
          value: "FAIR",
        },
        {
          label: "Damaged",
          value: "DAMAGED",
        },
      ],
    },
  ];

  const purchaseInformationSchema = [
    {
      id: "purchaseDate",
      type: "date",
      label: "Purchase Date",
      placeHolder: "Select Purchase Date",
      required: false,
      nextFocusField: "purchaseCost",
      prevFocusField: "condition",
      className: "col-span-4",
    },
    {
      id: "purchaseCost",
      type: "number",
      label: "Purchase Cost",
      placeHolder: "0.00",
      required: false,
      prefix: "₹",
      precision: 2,
      nextFocusField: "vendor",
      prevFocusField: "purchaseDate",
      className: "col-span-4",
    },
    {
      id: "vendor",
      type: "text",
      label: "Vendor",
      placeHolder: "Enter Vendor",
      required: false,
      nextFocusField: "invoiceNumber",
      prevFocusField: "purchaseCost",
      className: "col-span-4",
    },
    {
      id: "invoiceNumber",
      type: "text",
      label: "Invoice Number",
      placeHolder: "Enter Invoice Number",
      required: false,
      nextFocusField: "warrantyStartDate",
      prevFocusField: "vendor",
      className: "col-span-4",
    },
    {
      id: "warrantyStartDate",
      type: "date",
      label: "Warranty Start Date",
      placeHolder: "Select Start Date",
      required: false,
      nextFocusField: "warrantyEndDate",
      prevFocusField: "invoiceNumber",
      className: "col-span-4",
      onChange: revalidate("warrantyEndDate"),
    },
    {
      id: "warrantyEndDate",
      type: "date",
      label: "Warranty End Date",
      placeHolder: "Select End Date",
      required: false,
      nextFocusField: "companyId",
      prevFocusField: "warrantyStartDate",
      className: "col-span-4",
      onChange: revalidate("warrantyEndDate"),
      validate: notBeforeField(
        "warrantyStartDate",
        "Warranty End Date can't be before Warranty Start Date",
      ),
    },
  ];

  const organizationInformationSchema = [
    {
      id: "company",
      type: "selectWrapper",
      label: "Company",
      placeHolder: "Select Company",
      required: true,
      nextFocusField: "branchId",
      className: "col-span-4",
      api: api + apiEndpoints.organization.company.CompanyHelp,
      labelKey: "companyName",
      valueKey: "_id",
    },
    {
      id: "branch",
      type: "selectWrapper",
      label: "Branch",
      placeHolder: "Select Branch",
      required: false,
      prevFocusField: "companyId",
      nextFocusField: "departmentId",
      className: "col-span-4",
      api: api + apiEndpoints.organization.branch.BranchHelp,
      labelKey: "branchname",
      valueKey: "_id",
    },
    {
      id: "department",
      type: "selectWrapper",
      label: "Department",
      placeHolder: "Select Department",
      required: false,
      prevFocusField: "branchId",
      nextFocusField: "assetStatus",
      className: "col-span-4",
      api: api + apiEndpoints.organization.department.DepartmentHelp,
      labelKey: "departmentname",
      valueKey: "_id",
    },
  ];

  const assignmentInformationSchema = [
    {
      id: "assetStatus",
      type: "selectWrapper",
      label: "Asset Status",
      placeHolder: "Select Status",
      required: true,
      prevFocusField: "department",
      nextFocusField: "currentOwner",
      className: "col-span-4",
      options: [
        {
          label: "Available",
          value: "AVAILABLE",
        },
        {
          label: "Assigned",
          value: "ASSIGNED",
        },
        {
          label: "Under Repair",
          value: "UNDER_REPAIR",
        },
        {
          label: "Lost",
          value: "LOST",
        },
        {
          label: "Disposed",
          value: "DISPOSED",
        },
      ],
      // Assignment fields only apply while ASSIGNED: clear them for any
      // other status, and default the date when switching to ASSIGNED.
      onChange: (form) => {
        if (form.methods.getValue("assetStatus") === "ASSIGNED") {
          if (!form.methods.getValue("assignedDate")) {
            form.methods.setValue("assignedDate", todayIso(), { triggerHooks: false });
          }
          return;
        }
        ASSIGNMENT_FIELDS.forEach((id) => {
          if (form.methods.getValue(id)) {
            form.methods.setValue(id, "", { triggerHooks: false });
          }
          form.methods.clearError(id);
        });
      },
    },
    {
      id: "assignedEmployee",
      type: "selectWrapper",
      label: "Assign to Employee",
      placeHolder: "Select Employee",
      required: false,
      nextFocusField: "assignedDate",
      className: "col-span-4",
      api: api + apiEndpoints.employee.employee.EmployeeHelp,
      labelKey: "employeeName",
      valueKey: "_id",
      validate: requiredWhenAssigned("Assign to Employee is required"),
    },
    {
      id: "assignedDate",
      type: "date",
      label: "Assigned Date",
      placeHolder: "Select Assigned Date",
      required: false,
      prevFocusField: "assignedEmployeeId",
      nextFocusField: "expectedReturnDate",
      className: "col-span-4",
      onChange: revalidate("expectedReturnDate"),
      validate: requiredWhenAssigned("Assigned Date is required"),
    },
    {
      id: "expectedReturnDate",
      type: "date",
      label: "Expected Return Date",
      placeHolder: "Select Return Date",
      required: false,
      prevFocusField: "assignedDate",
      nextFocusField: "description",
      className: "col-span-4",
      onChange: revalidate("expectedReturnDate"),
      validate: notBeforeField(
        "assignedDate",
        "Expected Return Date can't be before Assigned Date",
      ),
    },
  ];

  const additionalInformationSchema = [
    {
      id: "description",
      type: "textarea",
      label: "Description",
      placeHolder: "Briefly describe the asset...",
      required: false,
      rows: 4,
      prevFocusField: "expectedReturnDate",
      className: "col-span-12",
    },
  ];

  const documentInformationSchema = [
    {
      id: "purchaseInvoice",
      type: "file",
      label: "Purchase Invoice",
      placeHolder: "Upload Purchase Invoice",
      required: false,
      className: "col-span-4",
    },
    {
      id: "warrantyDocument",
      type: "file",
      label: "Warranty Document",
      placeHolder: "Upload Warranty Document",
      required: false,
      className: "col-span-4",
    },
    {
      id: "otherDocument",
      type: "file",
      label: "Other Document",
      placeHolder: "Upload Document",
      required: false,
      className: "col-span-4",
    },
    {
      id: "assetStatus",
      type: "selectWrapper",
      label: "Asset Status",
      placeHolder: "Select Status",
      required: true,
      prevFocusField: "locationId",
      nextFocusField: "currentOwner",
      className: "col-span-4",
      options: [
        {
          label: "Available",
          value: "AVAILABLE",
        },
        {
          label: "Assigned",
          value: "ASSIGNED",
        },
        {
          label: "Under Repair",
          value: "UNDER_REPAIR",
        },
        {
          label: "Lost",
          value: "LOST",
        },
        {
          label: "Disposed",
          value: "DISPOSED",
        },
      ],
    },
  ];

  return {
    assetListingColDef,
    basicInformationSchema,
    assetDetailsSchema,
    purchaseInformationSchema,
    organizationInformationSchema,
    assignmentInformationSchema,
    additionalInformationSchema,
    documentInformationSchema,
  };
};

export default useAssetConfig;
