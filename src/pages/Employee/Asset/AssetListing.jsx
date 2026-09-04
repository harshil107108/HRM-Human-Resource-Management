import { HpGrid } from "@/hp-grid/src";
import { useLocation, useNavigate } from "react-router-dom";
import useAssetConfig from "./useAssetConfig";
import useAlert from "@/hooks/useAlert";
import { useState, useEffect, useMemo } from "react";
import { api, apiEndpoints } from "@/api/api";
import useApiCall from "@/hooks/useApiCall";
import { formatDateForInput } from "@/utils/dateUtils";
import AssetCard from "./AssetCard";

const AssetListing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { deleteAlert, successAlert } = useAlert();
  const { apiCall } = useApiCall();

  const [AssetListingData, setAssetListingData] = useState([]);

  const handleDelete = async (id) => {
    deleteAlert({
      title: "Delete Asset?",
      text: "Are you sure you want to delete this Asset? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",

      onClick: async () => {
        const res = await apiCall({
          id: "deleteAsset",
          api: api + apiEndpoints.asset.asset.AssetDeleteByID,
          payload: {
            _id: id,
          },
        });

        if (res?.success) {
          successAlert({
            title: "Asset deleted",
            text: "Asset has been deleted successfully.",
          });

          getAssetListing();
        }
      },
    });
  };

  const { assetListingColDef } = useAssetConfig({
    handleDelete,
  });

  const handleAdd = () => {
    navigate(`${location.pathname}/addedit`, {
      state: {
        assetid: null,
      },
    });
  };

  const handleDoubleClick = (params) => {
    const { data } = params;

    navigate(`${location.pathname}/addedit`, {
      state: {
        assetid: data?._id,
      },
    });
  };

  const getAssetListing = async () => {
    const res = await apiCall({
      id: "getAssetListing",
      api: api + apiEndpoints.asset.asset.AssetGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res?.data?.data || [];

      const formattedData = data.map((item) => ({
        ...item,

        assetName: item?.assetName || "",
        assetCode: item?.assetCode || "",

        categoryName: item?.categoryId?.categoryName || "",

        assetTag: item?.assetTag || "",
        serialNumber: item?.serialNumber || "",
        brand: item?.brand || "",
        model: item?.model || "",

        employeeName: [
          item?.employeeId?.firstName,
          item?.employeeId?.middleName,
          item?.employeeId?.lastName,
        ]
          .filter(Boolean)
          .join(" "),

        companyName: item?.companyId?.companyName || "",

        branchName: item?.branchId?.branchname || "",

        purchaseDate: formatDateForInput(item?.purchaseDate) || "",

        warrantyEndDate: formatDateForInput(item?.warrantyEndDate) || "",

        assetStatus: item?.assetStatus || "",
      }));

      setAssetListingData(formattedData);
    }
  };

  useEffect(() => {
    getAssetListing();
  }, []);

  const assetSummary = useMemo(() => {
    const getStatusCount = (status) => {
      return AssetListingData.filter(
        (item) => item?.assetStatus?.toLowerCase() === status.toLowerCase(),
      ).length;
    };

    return [
      {
        id: "totalAssets",
        title: "TOTAL ASSETS",
        value: AssetListingData.length.toLocaleString(),
        icon: "▣",
        description: "Total assets",
        type: "total",
      },
      {
        id: "available",
        title: "AVAILABLE",
        value: getStatusCount("Available").toLocaleString(),
        icon: "✓",
        description: "Ready for deployment",
        type: "available",
      },
      {
        id: "assigned",
        title: "ASSIGNED",
        value: getStatusCount("Assigned").toLocaleString(),
        icon: "♙",
        description: "Currently assigned",
        type: "assigned",
      },
      {
        id: "underRepair",
        title: "UNDER REPAIR",
        value: getStatusCount("Under Repair").toLocaleString(),
        icon: "🔧",
        description: "Service tickets active",
        type: "repair",
      },
      {
        id: "lost",
        title: "LOST",
        value: getStatusCount("Lost").toLocaleString(),
        icon: "♧",
        description: "Requires review",
        type: "lost",
      },
      {
        id: "disposed",
        title: "DISPOSED",
        value: getStatusCount("Disposed").toLocaleString(),
        icon: "▣",
        description: "Decommissioned",
        type: "disposed",
      },
    ];
  }, [AssetListingData]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="grid grid-cols-6 gap-2.5 mt-3">
        {assetSummary.map((item) => (
          <AssetCard key={item.id} {...item} />
        ))}
      </div>

      <div className="min-h-0 flex-1">
        <HpGrid
          id="assetListing"
          title="Asset"
          rowData={AssetListingData}
          colDef={assetListingColDef}
          style={{ height: "100%" }}
          onAddClick={handleAdd}
          onDoubleClick={handleDoubleClick}
        />
      </div>
    </div>
  );
};

export default AssetListing;
