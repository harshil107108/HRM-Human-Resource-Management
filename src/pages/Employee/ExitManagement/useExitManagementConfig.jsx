const useExitManagementConfig = ({ handleDelete } = {}) => {
  const exitListingColDef = [
    {
      id: "employeeId",
      field: "employeeName",
      headerName: "Employee Name",
      width: 200,
    },
    {
      id: "exitType",
      field: "exitType",
      headerName: "Exit Type",
      width: 140,
    },
    {
      id: "resignationDate",
      field: "resignationDate",
      headerName: "Resignation Date",
      width: 150,
      type: "date",
    },
    {
      id: "lastWorkingDate",
      field: "lastWorkingDate",
      headerName: "Last Working Date",
      width: 160,
      type: "date",
    },
    {
      id: "overallStatus",
      field: "overallStatus",
      headerName: "Overall Status",
      width: 140,
    },
    {
      id: "fnfStatus",
      field: "fnfStatus",
      headerName: "FnF Status",
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

  const exitSchema = [
    {
      id: "employeeId",
      type: "selectWrapper",
      label: "Employee",
      placeHolder: "Select Employee",
      required: true,
      className: "col-span-6",
      options: [],
    },
    {
      id: "exitType",
      type: "selectWrapper",
      label: "Exit Type",
      placeHolder: "Select Exit Type",
      required: true,
      className: "col-span-6",
      options: [
        { label: "Resignation", value: "Resignation" },
        { label: "Retirement", value: "Retirement" },
        { label: "Termination", value: "Termination" },
        { label: "Contract End", value: "Contract End" },
        { label: "Other", value: "Other" },
      ],
    },
    {
      id: "resignationDate",
      type: "date",
      label: "Resignation Date",
      required: true,
      className: "col-span-3",
    },
    {
      id: "lastWorkingDate",
      type: "date",
      label: "Last Working Date",
      required: true,
      className: "col-span-3",
    },
    {
      id: "noticePeriodDays",
      type: "number",
      label: "Notice Period (Days)",
      placeHolder: "30",
      className: "col-span-3",
    },
    {
      id: "overallStatus",
      type: "selectWrapper",
      label: "Exit Status",
      required: true,
      className: "col-span-3",
      options: [
        { label: "Submitted", value: "Submitted" },
        { label: "In Clearance", value: "In Clearance" },
        { label: "Approved", value: "Approved" },
        { label: "Completed", value: "Completed" },
        { label: "Rejected", value: "Rejected" },
      ],
    },
    {
      id: "fnfStatus",
      type: "selectWrapper",
      label: "Full & Final Settlement",
      required: true,
      className: "col-span-6",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "Calculated", value: "Calculated" },
        { label: "Settled", value: "Settled" },
      ],
    },
    {
      id: "exitReason",
      type: "text",
      label: "Reason for Leaving",
      placeHolder: "Enter reason for leaving",
      required: true,
      className: "col-span-6",
    },
    {
      id: "interviewFeedback",
      type: "text",
      label: "Exit Interview Notes",
      placeHolder: "Feedback and comments from exit interview",
      className: "col-span-12",
    },
  ];

  const initialValue = {
    employeeId: "",
    exitType: "Resignation",
    resignationDate: "",
    lastWorkingDate: "",
    noticePeriodDays: 30,
    overallStatus: "Submitted",
    fnfStatus: "Pending",
    exitReason: "",
    interviewFeedback: "",
  };

  return { exitListingColDef, exitSchema, initialValue };
};

export default useExitManagementConfig;
