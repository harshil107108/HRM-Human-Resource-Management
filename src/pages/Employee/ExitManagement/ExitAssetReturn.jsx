import { useEffect, useState } from "react";
import { Laptop, PackageCheck, AlertTriangle } from "lucide-react";
import Toggle from "@/hooks/Toogle";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDate } from "@/utils/dateUtils";

/**
 * Asset return checklist for an exiting employee.
 *
 * Lists the assets currently ASSIGNED to `employeeId`. Each one has a
 * "returned" toggle; the selected ids are reported through `onChange` and
 * sent with the exit record. The backend marks them AVAILABLE on save.
 *
 * `returnedHistory` is the exit record's returnedAssets (edit mode), shown
 * read-only so it's clear what was already handed back. `readOnly` shows
 * only that history (used once the exit is Completed).
 *
 * `onAssetsLoaded` receives the current assigned-asset list so the parent can
 * check that everything is returned before completing the exit.
 */
const ExitAssetReturn = ({
  employeeId,
  selectedIds,
  onChange,
  onAssetsLoaded,
  returnedHistory = [],
  readOnly = false,
}) => {
  const { apiCall } = useApiCall();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadAssets = async () => {
      if (!employeeId) {
        setAssets([]);
        setLoadError("");
        onAssetsLoaded?.([]);
        return;
      }

      setLoading(true);
      setLoadError("");
      const res = await apiCall({
        // Same id: a newer request aborts the previous one.
        id: "getAssetsByEmployee",
        api: api + apiEndpoints.employee.asset.AssetsByEmployee,
        payload: { employeeId },
        silent: true,
      });

      if (cancelled || res?.aborted) return;
      setLoading(false);

      if (res?.success) {
        const list = res.data?.data || [];
        setAssets(list);
        onAssetsLoaded?.(list);
        // Drop selections that aren't in this employee's list.
        const validIds = new Set(list.map((a) => a._id));
        const kept = (selectedIds || []).filter((id) => validIds.has(id));
        if (kept.length !== (selectedIds || []).length) onChange(kept);
      } else {
        setAssets([]);
        onAssetsLoaded?.([]);
        setLoadError("Couldn't load assigned assets. Close and reopen to try again.");
      }
    };

    loadAssets();
    return () => {
      cancelled = true;
    };
    // selectedIds/onChange are read only to prune after a load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, apiCall]);

  const selected = new Set(selectedIds || []);
  const allSelected = assets.length > 0 && assets.every((a) => selected.has(a._id));
  const pendingCount = assets.filter((a) => !selected.has(a._id)).length;

  const toggleAsset = (assetId, checked) => {
    const next = new Set(selected);
    if (checked) next.add(assetId);
    else next.delete(assetId);
    onChange([...next]);
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : assets.map((a) => a._id));
  };

  const describe = (asset) =>
    [
      asset.assetCode && `Code ${asset.assetCode}`,
      asset.assetTag && `Tag ${asset.assetTag}`,
      asset.serialNumber && `SN ${asset.serialNumber}`,
      asset.assignedDate && `Assigned ${formatDate(asset.assignedDate)}`,
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-[#dce3e7] bg-white">
      <div className="flex h-10 items-center justify-between border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
        <div className="flex items-center">
          <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />
          <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
            Asset Return
          </h2>
          {assets.length > 0 && (
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {selected.size}/{assets.length} returned
            </span>
          )}
        </div>

        {assets.length > 1 && (
          <button
            type="button"
            onClick={toggleAll}
            className="text-[12px] font-semibold text-sky-700 hover:text-sky-900"
          >
            {allSelected ? "Unmark all" : "Mark all returned"}
          </button>
        )}
      </div>

      <div className="px-4 pb-4">
        {readOnly && returnedHistory.length === 0 && (
          <p className="pt-4 text-xs text-slate-500">No assets were returned during this exit.</p>
        )}

        {!readOnly && !employeeId && (
          <p className="pt-4 text-xs text-slate-500">
            Select an employee to see the assets assigned to them.
          </p>
        )}

        {employeeId && loading && (
          <p className="pt-4 text-xs text-slate-500">Loading assigned assets…</p>
        )}

        {employeeId && !loading && loadError && (
          <p className="pt-4 text-xs font-medium text-red-600">{loadError}</p>
        )}

        {employeeId && !loading && !loadError && assets.length === 0 && (
          <p className="pt-4 text-xs text-slate-500">
            No assets are currently assigned to this employee.
          </p>
        )}

        {!loading &&
          assets.map((asset) => (
            <Toggle
              key={asset._id}
              name={`returnAsset-${asset._id}`}
              value={selected.has(asset._id)}
              onChange={(checked) => toggleAsset(asset._id, checked)}
              title={asset.assetName || "Unnamed asset"}
              description={describe(asset) || "Assigned asset"}
              icon={<Laptop className="h-4 w-4" />}
            />
          ))}

        {!loading && pendingCount > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            {pendingCount} asset{pendingCount > 1 ? "s" : ""} still with the employee.
            Returned assets are marked Available when you save.
          </p>
        )}

        {returnedHistory.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Already returned
            </p>
            <ul className="space-y-1.5">
              {returnedHistory.map((item, index) => (
                <li
                  key={`${item.asset}-${index}`}
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-medium text-slate-700">
                    {item.assetName || "Asset"}
                  </span>
                  {item.assetCode && <span className="text-slate-400">({item.assetCode})</span>}
                  <span className="ml-auto text-slate-400">{formatDate(item.returnedDate)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExitAssetReturn;
