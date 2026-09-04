const PermissionCard = ({
    title,
    description,
    checked,
    onChange,
}) => {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50">

            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />

            <div>

                <h4 className="text-sm font-semibold text-slate-800">
                    {title}
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                </p>

            </div>

        </label>
    );
};

export default PermissionCard