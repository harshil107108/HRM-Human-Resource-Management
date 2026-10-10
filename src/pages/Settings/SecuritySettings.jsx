import { useEffect, useMemo, useCallback } from "react";
import HpCard from "@/components/common/HpCard";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useSecuritySettingsConfig from "./useSecuritySettingsConfig";
import { ShieldCheck, Save, RefreshCw } from "lucide-react";

const SecuritySettings = () => {
    const { passwordPolicySchema, sessionPolicySchema, securitySchema, initialValue } = useSecuritySettingsConfig();
    const { apiCall, isPending } = useApiCall();
    const { successAlert, errorAlert } = useAlert();

    const formmethod = useMemo(() => {
        return formMethod.createForm({
            schema: securitySchema,
            initialValue,
        });
    }, [securitySchema, initialValue]);

    const fetchPolicies = useCallback(async () => {
        const res = await apiCall({
            id: "getSecuritySettings",
            api: api + apiEndpoints.systemSetting.getSystemSetting,
            payload: { category: "Security" },
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
        fetchPolicies();
    }, [fetchPolicies]);

    const handleSave = async () => {
        await formmethod.methods.handleFormSave(
            async (formData) => {
                const res = await apiCall({
                    id: "saveSecuritySettings",
                    api: api + apiEndpoints.systemSetting.addEditSystemSetting,
                    payload: {
                        category: "Security",
                        settings: formData,
                    },
                });

                if (!res?.success) {
                    throw new Error(res?.message || "Failed to save Security Policies");
                }
                return res;
            },
            {
                onSuccess: () => {
                    successAlert({
                        title: "Policies Saved",
                        text: "Password governance and session access policies updated successfully.",
                    });
                },
                onError: (err) => {
                    errorAlert({
                        title: "Save Failed",
                        text: err?.message || "Could not save security settings. Please try again.",
                    });
                },
            }
        );
    };

    const isSaving = isPending("saveSecuritySettings");
    const isLoading = isPending("getSecuritySettings");

    useDocumentTitle("orvexa | Security Settings");

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Security & Authentication Policies</h1>
                        <p className="text-sm text-gray-500">Configure password complexity rules, multi-factor authentication, and session controls</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchPolicies}
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
                        {isSaving ? "Saving..." : "Save Policies"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HpCard title="Password Governance & Complexity">
                    <div className="p-2">
                        <FormRenderer formMethod={formmethod} formSchema={passwordPolicySchema} />
                    </div>
                </HpCard>

                <HpCard title="Session Lifetime & Access Controls">
                    <div className="p-2">
                        <FormRenderer formMethod={formmethod} formSchema={sessionPolicySchema} />
                    </div>
                </HpCard>
            </div>
        </div>
    );
};

export default SecuritySettings;
