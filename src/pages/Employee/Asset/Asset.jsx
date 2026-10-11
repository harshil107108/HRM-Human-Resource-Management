import { useState, useMemo, useEffect } from "react";
import { formMethod, FormRenderer } from "@/form-engine";
import { Image, Upload } from "lucide-react";

import HpFooter from "@/hooks/HpFooter";
import HpHeader from "@/hooks/HpHeader";
import useAssetConfig, { ASSIGNMENT_FIELDS } from "./useAssetConfig";

import { useLocation, useNavigate } from "react-router-dom";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";
import useAlert from "@/hooks/useAlert";
import UploadCard from "@/components/layout/UploadCard";
import { getUploadUrl, getUploadName } from "@/utils/fileUpload";
import { HpImagePreview } from "@/components/feedback";

const Asset = () => {
  const locationData = useLocation();
  const AssetId = locationData.state?.assetid;

  const navigate = useNavigate();
  const { apiCall } = useApiCall();
  const { successAlert, warningAlert } = useAlert();

  const [assetImage, setAssetImage] = useState(null);
  const [assetImagePreview, setAssetImagePreview] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [documents, setDocuments] = useState({
    purchaseInvoice: {
      file: null,
      url: null,
      name: null,
    },

    warrantyDocument: {
      file: null,
      url: null,
      name: null,
    },

    otherDocument: {
      file: null,
      url: null,
      name: null,
    },
  });

  const {
    basicInformationSchema,
    assetDetailsSchema,
    purchaseInformationSchema,
    organizationInformationSchema,
    assignmentInformationSchema,
    additionalInformationSchema,
  } = useAssetConfig();

  const generateEmployeeId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const initialValue = {
    assetCode: generateEmployeeId(),
  };

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [
        ...basicInformationSchema,
        ...assetDetailsSchema,
        ...purchaseInformationSchema,
        ...organizationInformationSchema,
        ...assignmentInformationSchema,
        ...additionalInformationSchema,
      ],
      initialValue,
    });
  }, []);

  // End dates can't be earlier than their start dates: pass the start date
  // as the date picker's `min` so earlier days are disabled.
  const assignedDate = formmethod.methods.watch("assignedDate");
  const warrantyStartDate = formmethod.methods.watch("warrantyStartDate");

  const withMinDate = (schema, fieldId, min) =>
    schema.map((field) =>
      field.id === fieldId ? { ...field, min: min || undefined } : field,
    );

  const purchaseSchemaWithLimits = withMinDate(
    purchaseInformationSchema,
    "warrantyEndDate",
    warrantyStartDate,
  );
  // Employee / dates are only editable (and the first two required) while
  // the asset is ASSIGNED. The status field's onChange clears them otherwise.
  const isAssigned = formmethod.methods.watch("assetStatus") === "ASSIGNED";

  const assignmentSchemaWithLimits = withMinDate(
    assignmentInformationSchema,
    "expectedReturnDate",
    assignedDate,
  ).map((field) =>
    ASSIGNMENT_FIELDS.includes(field.id)
      ? {
          ...field,
          disabled: !isAssigned,
          required: isAssigned && field.id !== "expectedReturnDate",
        }
      : field,
  );

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      warningAlert({
        title: "Invalid Image Type",
        text: "Please upload a JPG, JPEG, PNG or WEBP image.",
      });
      e.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      warningAlert({
        title: "Image Too Large",
        text: "Image size must be less than 2 MB.",
      });
      e.target.value = "";
      return;
    }

    if (assetImagePreview) {
      URL.revokeObjectURL(assetImagePreview);
    }

    setAssetImage(file);

    const previewUrl = URL.createObjectURL(file);

    setAssetImagePreview(previewUrl);
  };

  const handleImageRemove = () => {
    if (assetImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(assetImagePreview);
    }

    setAssetImage(null);
    setAssetImagePreview(null);
  };

  const handleDocumentChange = (name, file) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",

      "application/pdf",

      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowedTypes.includes(file.type)) {
      warningAlert({
        title: "Invalid File Type",
        text: "Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG or WEBP files are allowed.",
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      warningAlert({
        title: "File Too Large",
        text: "File size must be less than 10 MB.",
      });
      return;
    }

    setDocuments((prev) => ({
      ...prev,

      [name]: {
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      },
    }));
  };

  const handleDocumentRemove = (name) => {
    const currentFile = documents[name]?.url;

    if (currentFile?.startsWith("blob:")) {
      URL.revokeObjectURL(currentFile);
    }

    setDocuments((prev) => ({
      ...prev,

      [name]: {
        file: null,
        url: null,
        name: null,
      },
    }));
  };

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (
            key === "assetImage" ||
            key === "purchaseInvoice" ||
            key === "warrantyDocument" ||
            key === "otherDocument"
          ) {
            return;
          }

          if (value !== undefined && value !== null && value !== "") {
            // Skip non-file objects
            if (typeof value === "object" && !(value instanceof File)) {
              return;
            }

            formData.append(key, value);
          }
        });

        if (AssetId) {
          formData.append("_id", AssetId);
        }

        if (assetImage instanceof File) {
          formData.append("assetImage", assetImage);
        }

        if (documents.purchaseInvoice?.file instanceof File) {
          formData.append("purchaseInvoice", documents.purchaseInvoice.file);
        }

        if (documents.warrantyDocument?.file instanceof File) {
          formData.append("warrantyDocument", documents.warrantyDocument.file);
        }

        if (documents.otherDocument?.file instanceof File) {
          formData.append("otherDocument", documents.otherDocument.file);
        }

        const res = await apiCall({
          id: "assetAddEdit",
          api: api + apiEndpoints.employee.asset.AssetAddEdit,
          payload: formData,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save Asset");
        }

        return res;
      },

      {
        onSuccess: async () => {
          successAlert({
            title: AssetId ? "Asset Updated" : "Asset Added",

            text: AssetId
              ? "Asset updated successfully."
              : "Asset added successfully.",
          });

          navigate(-1);
        },
      },
    );

    return result;
  };

  const getDataById = async () => {
    if (!AssetId) return;

    try {
      const res = await apiCall({
        id: "getAssetById",
        api: api + apiEndpoints.employee.asset.AssetGetByID,

        payload: {
          _id: AssetId,
        },
      });

      if (res?.success) {
        const data = res?.data?.data;
        if (!data) return;
        setAssetImagePreview(getUploadUrl(data.assetImage));
        setAssetImage(null);
        setDocuments({
          purchaseInvoice: {
            file: null,
            url: getUploadUrl(data.purchaseInvoice),
            name: getUploadName(data.purchaseInvoice),
          },

          warrantyDocument: {
            file: null,
            url: getUploadUrl(data.warrantyDocument),
            name: getUploadName(data.warrantyDocument),
          },

          otherDocument: {
            file: null,
            url: getUploadUrl(data.otherDocument),
            name: getUploadName(data.otherDocument),
          },
        });

        const finalData = {
          ...data,

          companyId: data.companyId?._id || "",
          branchId: data.branchId?._id || "",
          departmentId: data.departmentId?._id || "",
          designationId: data.designationId?._id || "",
          employeeId: data.employeeId?._id || "",
          purchaseDate: formatDateForInput(data?.purchaseDate),
          warrantyExpiryDate: formatDateForInput(data?.warrantyExpiryDate),
          warrantyStartDate: formatDateForInput(data?.warrantyStartDate),
          warrantyEndDate: formatDateForInput(data?.warrantyEndDate),
          assignedDate: formatDateForInput(data?.assignedDate),
          expectedReturnDate: formatDateForInput(data?.expectedReturnDate),
          assignedEmployee: data?.assignedEmployee?._id,
          company: data?.company?._id,
          department: data?.department?._id,
          branch: data?.branch?._id,
          assetName: data.assetName || "",
          assetCode: data.assetCode || "",
          assetType: data.assetType || "",
          serialNumber: data.serialNumber || "",

          purchasePrice: data.purchasePrice ?? "",
          vendorName: data.vendorName || "",

          status: data.status || "",

          description: data.description || "",
        };

        formmethod.methods.setValues(finalData);
      }
    } catch (error) {
      console.error("Get asset by ID error:", error);
    }
  };

  useEffect(() => {
    if (AssetId) {
      getDataById();
    }
  }, [AssetId]);

  const handleClear = () => {
    formmethod.methods.reset();
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="hp-company-page">
        <HpHeader title="Asset" className="hp-company-page__header" />

        <div className="hp-company-content mx-auto w-full max-w-7xl pt-6">
          <div className="mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Basic Information
              </h2>
            </div>

            <div className="p-4">
              <div className="mb-6 flex items-center gap-5">
                <div className="relative">
                  <div
                    className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 ${
                      assetImagePreview ? "cursor-pointer hover:opacity-90" : ""
                    }`}
                    onClick={() => {
                      if (assetImagePreview) {
                        setShowImageModal(true);
                      }
                    }}
                  >
                    {assetImagePreview ? (
                      <img
                        src={assetImagePreview}
                        alt="Asset"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image className="h-12 w-12 text-slate-400" />
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Asset Image
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    JPG, PNG or WEBP. Max size 2 MB.
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <Upload className="h-4 w-4" />
                      Upload New
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                      />
                    </label>

                    {assetImagePreview && (
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="text-xs font-semibold text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <FormRenderer
                formMethod={formmethod}
                formSchema={basicInformationSchema}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Asset Details
                </h2>
              </div>

              <div className="p-4">
                <FormRenderer
                  formMethod={formmethod}
                  formSchema={assetDetailsSchema}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Purchase Information
                </h2>
              </div>

              <div className="p-4">
                <FormRenderer
                  formMethod={formmethod}
                  formSchema={purchaseSchemaWithLimits}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Organization Information
                </h2>
              </div>

              <div className="p-4">
                <FormRenderer
                  formMethod={formmethod}
                  formSchema={organizationInformationSchema}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Asset Status
                </h2>
              </div>

              <div className="p-4">
                <FormRenderer
                  formMethod={formmethod}
                  formSchema={assignmentSchemaWithLimits}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mt-4 mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Documents
                </h2>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <UploadCard
                    title="Purchase Invoice"
                    name="purchaseInvoice"
                    file={documents.purchaseInvoice}
                    onChange={(file) =>
                      handleDocumentChange("purchaseInvoice", file)
                    }
                    onRemove={() => handleDocumentRemove("purchaseInvoice")}
                  />

                  <UploadCard
                    title="Warranty Document"
                    name="warrantyDocument"
                    file={documents.warrantyDocument}
                    onChange={(file) =>
                      handleDocumentChange("warrantyDocument", file)
                    }
                    onRemove={() => handleDocumentRemove("warrantyDocument")}
                  />

                  <UploadCard
                    title="Other Documents"
                    name="otherDocument"
                    file={documents.otherDocument}
                    onChange={(file) =>
                      handleDocumentChange("otherDocument", file)
                    }
                    onRemove={() => handleDocumentRemove("otherDocument")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 mb-4">
            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Additional Information
                </h2>
              </div>

              <div className="p-4">
                <FormRenderer
                  formMethod={formmethod}
                  formSchema={additionalInformationSchema}
                />
              </div>
            </div>
          </div>

          <HpFooter
            onBack={handleBack}
            onClear={handleClear}
            onSave={handleSave}
          />
        </div>
      </div>
      {showImageModal && assetImagePreview && (
        <HpImagePreview
          open
          src={assetImagePreview}
          alt="Asset"
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
};

export default Asset;
