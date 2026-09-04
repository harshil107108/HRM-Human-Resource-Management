const useJobOpeningConfig = () => {
  const jobOpeningListingColDef = [
    {
      id: "jobTitle",
      field: "jobTitle",
      headerName: "Job Opening",
      width: 220,
    },
    {
      id: "jobOpeningId",
      field: "jobOpeningId",
      headerName: "Job ID",
      width: 140,
    },
    {
      id: "departmentName",
      field: "departmentName",
      headerName: "Department",
      width: 150,
    },
    {
      id: "designationName",
      field: "designationName",
      headerName: "Designation",
      width: 170,
    },
    {
      id: "numberOfPositions",
      field: "numberOfPositions",
      headerName: "Positions",
      width: 100,
    },
    {
      id: "employmentType",
      field: "employmentType",
      headerName: "Employment Type",
      width: 150,
    },
    {
      id: "hiringManagerName",
      field: "hiringManagerName",
      headerName: "Hiring Manager",
      width: 180,
    },
    {
      id: "applicationCount",
      field: "applicationCount",
      headerName: "Applications",
      width: 120,
    },
    {
      id: "postedDate",
      field: "postedDate",
      headerName: "Posted Date",
      width: 140,
    },
    {
      id: "jobStatus",
      field: "jobStatus",
      headerName: "Status",
      width: 120,
    },
    {
      id: "action",
      field: "action",
      headerName: "Action",
      width: 70,
      type: "actions",
    },
  ];

  const jobInformationSchema = [
    {
      id: "jobTitle",
      type: "text",
      label: "Job Title",
      placeHolder: "Enter Job Title",
      required: true,
      className: "col-span-4",
      nextFocusField: "jobOpeningId",
    },
    {
      id: "jobOpeningId",
      type: "text",
      label: "Job Opening ID",
      placeHolder: "Auto-generated",
      className: "col-span-4",
      disabled: true,
      nextFocusField: "departmentId",
      prevFocusField: "jobTitle",
    },
    {
      id: "departmentId",
      type: "selectWrapper",
      label: "Department",
      placeHolder: "Select Department",
      required: true,
      className: "col-span-4",
      nextFocusField: "designationId",
      prevFocusField: "jobOpeningId",
      options: [],
    },
    {
      id: "designationId",
      type: "selectWrapper",
      label: "Designation",
      placeHolder: "Select Designation",
      required: true,
      className: "col-span-4",
      nextFocusField: "companyId",
      prevFocusField: "departmentId",
      options: [],
    },
    {
      id: "companyId",
      type: "selectWrapper",
      label: "Company",
      placeHolder: "Select Company",
      required: true,
      className: "col-span-4",
      nextFocusField: "branchId",
      prevFocusField: "designationId",
      options: [],
    },
    {
      id: "branchId",
      type: "selectWrapper",
      label: "Branch",
      placeHolder: "Select Branch",
      className: "col-span-4",
      nextFocusField: "locationId",
      prevFocusField: "companyId",
      options: [],
    },
  ];

  const positionInformationSchema = [
    {
      id: "numberOfPositions",
      type: "number",
      label: "Number of Positions",
      placeHolder: "1",
      required: true,
      className: "col-span-4",
      nextFocusField: "employmentType",
    },
    {
      id: "employmentType",
      type: "selectWrapper",
      label: "Employment Type",
      placeHolder: "Select Employment Type",
      required: true,
      className: "col-span-4",
      nextFocusField: "workMode",
      prevFocusField: "numberOfPositions",
      options: [
        {
          label: "Full Time",
          value: "FULL_TIME",
        },
        {
          label: "Part Time",
          value: "PART_TIME",
        },
        {
          label: "Contract",
          value: "CONTRACT",
        },
        {
          label: "Internship",
          value: "INTERNSHIP",
        },
        {
          label: "Temporary",
          value: "TEMPORARY",
        },
      ],
    },
    {
      id: "workMode",
      type: "selectWrapper",
      label: "Work Mode",
      placeHolder: "Select Work Mode",
      required: true,
      className: "col-span-4",
      nextFocusField: "experienceRequired",
      prevFocusField: "employmentType",
      options: [
        {
          label: "On-site",
          value: "ONSITE",
        },
        {
          label: "Hybrid",
          value: "HYBRID",
        },
        {
          label: "Remote",
          value: "REMOTE",
        },
      ],
    },
    {
      id: "experienceRequired",
      type: "selectWrapper",
      label: "Experience Required",
      placeHolder: "Select Experience Level",
      className: "col-span-4",
      nextFocusField: "minimumExperience",
      prevFocusField: "workMode",
      options: [
        {
          label: "Fresher",
          value: "FRESHER",
        },
        {
          label: "Entry Level",
          value: "ENTRY_LEVEL",
        },
        {
          label: "Mid Level",
          value: "MID_LEVEL",
        },
        {
          label: "Senior Level",
          value: "SENIOR_LEVEL",
        },
        {
          label: "Lead",
          value: "LEAD",
        },
      ],
    },
    {
      id: "minimumExperience",
      type: "number",
      label: "Minimum Experience",
      placeHolder: "Enter Minimum Experience",
      className: "col-span-4",
      nextFocusField: "maximumExperience",
      prevFocusField: "experienceRequired",
    },
    {
      id: "maximumExperience",
      type: "number",
      label: "Maximum Experience",
      placeHolder: "Enter Maximum Experience",
      className: "col-span-4",
      nextFocusField: "hiringManagerId",
      prevFocusField: "minimumExperience",
    },
  ];

  const hiringInformationSchema = [
    {
      id: "hiringManagerId",
      type: "selectWrapper",
      label: "Hiring Manager",
      placeHolder: "Select Hiring Manager",
      required: true,
      className: "col-span-4",
      nextFocusField: "recruiterId",
      options: [],
    },
    {
      id: "recruiterId",
      type: "selectWrapper",
      label: "Recruiter",
      placeHolder: "Select Recruiter",
      className: "col-span-4",
      nextFocusField: "priority",
      prevFocusField: "hiringManagerId",
      options: [],
    },
    {
      id: "priority",
      type: "selectWrapper",
      label: "Priority",
      placeHolder: "Select Priority",
      className: "col-span-4",
      nextFocusField: "targetJoiningDate",
      prevFocusField: "recruiterId",
      options: [
        {
          label: "Low",
          value: "LOW",
        },
        {
          label: "Normal",
          value: "NORMAL",
        },
        {
          label: "High",
          value: "HIGH",
        },
        {
          label: "Urgent",
          value: "URGENT",
        },
      ],
    },
    {
      id: "targetJoiningDate",
      type: "date",
      label: "Target Joining Date",
      placeHolder: "DD / MM / YYYY",
      className: "col-span-4",
      prevFocusField: "priority",
      nextFocusField: "salaryType",
    },
  ];

  const salaryInformationSchema = [
    {
      id: "salaryType",
      type: "selectWrapper",
      label: "Salary Type",
      placeHolder: "Select Salary Type",
      className: "col-span-4",
      nextFocusField: "minimumSalary",
      options: [
        {
          label: "Annual CTC",
          value: "ANNUAL_CTC",
        },
        {
          label: "Monthly Salary",
          value: "MONTHLY",
        },
        {
          label: "Hourly",
          value: "HOURLY",
        },
        {
          label: "Negotiable",
          value: "NEGOTIABLE",
        },
      ],
    },
    {
      id: "minimumSalary",
      type: "number",
      label: "Minimum Salary",
      placeHolder: "Enter Minimum Salary",
      className: "col-span-4",
      nextFocusField: "maximumSalary",
      prevFocusField: "salaryType",
    },
    {
      id: "maximumSalary",
      type: "number",
      label: "Maximum Salary",
      placeHolder: "Enter Maximum Salary",
      className: "col-span-4",
      nextFocusField: "currency",
      prevFocusField: "minimumSalary",
    },
    {
      id: "currency",
      type: "selectWrapper",
      label: "Currency",
      placeHolder: "Select Currency",
      className: "col-span-4",
      prevFocusField: "maximumSalary",
      nextFocusField: "jobSummary",
      options: [
        {
          label: "INR (₹)",
          value: "INR",
        },
        {
          label: "USD ($)",
          value: "USD",
        },
        {
          label: "EUR (€)",
          value: "EUR",
        },
        {
          label: "GBP (£)",
          value: "GBP",
        },
      ],
    },
  ];

  const jobDescriptionSchema = [
    {
      id: "jobSummary",
      type: "textarea",
      inputType: "textarea",
      label: "Job Summary",
      placeHolder: "Enter job summary...",
      required: true,
      className: "col-span-6",
      nextFocusField: "jobResponsibilities",
      rows: 2,
    },
    {
      id: "jobResponsibilities",
      type: "textarea",
      inputType: "textarea",
      label: "Job Responsibilities",
      placeHolder: "Enter key responsibilities...",
      required: true,
      rows: 1,
      className: "col-span-6",
      prevFocusField: "jobSummary",
      nextFocusField: "requiredSkills",
    },
    {
      id: "requiredSkills",
      type: "text",
      inputType: "textarea",
      label: "Required Skills",
      placeHolder: "Enter required skills...",
      className: "col-span-4",
      prevFocusField: "jobResponsibilities",
      nextFocusField: "preferredSkills",
    },
    {
      id: "preferredSkills",
      type: "text",
      inputType: "textarea",
      label: "Preferred Skills",
      placeHolder: "Enter preferred skills...",
      className: "col-span-4",
      prevFocusField: "requiredSkills",
      nextFocusField: "qualifications",
    },
    {
      id: "qualifications",
      type: "text",
      inputType: "textarea",
      label: "Qualifications",
      placeHolder: "Enter qualifications...",
      className: "col-span-4",
      prevFocusField: "preferredSkills",
      nextFocusField: "jobStatus",
    },
  ];

  // =========================================================
  // PUBLISHING INFORMATION
  // =========================================================

  const publishingInformationSchema = [
    {
      id: "jobStatus",
      type: "selectWrapper",
      label: "Job Status",
      placeHolder: "Select Status",
      required: true,
      className: "col-span-2",
      nextFocusField: "publishDate",
      options: [
        {
          label: "Draft",
          value: "DRAFT",
        },
        {
          label: "Active",
          value: "ACTIVE",
        },
        {
          label: "On Hold",
          value: "ON_HOLD",
        },
        {
          label: "Closed",
          value: "CLOSED",
        },
        {
          label: "Filled",
          value: "FILLED",
        },
      ],
    },
    {
      id: "publishDate",
      type: "date",
      label: "Publish Date",
      placeHolder: "DD / MM / YYYY",
      className: "col-span-2",
      nextFocusField: "closingDate",
      prevFocusField: "jobStatus",
    },
    {
      id: "closingDate",
      type: "date",
      label: "Closing Date",
      placeHolder: "DD / MM / YYYY",
      className: "col-span-2",
      nextFocusField: "publishOnCareerPage",
      prevFocusField: "publishDate",
    },
    {
      id: "publishOnCareerPage",
      type: "checkbox",
      label: "Publish On Career Page",
      className: "col-span-3",
      nextFocusField: "allowInternalApplications",
      prevFocusField: "closingDate",
    },
    {
      id: "allowInternalApplications",
      type: "checkbox",
      label: "Allow Internal Applications",
      className: "col-span-3",
      prevFocusField: "publishOnCareerPage",
      nextFocusField: "remarks",
    },
  ];

  // =========================================================
  // ADDITIONAL INFORMATION
  // =========================================================

  const additionalInformationSchema = [
    {
      id: "remarks",
      type: "textarea",
      inputType: "textarea",
      label: "Remarks",
      placeHolder: "Enter additional remarks (optional)...",
      className: "col-span-12",
    },
  ];

  // =========================================================
  // JOB OPENING LISTING
  // =========================================================

  return {
    jobOpeningListingColDef,

    jobInformationSchema,
    positionInformationSchema,
    hiringInformationSchema,
    salaryInformationSchema,
    jobDescriptionSchema,
    publishingInformationSchema,
    additionalInformationSchema,
  };
};

export default useJobOpeningConfig;
