import { useEffect, useState } from "react";
import { HpGrid } from "@/hp-grid/src";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDate } from "@/utils/dateUtils";

const AuditLogListing = () => {
    const [rowData, setRowData] = useState([]);
    const { apiCall, isPending } = useApiCall();

    const fetchAuditLogs = async () => {
        const response = await apiCall({
            id: "getAuditLogs",
            api: api + apiEndpoints.administration.audit.AuditGetData,
            payload: {}
        });

        if (response?.success) {
            const raw = response.data?.data ?? response.data;
            const data = Array.isArray(raw) ? raw : [];
            const formatted = data.map(item => ({
                ...item,
                createdAtFormatted: formatDate(item.createdAt || item.timestamp),
                userText: typeof item.user === "object"
                    ? `${item.user?.username || item.user?.email || "User"}`
                    : item.user || "System",
            }));
            setRowData(formatted);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const colDef = [
        {
            id: "createdAtFormatted",
            field: "createdAtFormatted",
            headerName: "Timestamp",
            width: 170,
        },
        {
            id: "userText",
            field: "userText",
            headerName: "User / Actor",
            width: 180,
        },
        {
            id: "action",
            field: "action",
            headerName: "Action",
            width: 120,
            render: (val) => {
                let badge = "bg-blue-100 text-blue-700";
                if (val === "CREATE") badge = "bg-green-100 text-green-700";
                if (val === "DELETE") badge = "bg-red-100 text-red-700";
                if (val === "LOGIN") badge = "bg-purple-100 text-purple-700";
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge}`}>
                        {val || "UPDATE"}
                    </span>
                );
            }
        },
        {
            id: "module",
            field: "module",
            headerName: "Target Module",
            width: 160,
            render: (val) => (
                <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
                    {val}
                </span>
            )
        },
        {
            id: "ipAddress",
            field: "ipAddress",
            headerName: "IP Address",
            width: 140,
            render: (val) => <span className="font-mono text-xs text-gray-600">{val || "127.0.0.1"}</span>
        },
        {
            id: "description",
            field: "description",
            headerName: "Event Description & Details",
            width: 380,
            render: (val, row) => (
                <span className="text-xs text-gray-800" title={val || row.details}>
                    {val || (typeof row.details === "object" ? JSON.stringify(row.details) : row.details) || "-"}
                </span>
            )
        }
    ];

    useDocumentTitle("orvexa | Audit Trail");

    return (
        <HpGrid
            id="auditLogListing"
            title="System Audit Trail & Security Logs"
            rowData={rowData}
            colDef={colDef}
            style={{ height: "100%" }}
            columnFilterable={true}
            panding={isPending("getAuditLogs")}
        />
    );
};

export default AuditLogListing;

