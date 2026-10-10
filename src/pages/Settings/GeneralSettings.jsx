import { useEffect, useMemo, useCallback } from "react";
import HpCard from "@/components/common/HpCard";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useGeneralSettingsConfig from "./useGeneralSettingsConfig";
import { Settings, Save, RefreshCw } from "lucide-react";

const GeneralSettings = () => {
    const { orgInfoSchema, localeSchema, generalSchema, initialValue } = useGeneralSettingsConfig();
    const { apiCall, isPending } = useApiCall();
    const { successAlert, errorAlert } = useAlert();

    const formmethod = useMemo(() => {
        return formMethod.createForm({
            schema: generalSchema,
            initialValue,
        });
    }, [generalSchema, initialValue]);

    const fetchSettings = useCallback(async () => {
        const res = await apiCall({
            id: "getGeneralSettings",
            api: api + apiEndpoints.systemSetting.getSystemSetting,
            payload: { category: "General" },
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
        fetchSettings();
    }, [fetchSettings]);

    const handleSave = async () => {
        await formmethod.methods.handleFormSave(
            async (formData) => {
                const res = await apiCall({
                    id: "saveGeneralSettings",
                    api: api + apiEndpoints.systemSetting.addEditSystemSetting,
                    payload: {
                        category: "General",
                        settings: formData,
                    },
                });

                if (!res?.success) {
                    throw new Error(res?.message || "Failed to save General Settings");
                }
                return res;
            },
            {
                onSuccess: () => {
                    successAlert({
                        title: "Settings Saved",
                        text: "General organizational and localization preferences saved successfully.",
                    });
                },
                onError: (err) => {
                    errorAlert({
                        title: "Save Failed",
                        text: err?.message || "Could not save settings. Please try again.",
                    });
                },
            }
        );
    };

    const isSaving = isPending("saveGeneralSettings");
    const isLoading = isPending("getGeneralSettings");

    useDocumentTitle("orvexa | General Settings");

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">General Settings</h1>
                        <p className="text-sm text-gray-500">Corporate identity, localized defaults, time zone, and fiscal rules</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchSettings}
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
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <HpCard title="Organization Information">
                    <div className="p-2">
                        <FormRenderer formMethod={formmethod} formSchema={orgInfoSchema} />
                    </div>
                </HpCard>

                <HpCard title="Localization & Regional Preferences">
                    <div className="p-2">
                        <FormRenderer formMethod={formmethod} formSchema={localeSchema} />
                    </div>
                </HpCard>
            </div>
        </div>
    );
};

export default GeneralSettings;
