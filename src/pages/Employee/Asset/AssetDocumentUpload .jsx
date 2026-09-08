import { FileText, Upload } from "lucide-react";

const AssetDocumentUpload = ({ title, name, file, onChange, onRemove }) => {
  return (
    <div className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-[#cbd5e1] bg-[#fafcfd] p-4">
      <FileText className="mb-3 h-9 w-9 text-[#94a3b8]" />

      <h3 className="text-sm font-semibold text-[#334155]">{title}</h3>

      {file?.name ? (
        <p className="mt-2 max-w-full truncate px-3 text-xs text-slate-500">
          {file.name}
        </p>
      ) : (
        <p className="mt-1 text-xs text-[#94a3b8]">
          Drag & Drop or Click to Upload
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#4f46e5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4338ca]">
          <Upload className="h-3.5 w-3.5" />

          {file?.name ? "Change" : "Upload"}

          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
            onChange={(e) => {
              onChange(e.target.files?.[0]);

              // allow selecting same file again
              e.target.value = "";
            }}
          />
        </label>

        {file?.name && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-semibold text-red-500"
          >
            Remove
          </button>
        )}
      </div>

      {file?.url && (
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
        >
          View File
        </a>
      )}
    </div>
  );
};

export default AssetDocumentUpload;
