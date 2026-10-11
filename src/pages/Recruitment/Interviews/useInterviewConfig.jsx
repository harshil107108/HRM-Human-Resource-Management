const useInterviewConfig = ({ handleDelete } = {}) => {
  const interviewListingColDef = [
    {
      id: "candidateName",
      field: "candidateName",
      headerName: "Candidate Name",
      width: 180,
    },
    {
      id: "jobTitle",
      field: "jobTitle",
      headerName: "Job Title",
      width: 170,
    },
    {
      id: "roundName",
      field: "roundName",
      headerName: "Interview Round",
      width: 160,
    },
    {
      id: "interviewerName",
      field: "interviewerName",
      headerName: "Interviewer",
      width: 170,
    },
    {
      id: "scheduledDate",
      field: "scheduledDate",
      headerName: "Scheduled Date & Time",
      width: 180,
      type: "date",
    },
    {
      id: "status",
      field: "status",
      headerName: "Status",
      width: 130,
      render: (status) => {
        const val = status || "Scheduled";
        const styleMap = {
          Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
          Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
          Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
          Rescheduled: "bg-amber-50 text-amber-700 border-amber-200",
          "No Show": "bg-slate-50 text-slate-700 border-slate-200",
        };
        const currentStyle = styleMap[val] || "bg-slate-50 text-slate-700 border-slate-200";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
            {val}
          </span>
        );
      },
    },
    {
      id: "recommendation",
      field: "recommendation",
      headerName: "Decision",
      width: 160,
      render: (rec) => {
        const val = rec || "Pending";
        if (val === "Strong Hire" || val === "Hire") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ★ {val} (Offer Ready)
            </span>
          );
        }
        if (val === "Reject") {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Reject (Talent Pool)
            </span>
          );
        }
        if (val === "Hold") {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              On Hold
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            Pending Review
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

  const interviewSchema = [
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
      id: "roundName",
      type: "selectWrapper",
      label: "Interview Round",
      required: true,
      className: "col-span-6",
      options: [
        { label: "Initial Screening", value: "Initial Screening" },
        { label: "Technical Round 1", value: "Technical Round 1" },
        { label: "Technical Round 2", value: "Technical Round 2" },
        { label: "Managerial Round", value: "Managerial Round" },
        { label: "HR Round", value: "HR Round" },
        { label: "Final Discussion", value: "Final Discussion" },
      ],
    },
    {
      id: "interviewer",
      type: "selectWrapper",
      label: "Interviewer",
      placeHolder: "Select Interviewer",
      required: true,
      className: "col-span-6",
      options: [],
    },
    {
      id: "scheduledDate",
      type: "date",
      label: "Interview Date",
      required: true,
      className: "col-span-3",
    },
    {
      id: "durationMinutes",
      type: "number",
      label: "Duration (Minutes)",
      placeHolder: "45",
      className: "col-span-3",
    },
    {
      id: "status",
      type: "selectWrapper",
      label: "Interview Status",
      className: "col-span-3",
      options: [
        { label: "Scheduled", value: "Scheduled" },
        { label: "Completed", value: "Completed" },
        { label: "Rescheduled", value: "Rescheduled" },
        { label: "Cancelled", value: "Cancelled" },
        { label: "No Show", value: "No Show" },
      ],
    },
    {
      id: "recommendation",
      type: "selectWrapper",
      label: "Interviewer Recommendation",
      className: "col-span-3",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "Strong Hire", value: "Strong Hire" },
        { label: "Hire", value: "Hire" },
        { label: "Hold", value: "Hold" },
        { label: "Reject", value: "Reject" },
      ],
    },
    {
      id: "meetingLinkOrLocation",
      type: "text",
      label: "Meeting Link or Room",
      placeHolder: "e.g. Google Meet link or Conference Room 3",
      className: "col-span-12",
    },
    {
      id: "feedback",
      type: "text",
      label: "Evaluation & Interview Feedback",
      placeHolder: "Notes on candidate technical skills, culture fit, strengths and concerns",
      className: "col-span-12",
    },
  ];

  const initialValue = {
    candidate: "",
    jobOpening: "",
    roundName: "Technical Round 1",
    interviewer: "",
    scheduledDate: "",
    durationMinutes: 45,
    meetingLinkOrLocation: "",
    status: "Scheduled",
    recommendation: "Pending",
    feedback: "",
  };

  return { interviewListingColDef, interviewSchema, initialValue };
};

export default useInterviewConfig;
