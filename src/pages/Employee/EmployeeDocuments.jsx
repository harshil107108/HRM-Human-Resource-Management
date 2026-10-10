import { useState } from "react";
import { HpGrid } from "@/hp-grid/src";
import HpCard from "@/components/common/HpCard";
import { FileText, UploadCloud, Download, CheckCircle, Clock } from "lucide-react";
import useAlert from "@/hooks/useAlert";

const INITIAL_DOCS = [
    {
        _id: "doc-1",
        employeeName: "John Doe (EMP-001)",
        documentType: "National ID / Aadhaar",
        fileName: "john_doe_aadhaar_card.pdf",
        fileSize: "1.2 MB",
        uploadedDate: "2026-03-15",
        status: "Verified",
        verifiedBy: "HR Admin"
    },
    {
        _id: "doc-2",
        employeeName: "Sarah Connor (EMP-002)",
        documentType: "Passport Copy",
        fileName: "sarah_passport_scan.pdf",
        fileSize: "2.8 MB",
        uploadedDate: "2026-04-01",
        status: "Verified",
        verifiedBy: "HR Admin"
    },
    {
        _id: "doc-3",
        employeeName: "David Miller (EMP-003)",
        documentType: "Signed Offer & NDA",
        fileName: "david_miller_signed_nda.pdf",
        fileSize: "840 KB",
        uploadedDate: "2026-05-10",
        status: "Verified",
        verifiedBy: "HR Admin"
    },
    {
        _id: "doc-4",
        employeeName: "Elena Rostova (EMP-004)",
        documentType: "Educational Degree Certificate",
        fileName: "elena_ms_computer_science.pdf",
        fileSize: "3.1 MB",
        uploadedDate: "2026-06-20",
        status: "Pending Verification",
        verifiedBy: "-"
    },
    {
        _id: "doc-5",
        employeeName: "Michael Chang (EMP-005)",
        documentType: "Previous Employment Relieving Letter",
        fileName: "relieving_experience_cert.pdf",
        fileSize: "1.5 MB",
        uploadedDate: "2026-07-02",
        status: "Verified",
        verifiedBy: "HR Admin"
    }
];

const EmployeeDocuments = () => {
    const [docs, setDocs] = useState(INITIAL_DOCS);
    const { showAlert } = useAlert();

    const handleDownload = (row) => {
        showAlert(`Downloading ${row.fileName}...`, "info");
    };

    const handleUploadMock = () => {
        showAlert("Document upload dialog initialized. Select file to attach to employee profile.", "info");
    };

    const colDef = [
        {
            key: "employeeName",
            label: "Employee",
            sortable: true,
            filterable: true
        },
        {
            key: "documentType",
            label: "Document Type",
            sortable: true,
            filterable: true
        },
        {
            key: "fileName",
            label: "File Name",
            sortable: true,
            render: (val) => (
                <span className="flex items-center gap-1.5 font-medium text-gray-800">
                    <FileText size={14} className="text-blue-500" />
                    {val}
                </span>
            )
        },
        {
            key: "fileSize",
            label: "Size",
            sortable: true
        },
        {
            key: "uploadedDate",
            label: "Upload Date",
            sortable: true
        },
        {
            key: "status",
            label: "Verification Status",
            sortable: true,
            render: (val) => {
                const isVerified = val === "Verified";
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                        {val}
                    </span>
                );
            }
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <button
                    onClick={() => handleDownload(row)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                    <Download size={13} />
                    Download
                </button>
            )
        }
    ];

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Employee Documents & Compliance Vault</h1>
                        <p className="text-sm text-gray-500">Secure digital repository for verified employee identity, certifications, and contracts</p>
                    </div>
                </div>

                <button
                    onClick={handleUploadMock}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                    <UploadCloud size={16} />
                    Upload Document
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Archived Documents</span>
                            <h3 className="text-2xl font-bold text-gray-800">{docs.length}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Compliance Verified</span>
                            <h3 className="text-2xl font-bold text-emerald-600">
                                {docs.filter(d => d.status === "Verified").length}
                            </h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Pending Review</span>
                            <h3 className="text-2xl font-bold text-amber-600">
                                {docs.filter(d => d.status !== "Verified").length}
                            </h3>
                        </div>
                    </div>
                </HpCard>
            </div>

            <HpGrid
                id="documents-grid"
                title="Employee Document Repository"
                rowData={docs}
                colDef={colDef}
                columnFilterable={true}
            />
        </div>
    );
};

export default EmployeeDocuments;
