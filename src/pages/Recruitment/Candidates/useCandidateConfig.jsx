const useCandidateConfig = ({ handleDelete } = {}) => {
  const candidateListingColDef = [
    {
      id: "candidateName",
      field: "candidateName",
      headerName: "Candidate Name",
      width: 190,
      render: (name, row) => {
        if (row?.firstName || row?.lastName) {
          return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ");
        }
        return name || "-";
      },
    },
    {
      id: "email",
      field: "email",
      headerName: "Email Address",
      width: 200,
    },
    {
      id: "phone",
      field: "phone",
      headerName: "Phone Number",
      width: 140,
    },
    {
      id: "jobTitle",
      field: "jobTitle",
      headerName: "Job Title",
      width: 180,
    },
    {
      id: "totalExperienceYears",
      field: "totalExperienceYears",
      headerName: "Exp (Yrs)",
      width: 100,
      type: "number",
    },
    {
      id: "stage",
      field: "stage",
      headerName: "Recruitment Stage",
      width: 170,
      render: (stage, row) => {
        const val = stage || "Applied";
        const isConverted = val === "Hired" && (row.convertedEmployeeId || row.isConverted);

        const badgeStyles = {
          Applied: "bg-blue-50 text-blue-700 border-blue-200",
          Screening: "bg-purple-50 text-purple-700 border-purple-200",
          Interview: "bg-amber-50 text-amber-700 border-amber-200",
          Offered: "bg-indigo-50 text-indigo-700 border-indigo-200",
          Hired: "bg-emerald-50 text-emerald-700 border-emerald-200",
          Rejected: "bg-rose-50 text-rose-700 border-rose-200",
        };

        const currentStyle = badgeStyles[val] || "bg-slate-50 text-slate-700 border-slate-200";

        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
              {val}
            </span>
            {isConverted && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800" title="Converted to Employee">
                ✓ Converted
              </span>
            )}
            {val === "Rejected" && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600" title="Archived in Talent Pool">
                Talent Pool
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "rating",
      field: "rating",
      headerName: "Rating",
      width: 100,
      type: "number",
      render: (rating) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
          ★ {rating || 3}/5
        </span>
      ),
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

  const candidateSchema = [
    {
      id: "firstName",
      type: "text",
      label: "First Name",
      placeHolder: "Enter first name",
      required: true,
      className: "col-span-4",
    },
    {
      id: "middleName",
      type: "text",
      label: "Middle Name",
      placeHolder: "Enter middle name (optional)",
      className: "col-span-4",
    },
    {
      id: "lastName",
      type: "text",
      label: "Last Name",
      placeHolder: "Enter last name",
      required: true,
      className: "col-span-4",
    },
    {
      id: "email",
      type: "text",
      label: "Email Address",
      placeHolder: "candidate@email.com",
      required: true,
      className: "col-span-6",
    },
    {
      id: "phone",
      type: "text",
      label: "Phone Number",
      placeHolder: "+91 9876543210",
      required: true,
      className: "col-span-6",
    },
    {
      id: "jobOpening",
      type: "selectWrapper",
      label: "Applied Job Opening",
      placeHolder: "Select Job Opening",
      required: true,
      className: "col-span-6",
      options: [],
    },
    {
      id: "currentCompany",
      type: "text",
      label: "Current Company",
      placeHolder: "Current employer",
      className: "col-span-6",
    },
    {
      id: "currentDesignation",
      type: "text",
      label: "Current Designation",
      placeHolder: "Current job title",
      className: "col-span-6",
    },
    {
      id: "totalExperienceYears",
      type: "number",
      label: "Experience (Years)",
      placeHolder: "3",
      className: "col-span-4",
    },
    {
      id: "currentSalary",
      type: "number",
      label: "Current CTC (₹)",
      placeHolder: "600000",
      className: "col-span-4",
    },
    {
      id: "expectedSalary",
      type: "number",
      label: "Expected CTC (₹)",
      placeHolder: "850000",
      className: "col-span-4",
    },
    {
      id: "stage",
      type: "selectWrapper",
      label: "Hiring Stage",
      required: true,
      className: "col-span-6",
      options: [
        { label: "Applied", value: "Applied" },
        { label: "Screening", value: "Screening" },
        { label: "Interview", value: "Interview" },
        { label: "Offered", value: "Offered" },
        { label: "Hired", value: "Hired" },
        { label: "Rejected (Talent Pool)", value: "Rejected" },
      ],
    },
    {
      id: "rating",
      type: "selectWrapper",
      label: "Rating",
      className: "col-span-6",
      options: [
        { label: "5 - Excellent", value: 5 },
        { label: "4 - Strong", value: 4 },
        { label: "3 - Average", value: 3 },
        { label: "2 - Below Expectations", value: 2 },
        { label: "1 - Unsuitable", value: 1 },
      ],
    },
    {
      id: "rejectionReason",
      type: "text",
      label: "Rejection Reason / Talent Pool Notes",
      placeHolder: "Reason if rejected (e.g., Salary expectations, Tech mismatch, Keep for future roles)",
      className: "col-span-12",
    },
    {
      id: "notes",
      type: "text",
      label: "Screening / Interview Notes",
      placeHolder: "Add candidate summary notes",
      className: "col-span-12",
    },
  ];

  const initialValue = {
    firstName: "",
    middleName: "",
    lastName: "",
    candidateName: "",
    email: "",
    phone: "",
    jobOpening: "",
    currentCompany: "",
    currentDesignation: "",
    totalExperienceYears: 0,
    currentSalary: 0,
    expectedSalary: 0,
    stage: "Applied",
    rating: 3,
    rejectionReason: "",
    notes: "",
  };

  return { candidateListingColDef, candidateSchema, initialValue };
};

export default useCandidateConfig;
