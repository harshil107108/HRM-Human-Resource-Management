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
      headerName: "Progress",
      width: 150,
      type: "number",
      render: (val) => {
        const pct = Math.min(Math.max(Number(val) || 0, 0), 100);
        const barColor =
          pct === 100 ? "bg-emerald-500" : pct > 50 ? "bg-indigo-500" : "bg-amber-500";
        return (
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-300`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 min-w-[32px] text-right">
              {pct}%
            </span>
          </div>
        );
      },
    },
    {
      id: "status",
      field: "status",
      headerName: "Onboarding Status",
      width: 190,
      render: (status) => {
        const val = status || "In Progress";
        if (val === "Completed") {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Completed (Active Employee)
            </span>
          );
        }
        if (val === "In Progress") {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              In Progress
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
            {val}
          </span>
        );
      },
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
