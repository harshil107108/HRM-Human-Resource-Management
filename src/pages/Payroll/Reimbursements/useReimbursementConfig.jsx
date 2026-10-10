import { formatDateForInput } from "@/utils/dateUtils";

const useReimbursementConfig = ({ handleDelete } = {}) => {
  const reimbursementListingColDef = [
    {
      id: "employeeName",
      field: "employeeName",
      headerName: "Employee",
      width: 200,
    },
    {
      id: "category",
      field: "category",
      headerName: "Category",
      width: 150,
    },
    {
      id: "claimDate",
      field: "claimDate",
      headerName: "Expense Date",
      width: 130,
      type: "date",
    },
    {
      id: "amount",
      field: "amount",
      headerName: "Claim (₹)",
      width: 130,
      type: "number",
    },
    {
      id: "approvedAmount",
      field: "approvedAmount",
      headerName: "Approved (₹)",
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

  const reimbursementSchema = [
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
      id: "category",
      type: "selectWrapper",
      label: "Expense Category",
      required: true,
      options: [
        { label: "Travel & Fuel", value: "Travel" },
        { label: "Food & Dining", value: "Food & Dining" },
        { label: "Medical", value: "Medical" },
        { label: "Phone / Internet", value: "Phone / Internet" },
        { label: "Stationery / Office", value: "Stationery" },
        { label: "Other", value: "Other" },
      ],
      className: "col-span-6",
    },
    {
      id: "claimDate",
      type: "date",
      label: "Expense Date",
      required: true,
      className: "col-span-3",
    },
    {
      id: "amount",
      type: "number",
      label: "Claim Amount (₹)",
      required: true,
      placeHolder: "1500",
      className: "col-span-3",
    },
    {
      id: "approvedAmount",
      type: "number",
      label: "Approved Amount (₹)",
      placeHolder: "1500",
      className: "col-span-3",
    },
    {
      id: "status",
      type: "selectWrapper",
      label: "Status",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "Approved", value: "Approved" },
        { label: "Rejected", value: "Rejected" },
        { label: "Settled", value: "Settled" },
      ],
      className: "col-span-3",
    },
    {
      id: "description",
      type: "textarea",
      label: "Expense Description / Notes",
      required: true,
      placeHolder: "Client visit cab fare, dinner receipt, etc...",
      className: "col-span-12",
    },
    {
      id: "remarks",
      type: "textarea",
      label: "Approval Remarks / Settlement Notes",
      placeHolder: "HR / Finance notes...",
      className: "col-span-12",
    },
  ];

  const initialValue = {
    employeeId: "",
    category: "Travel",
    claimDate: formatDateForInput(new Date()),
    amount: 1500,
    approvedAmount: 1500,
    description: "",
    status: "Pending",
    remarks: "",
  };

  return {
    reimbursementListingColDef,
    reimbursementSchema,
    initialValue,
    schema: reimbursementSchema,
  };
};

export { useReimbursementConfig };
export default useReimbursementConfig;
