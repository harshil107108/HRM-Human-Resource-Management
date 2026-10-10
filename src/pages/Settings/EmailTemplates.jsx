import { useEffect, useMemo, useCallback, useState } from "react";
import HpCard from "@/components/common/HpCard";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useEmailSettingsConfig, { DEFAULT_TEMPLATES } from "./useEmailSettingsConfig";
import { Mail, Save, RefreshCw } from "lucide-react";

const EmailTemplates = () => {
    const [templatesData, setTemplatesData] = useState(DEFAULT_TEMPLATES);

    const onTemplateChange = useCallback((selectedKey) => {
        const tpl = templatesData[selectedKey] || DEFAULT_TEMPLATES[selectedKey];
        if (tpl) {
            formmethod.methods.setValue("subject", tpl.subject);
            formmethod.methods.setValue("body", tpl.body);
        }
    }, [templatesData]);

    const { smtpSchema, templateSchema, emailConfigSchema, initialValue } = useEmailSettingsConfig({
        onTemplateChange,
    });
    const { apiCall, isPending } = useApiCall();
    const { successAlert, errorAlert } = useAlert();

    const formmethod = useMemo(() => {
        return formMethod.createForm({
            schema: emailConfigSchema,
            initialValue,
        });
    }, [emailConfigSchema, initialValue]);

    const fetchEmailSettings = useCallback(async () => {
        const res = await apiCall({
            id: "getEmailSettings",
            api: api + apiEndpoints.systemSetting.getSystemSetting,
            payload: { category: "Email" },
        });

        if (res?.success && res.data) {
            const raw = res.data?.data ?? res.data;
            const settingsData = raw?.settings || raw?.value || raw || {};
            const mergedTemplates = {
                ...DEFAULT_TEMPLATES,
                ...(settingsData?.templates || {}),
            };
            setTemplatesData(mergedTemplates);

            const currentKey = settingsData.templateKey || "welcome_employee";
            const currentTpl = mergedTemplates[currentKey] || DEFAULT_TEMPLATES[currentKey];

            formmethod.methods.setFormData({
                ...initialValue,
                ...settingsData,
                templateKey: currentKey,
                subject: currentTpl.subject,
                body: currentTpl.body,
            });
        }
    }, [apiCall, formmethod, initialValue]);

    useEffect(() => {
        fetchEmailSettings();
    }, [fetchEmailSettings]);

    const handleSave = async () => {
        await formmethod.methods.handleFormSave(
            async (formData) => {
                const currentKey = formData.templateKey || "welcome_employee";
                const updatedTemplates = {
                    ...templatesData,
                    [currentKey]: {
                        ...(templatesData[currentKey] || DEFAULT_TEMPLATES[currentKey]),
                        subject: formData.subject,
                        body: formData.body,
                    },
                };
                setTemplatesData(updatedTemplates);

                const res = await apiCall({
                    id: "saveEmailSettings",
                    api: api + apiEndpoints.systemSetting.addEditSystemSetting,
                    payload: {
                        category: "Email",
                        settings: {
                            smtpHost: formData.smtpHost,
                            smtpPort: formData.smtpPort,
                            senderEmail: formData.senderEmail,
                            senderName: formData.senderName,
                            enableSsl: formData.enableSsl,
                            templateKey: currentKey,
                            templates: updatedTemplates,
                        },
                    },
                });

                if (!res?.success) {
                    throw new Error(res?.message || "Failed to save Email Configuration");
                }
                return res;
            },
            {
                onSuccess: () => {
                    successAlert({
                        title: "Email Settings Saved",
                        text: "SMTP transport credentials and email templates updated successfully.",
                    });
                },
                onError: (err) => {
                    errorAlert({
                        title: "Save Failed",
                        text: err?.message || "Could not save email settings. Please try again.",
                    });
                },
            }
        );
    };

    const isSaving = isPending("saveEmailSettings");
    const isLoading = isPending("getEmailSettings");

    useDocumentTitle("orvexa | Email & SMTP Settings");

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Email & SMTP Configuration</h1>
                        <p className="text-sm text-gray-500">Configure SMTP relay servers and customize automated notification message templates</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchEmailSettings}
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
                        {isSaving ? "Saving..." : "Save Configuration"}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <HpCard title="Corporate SMTP Gateway Credentials">
                    <div className="p-2">
                        <FormRenderer formMethod={formmethod} formSchema={smtpSchema} />
                    </div>
                </HpCard>

                <HpCard title="Automated Message Template Designer">
                    <div className="p-2">
                        <FormRenderer formMethod={formmethod} formSchema={templateSchema} />
                    </div>
                </HpCard>
            </div>
        </div>
    );
};

export default EmailTemplates;
