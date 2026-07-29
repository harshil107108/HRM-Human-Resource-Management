import React from "react";
import { FileText, CheckCircle2 } from "lucide-react";

const DocumentsCard = ({ documents }) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-4">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <FileText size={18} />
                    </div>

                    <div>

                        <h3 className="font-semibold text-slate-800">
                            Uploaded Documents
                        </h3>

                        <p className="text-xs text-slate-500">
                            Verified employee documents
                        </p>

                    </div>

                </div>

            </div>

            <div className="space-y-3 p-5">

                {documents.map((doc) => (

                    <div
                        key={doc.name}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50"
                    >

                        <div>

                            <p className="text-sm font-medium text-slate-700">
                                {doc.name}
                            </p>

                            <p className="text-xs text-slate-400">
                                PDF Document
                            </p>

                        </div>

                        <CheckCircle2
                            size={18}
                            className="text-emerald-500"
                        />

                    </div>

                ))}

            </div>

        </div>
    );
};

export default DocumentsCard;