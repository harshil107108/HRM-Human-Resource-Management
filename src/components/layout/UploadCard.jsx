import { FileText, Upload, X, Eye } from "lucide-react";

const UploadCard = ({
    title,
    name,
    file,
    onChange,
    onRemove,
}) => {
    return (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 hover:border-indigo-300 transition">

            <div className="flex flex-col items-center justify-center">

                <FileText
                    className="text-slate-400 mb-3"
                    size={26}
                />

                <span className="text-sm font-semibold text-slate-700 text-center">
                    {title}
                </span>

                {file?.name ? (
                    <>
                        <div className="mt-4 flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">

                            <FileText
                                size={18}
                                className="shrink-0 text-indigo-500"
                            />

                            <span className="flex-1 truncate text-xs text-slate-600">
                                {file.name}
                            </span>

                            {file.url && (
                                <button
                                    type="button"
                                    onClick={() => window.open(file.url, "_blank")}
                                    className="text-indigo-600 hover:text-indigo-700"
                                >
                                    <Eye size={16} />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onRemove}
                                className="text-red-500 hover:text-red-600"
                            >
                                <X size={16} />
                            </button>

                        </div>

                        <label className="mt-3 cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                            Replace Document

                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) =>
                                    onChange(e.target.files?.[0] || null)
                                }
                            />
                        </label>
                    </>
                ) : (
                    <>
                        <span className="mt-2 text-xs text-slate-400">
                            Drag & Drop or Click to Upload
                        </span>

                        <label className="mt-4 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
                            <Upload
                                size={14}
                                className="inline mr-1"
                            />

                            Upload

                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) =>
                                    onChange(e.target.files?.[0] || null)
                                }
                            />
                        </label>
                    </>
                )}

            </div>

        </div>
    );
};

export default UploadCard;