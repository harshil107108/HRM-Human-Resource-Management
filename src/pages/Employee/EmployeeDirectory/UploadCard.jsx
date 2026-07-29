import { FileText, Upload } from "lucide-react";

const UploadCard = ({ title }) => {
    return (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 hover:border-indigo-300 transition">

            <label className="cursor-pointer flex flex-col items-center justify-center">

                <FileText
                    className="text-slate-400 mb-3"
                    size={26}
                />

                <span className="text-sm font-semibold text-slate-700">
                    {title}
                </span>

                <span className="mt-2 text-xs text-slate-400">
                    Drag & Drop or Click to Upload
                </span>

                <div className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
                    <Upload size={14} className="inline mr-1" />
                    Upload
                </div>

                <input
                    type="file"
                    className="hidden"
                />

            </label>

        </div>
    );
};

export default UploadCard;