const useOnboardingConfig = ({ handleDelete } = {}) => {
  const onboardingListingColDef = [
    {
      id: "candidateName",
      field: "candidateName",
      headerName: "New Hire Name",
      width: 180,
    },
    {
      id: "jobTitle",
      field: "jobTitle",
      headerName: "Position",
      width: 170,
    },
    {
      id: "orientationDate",
      field: "orientationDate",
      headerName: "Orientation Date",
      width: 150,
      type: "date",
    },
    {
      id: "progressPercentage",
      field: "progressPercentage",
      headerName: "Progress (%)",
      width: 130,
      type: "number",
    },
    {
      id: "status",
      field: "status",
      headerName: "Onboarding Status",
      width: 150,
    },
    {
      id: "buddyName",
      field: "buddyName",
      headerName: "Assigned Buddy",
      width: 170,
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

  const onboardingSchema = [
    {
      id: "candidate",
      type: "selectWrapper",
      label: "Candidate",
      placeHolder: "Select Candidate",
      required: true,
      className: "col-span-6",
      options: [],
    },
    {
      id: "jobOpening",
      type: "selectWrapper",
      label: "Job Opening",
      placeHolder: "Select Job Opening",
      className: "col-span-6",
      options: [],
    },
    {
      id: "orientationDate",
      type: "date",
      label: "Orientation Date",
      required: true,
      className: "col-span-4",
    },
    {
      id: "buddyEmployee",
      type: "selectWrapper",
      label: "Assigned Mentor / Buddy",
      placeHolder: "Select Mentor",
      className: "col-span-4",
      options: [],
    },
    {
      id: "status",
      type: "selectWrapper",
      label: "Status",
      className: "col-span-4",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "In Progress", value: "In Progress" },
        { label: "Completed", value: "Completed" },
        { label: "Cancelled", value: "Cancelled" },
      ],
    },
    {
      id: "notes",
      type: "text",
      label: "HR Notes",
      placeHolder: "Special instructions or notes",
      className: "col-span-12",
    },
  ];

  const initialValue = {
    candidate: "",
    jobOpening: "",
    buddyEmployee: "",
    orientationDate: "",
    status: "In Progress",
    notes: "",
  };

  return { onboardingListingColDef, onboardingSchema, initialValue };
};

export default useOnboardingConfig;
