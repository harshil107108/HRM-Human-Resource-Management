import { useEffect, useMemo, useCallback } from "react";
import HpCard from "@/components/common/HpCard";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useNotificationSettingsConfig from "./useNotificationSettingsConfig";
import { Bell, Save, RefreshCw } from "lucide-react";

const NotificationSettings = () => {
    const { emailNotificationSchema, inAppNotificationSchema, notificationSchema, initialValue } = useNotificationSettingsConfig();
    const { apiCall, isPending } = useApiCall();
    const { successAlert, errorAlert } = useAlert();

    const formmethod = useMemo(() => {
        return formMethod.createForm({
            schema: notificationSchema,
            initialValue,
        });
    }, [notificationSchema, initialValue]);

    const fetchPreferences = useCallback(async () => {
        const res = await apiCall({
            id: "getNotificationSettings",
            api: api + apiEndpoints.systemSetting.getSystemSetting,
            payload: { category: "Notifications" },
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
        fetchPreferences();
    }, [fetchPreferences]);

    const handleSave = async () => {
        await formmethod.methods.handleFormSave(
            async (formData) => {
                const res = await apiCall({
                    id: "saveNotificationSettings",
                    api: api + apiEndpoints.systemSetting.addEditSystemSetting,
                    payload: {
                        category: "Notifications",
                        settings: formData,
                    },
                });

                if (!res?.success) {
                    throw new Error(res?.message || "Failed to save Notification Settings");
                }
                return res;
            },
            {
                onSuccess: () => {
                    successAlert({
                        title: "Preferences Saved",
                        text: "Notification triggers and dispatch preferences updated successfully.",
                    });
                },
                onError: (err) => {
                    errorAlert({
                        title: "Save Failed",
                        text: err?.message || "Could not save notification preferences. Please try again.",
                    });
                },
            }
        );
    };

    const isSaving = isPending("saveNotificationSettings");
    const isLoading = isPending("getNotificationSettings");

    useDocumentTitle("orvexa | Notification Settings");

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Notification Settings</h1>
                        <p className="text-sm text-gray-500">Manage transactional emails, system alerts, and in-app notification triggers</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchPreferences}
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
                        {isSaving ? "Saving..." : "Save Preferences"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HpCard title="Automated Email Notifications">
                    <div className="p-2">
                        <FormRenderer formMethod={formmethod} formSchema={emailNotificationSchema} />
                    </div>
                </HpCard>

                <HpCard title="In-App Real-time Alerts & Broadcasts">
                    <div className="p-2">
                        <FormRenderer formMethod={formmethod} formSchema={inAppNotificationSchema} />
                    </div>
                </HpCard>
            </div>
        </div>
    );
};

export default NotificationSettings;
