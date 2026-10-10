import { useEffect, useMemo, useCallback } from "react";
import HpCard from "@/components/common/HpCard";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useIntegrationSettingsConfig from "./useIntegrationSettingsConfig";
import { Link2, Save, RefreshCw } from "lucide-react";

const IntegrationSettings = () => {
    const { hardwareSyncSchema, cloudAndMessagingSchema, integrationSchema, initialValue } = useIntegrationSettingsConfig();
    const { apiCall, isPending } = useApiCall();
    const { successAlert, errorAlert } = useAlert();

    const formmethod = useMemo(() => {
        return formMethod.createForm({
            schema: integrationSchema,
            initialValue,
        });
    }, [integrationSchema, initialValue]);

    const fetchIntegrations = useCallback(async () => {
        const res = await apiCall({
            id: "getIntegrationSettings",
            api: api + apiEndpoints.systemSetting.getSystemSetting,
            payload: { category: "Integrations" },
        });

        if (res?.success && res.data) {
            const raw = res.data?.data ?? res.data;
            const settingsData = raw?.settings || raw?.value || raw || {};
            formmethod.methods.setFormData({
                ...initialValue,
                ...settingsData,
            });
        }
    }, [apiCall, formmethod, initialValue]);

    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);

    const handleSave = async () => {
        await formmethod.methods.handleFormSave(
            async (formData) => {
                const res = await apiCall({
                    id: "saveIntegrationSettings",
                    api: api + apiEndpoints.systemSetting.addEditSystemSetting,
                    payload: {
                        category: "Integrations",
                        settings: formData,
                    },
                });

                if (!res?.success) {
                    throw new Error(res?.message || "Failed to save Integration Settings");
                }
                return res;
            },
            {
                onSuccess: () => {
                    successAlert({
                        title: "Integrations Saved",
                        text: "Connected device, cloud, and messaging webhook endpoints updated successfully.",
                    });
                },
                onError: (err) => {
                    errorAlert({
                        title: "Save Failed",
                        text: err?.message || "Could not save integration settings. Please try again.",
                    });
                },
            }
        );
    };

    const isSaving = isPending("saveIntegrationSettings");
    const isLoading = isPending("getIntegrationSettings");

    useDocumentTitle("orvexa | Integrations & Services");

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Link2 size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Connected Services & Integrations</h1>
                        <p className="text-sm text-gray-500">Configure biometric clocks, cloud storage buckets, and workspace messaging bots</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchIntegrations}
                        disabled={isLoading || isSaving}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                    >
                        <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                    >
                        <Save size={16} />
                        {isSaving ? "Saving..." : "Save Endpoints"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HpCard title="Biometric Clock & Calendar Sync">
                    <div className="p-2">
                        <FormRenderer formMethod={formmethod} formSchema={hardwareSyncSchema} />
                    </div>
                </HpCard>

                <HpCard title="Slack Bots & AWS S3 Cloud Storage">
                    <div className="p-2">
                        <FormRenderer formMethod={formmethod} formSchema={cloudAndMessagingSchema} />
                    </div>
                </HpCard>
            </div>
        </div>
    );
};

export default IntegrationSettings;
