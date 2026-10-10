const useCandidateConfig = ({ handleDelete } = {}) => {
  const candidateListingColDef = [
    {
      id: "candidateName",
      field: "candidateName",
      headerName: "Candidate Name",
      width: 180,
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
      width: 140,
    },
    {
      id: "rating",
      field: "rating",
      headerName: "Rating (1-5)",
      width: 110,
      type: "number",
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
      id: "candidateName",
      type: "text",
      label: "Candidate Full Name",
      placeHolder: "Enter candidate full name",
      required: true,
      className: "col-span-6",
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
        { label: "Rejected", value: "Rejected" },
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
      id: "notes",
      type: "text",
      label: "Screening / Interview Notes",
      placeHolder: "Add candidate summary notes",
      className: "col-span-12",
    },
  ];

  const initialValue = {
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
    notes: "",
  };

  return { candidateListingColDef, candidateSchema, initialValue };
};

export default useCandidateConfig;
