const useOfferLetterConfig = ({ handleDelete } = {}) => {
  const offerListingColDef = [
    {
      id: "candidateName",
      field: "candidateName",
      headerName: "Candidate Name",
      width: 180,
    },
    {
      id: "jobTitle",
      field: "jobTitle",
      headerName: "Position",
      width: 180,
    },
    {
      id: "offeredCtc",
      field: "offeredCtc",
      headerName: "Offered CTC (₹)",
      width: 140,
      type: "number",
    },
    {
      id: "joiningDate",
      field: "joiningDate",
      headerName: "Joining Date",
      width: 150,
      type: "date",
    },
    {
      id: "validUntil",
      field: "validUntil",
      headerName: "Offer Valid Until",
      width: 150,
      type: "date",
    },
    {
      id: "status",
      field: "status",
      headerName: "Offer Status",
      width: 170,
      render: (status) => {
        const val = status || "Draft";
        if (val === "Accepted") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Accepted (In Onboarding)
            </span>
          );
        }
        if (val === "Sent") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Sent to Candidate
            </span>
          );
        }
        if (val === "Declined") {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Declined by Candidate
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

  const offerSchema = [
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
      required: true,
      className: "col-span-6",
      options: [],
    },
    {
      id: "offeredDesignation",
      type: "selectWrapper",
      label: "Offered Designation",
      placeHolder: "Select Designation",
      required: true,
      className: "col-span-6",
      options: [],
    },
    {
      id: "offeredDepartment",
      type: "selectWrapper",
      label: "Department",
      placeHolder: "Select Department",
      required: true,
      className: "col-span-6",
      options: [],
    },
    {
      id: "offeredCtc",
      type: "number",
      label: "Annual CTC (₹)",
      placeHolder: "1200000",
      required: true,
      className: "col-span-3",
    },
    {
      id: "joiningDate",
      type: "date",
      label: "Joining Date",
      required: true,
      className: "col-span-3",
    },
    {
      id: "validUntil",
      type: "date",
      label: "Offer Valid Until",
      required: true,
      className: "col-span-3",
    },
    {
      id: "status",
      type: "selectWrapper",
      label: "Offer Letter Status",
      required: true,
      className: "col-span-3",
      options: [
        { label: "Draft", value: "Draft" },
        { label: "Sent", value: "Sent" },
        { label: "Accepted", value: "Accepted" },
        { label: "Declined", value: "Declined" },
        { label: "Expired", value: "Expired" },
        { label: "Revoked", value: "Revoked" },
      ],
    },
    {
      id: "remarks",
      type: "text",
      label: "Special Terms & Remarks",
      placeHolder: "Bonus details, relocation terms, probationary period",
      className: "col-span-12",
    },
  ];

  const initialValue = {
    candidate: "",
    jobOpening: "",
    offeredDesignation: "",
    offeredDepartment: "",
    offeredCtc: 0,
    joiningDate: "",
    validUntil: "",
    status: "Draft",
    remarks: "",
  };

  return { offerListingColDef, offerSchema, initialValue };
};

export default useOfferLetterConfig;
