import { useMemo } from "react";

export const useFeedbackConfig = ({ handleDelete } = {}) => {
    const feedbackListingColDef = [
        {
            id: "toEmployeeName",
            field: "toEmployeeName",
            headerName: "Recipient Employee",
            width: 220,
        },
        {
            id: "fromEmployeeName",
            field: "fromEmployeeName",
            headerName: "Given By",
            width: 200,
            render: (val, row) => {
                if (row.isAnonymous) return <span className="italic text-gray-500">Anonymous</span>;
                return val || "N/A";
            }
        },
        {
            id: "feedbackType",
            field: "feedbackType",
            headerName: "Feedback Type",
            width: 180,
            render: (val) => {
                let badge = "bg-blue-100 text-blue-700";
                if (val === "Spot Recognition" || val === "Client Appreciation") badge = "bg-emerald-100 text-emerald-700";
                if (val === "Manager Feedback") badge = "bg-purple-100 text-purple-700";
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge}`}>
                        {val || "360 Peer Review"}
                    </span>
                );
            }
        },
        {
            id: "rating",
            field: "rating",
            headerName: "Rating",
            width: 120,
            render: (val) => (
                <div className="flex items-center gap-1 font-bold text-amber-500">
                    <span>★</span>
                    <span className="text-gray-800">{val || 5} / 5</span>
                </div>
            )
        },
        {
            id: "status",
            field: "status",
            headerName: "Status",
            width: 140,
            render: (val) => {
                let color = "bg-gray-100 text-gray-700";
                if (val === "Published") color = "bg-green-100 text-green-700";
                if (val === "Acknowledged") color = "bg-blue-100 text-blue-700";
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
                        {val || "Published"}
                    </span>
                );
            }
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

    const initialValue = useMemo(() => ({
        givenTo: "",
        givenBy: "",
        feedbackType: "360 Peer Review",
        rating: 5,
        strengths: "",
        suggestions: "",
        isAnonymous: false,
        status: "Published"
    }), []);

    const schema = useMemo(() => ({
        givenTo: {
            type: "selectWrapper",
            label: "Recipient Employee",
            required: true,
            placeholder: "Select Recipient",
            options: [],
            className: "col-span-6"
        },
        givenBy: {
            type: "selectWrapper",
            label: "Feedback Giver",
            required: true,
            placeholder: "Select Giver",
            options: [],
            className: "col-span-6"
        },
        feedbackType: {
            type: "selectWrapper",
            label: "Feedback Category",
            required: true,
            options: [
                { label: "360 Peer Review", value: "360 Peer Review" },
                { label: "Manager Feedback", value: "Manager Feedback" },
                { label: "Subordinate Feedback", value: "Subordinate Feedback" },
                { label: "Client Appreciation", value: "Client Appreciation" },
                { label: "Spot Recognition", value: "Spot Recognition" }
            ],
            className: "col-span-4"
        },
        rating: {
            type: "selectWrapper",
            label: "Recognition Rating",
            options: [
                { label: "5 - Exceptional", value: 5 },
                { label: "4 - Great Work", value: 4 },
                { label: "3 - Good Contribution", value: 3 },
                { label: "2 - Needs Growth", value: 2 },
                { label: "1 - Unsatisfactory", value: 1 }
            ],
            className: "col-span-4"
        },
        status: {
            type: "selectWrapper",
            label: "Status",
            options: [
                { label: "Draft", value: "Draft" },
                { label: "Published", value: "Published" },
                { label: "Acknowledged", value: "Acknowledged" }
            ],
            className: "col-span-4"
        },
        isAnonymous: {
            type: "checkbox",
            label: "Submit Feedback Anonymously",
            className: "col-span-12"
        },
        strengths: {
            type: "textarea",
            label: "Strengths & Notable Contributions",
            required: true,
            placeholder: "Highlight positive impact, teamwork, and leadership...",
            className: "col-span-12"
        },
        suggestions: {
            type: "textarea",
            label: "Constructive Suggestions (Optional)",
            placeholder: "Constructive ideas for continuous improvement...",
            className: "col-span-12"
        }
    }), []);

    return { initialValue, schema, feedbackListingColDef };
};

export default useFeedbackConfig;
