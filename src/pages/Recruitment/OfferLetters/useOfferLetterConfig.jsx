const useOfferLetterConfig = ({ handleDelete, handleSendEmail } = {}) => {
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
      width: 170,
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
      width: 130,
      type: "date",
    },
    {
      id: "validUntil",
      field: "validUntil",
      headerName: "Offer Valid Until",
      width: 130,
      type: "date",
    },
    {
      id: "status",
      field: "status",
      headerName: "Offer Status",
      width: 190,
      render: (status, row) => {
        const val = status || "Draft";
        if (val === "Accepted") {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Accepted (In Onboarding)
            </span>
          );
        }
        if (val === "Sent") {
          return (
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Sent to Candidate
              </span>
              {row?.emailSent ? (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 pl-1">
                  ✓ Emailed to candidate
                </span>
              ) : row?.emailError ? (
                <span className="text-[11px] text-amber-600 font-medium pl-1 truncate max-w-[180px]" title={row.emailError}>
                  ⚠ Email issue: {row.emailError}
                </span>
              ) : null}
            </div>
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
      id: "emailStatus",
      field: "emailSent",
      headerName: "Email Delivery",
      width: 150,
      render: (_, row) => {
        if (row?.emailSent) {
          const sentDate = row.emailSentAt
            ? new Date(row.emailSentAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })
            : "";
          return (
            <div
              className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50/90 border border-emerald-200 px-2 py-0.5 rounded-md"
              title={`Delivered to ${row.emailSentTo || "candidate"}${row.emailSentAt ? ` on ${new Date(row.emailSentAt).toLocaleString()}` : ""}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Delivered {sentDate ? `(${sentDate})` : ""}</span>
            </div>
          );
        }
        if (row?.status === "Sent" && row?.emailError) {
          return (
            <div
              className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md cursor-help"
              title={row.emailError}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Failed</span>
            </div>
          );
        }
        if (row?.status === "Sent") {
          return <span className="text-xs text-slate-400 font-medium">Pending</span>;
        }
        return <span className="text-xs text-slate-300 font-normal">—</span>;
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
