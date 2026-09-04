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
        title: "Total Assets",
        value: AssetListingData.length.toLocaleString(),
        percentage: "↑ 12%",
        description: "vs last month",
        icon: "▣",
        type: "blue",
      },

      {
        id: "available",
        title: "Available",
        value: getStatusCount("Available").toLocaleString(),
        percentage: "↑ 26%",
        description: "vs last month",
        icon: "✓",
        type: "green",
      },

      {
        id: "assigned",
        title: "Assigned",
        value: getStatusCount("Assigned").toLocaleString(),
        percentage: "↑ 63%",
        description: "vs last month",
        icon: "♙",
        type: "purple",
      },

      {
        id: "underRepair",
        title: "Under Repair",
        value: getStatusCount("Under Repair").toLocaleString(),
        percentage: "↑ 8%",
        description: "vs last month",
        icon: "🔧",
        type: "orange",
      },

      {
        id: "lost",
        title: "Lost",
        value: getStatusCount("Lost").toLocaleString(),
        percentage: "↓ 11%",
        description: "vs last month",
        icon: "!",
        type: "red",
      },

      {
        id: "disposed",
        title: "Disposed",
        value: getStatusCount("Disposed").toLocaleString(),
        percentage: "↑ 15%",
        description: "vs last month",
        icon: "✓",
        type: "cyan",
      },
    ];
  }, [AssetListingData]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="grid grid-cols-6 gap-2.5 mt-3 mr-2">
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
