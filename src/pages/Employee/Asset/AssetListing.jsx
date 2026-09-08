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
  const { apiCall, isPending } = useApiCall();

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
          api: api + apiEndpoints.employee,
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

  const getAssetListing = async (assetStatus = "") => {
    const res = await apiCall({
      id: "getAssetListing",
      api: api + apiEndpoints.employee.asset.AssetGetData,
      payload: assetStatus
        ? {
            assetStatus,
          }
        : {},
    });

    if (res?.success) {
      const data = res?.data?.data || [];

      const formattedData = data.map((item) => ({
        ...item,

        assetName: item?.assetName || "",
        assetCode: item?.assetCode || "",

        categoryName: item?.assetCategory?.categoryName || "",

        assetTag: item?.assetTag || "",
        serialNumber: item?.serialNumber || "",
        brand: item?.brand || "",
        model: item?.model || "",

        assignedEmployee: [
          item?.assignedEmployee?.firstName,
          item?.assignedEmployee?.lastName,
        ]
          .filter(Boolean)
          .join(" "),

        companyName: item?.company?.companyName || "",
        branchname: item?.branch?.branchname || "",
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
        icon: "▣",
        type: "blue",
        status: "",
      },

      {
        id: "available",
        title: "Available",
        value: getStatusCount("AVAILABLE").toLocaleString(),
        icon: "✓",
        type: "green",
        status: "AVAILABLE",
      },

      {
        id: "assigned",
        title: "Assigned",
        value: getStatusCount("ASSIGNED").toLocaleString(),
        icon: "♙",
        type: "purple",
        status: "ASSIGNED",
      },

      {
        id: "underRepair",
        title: "Under Repair",
        value: getStatusCount("UNDER_REPAIR").toLocaleString(),
        icon: "🔧",
        type: "orange",
        status: "UNDER_REPAIR",
      },

      {
        id: "lost",
        title: "Lost",
        value: getStatusCount("LOST").toLocaleString(),
        icon: "!",
        type: "red",
        status: "LOST",
      },

      {
        id: "disposed",
        title: "Disposed",
        value: getStatusCount("DISPOSED").toLocaleString(),
        icon: "✓",
        type: "cyan",
        status: "DISPOSED",
      },
    ];
  }, [AssetListingData]);

  const handleStatusCardClick = (status) => {
    getAssetListing(status);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="grid grid-cols-6 gap-2.5 mt-3 mr-2">
        {assetSummary.map((item) => (
          <div
            key={item.id}
            onClick={() => handleStatusCardClick(item.status)}
            className="cursor-pointer"
          >
            <AssetCard {...item} />
          </div>
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
          panding={isPending("deleteAsset") || isPending("getAssetListing")}
        />
      </div>
    </div>
  );
};

export default AssetListing;
