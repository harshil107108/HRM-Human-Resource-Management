import { useMemo } from "react";

const useIntegrationSettingsConfig = () => {
    const initialValue = useMemo(() => ({
        biometricEnabled: true,
        biometricApiUrl: "http://192.168.1.50:8080/cams",
        biometricPort: 4370,
        slackEnabled: true,
        slackWebhook: "https://hooks.slack.com/services/orvexa/notifications",
        slackChannel: "#hrm-approvals",
        s3Enabled: true,
        s3BucketName: "hrm-prod-documents-eu-west-1",
        s3Region: "eu-west-1",
        googleCalendarSync: true,
    }), []);

    const hardwareSyncSchema = useMemo(() => [
        {
            id: "biometricEnabled",
            name: "biometricEnabled",
            label: "Activate Biometric Attendance Polling",
            description: "Automatically stream check-in/out timestamps from on-premise biometric clocks",
            type: "checkbox",
            className: "col-span-12",
        },
        {
            id: "biometricApiUrl",
            name: "biometricApiUrl",
            label: "Biometric Device Endpoint / IP URL",
            type: "text",
            placeHolder: "http://192.168.1.200:4370",
            className: "col-span-12 md:col-span-8",
        },
        {
            id: "biometricPort",
            name: "biometricPort",
            label: "Device Port",
            type: "number",
            placeHolder: "4370",
            className: "col-span-12 md:col-span-4",
        },
        {
            id: "googleCalendarSync",
            name: "googleCalendarSync",
            label: "Google Calendar & Meet Sync",
            description: "Synchronize approved leaves, company holidays, and interview slots with Google Calendar",
            type: "checkbox",
            className: "col-span-12",
        },
    ], []);

    const cloudAndMessagingSchema = useMemo(() => [
        {
            id: "slackEnabled",
            name: "slackEnabled",
            label: "Enable Slack App Bot Integrations",
            description: "Post instant approvals and announcements directly into Slack channels",
            type: "checkbox",
            className: "col-span-12",
        },
        {
            id: "slackWebhook",
            name: "slackWebhook",
            label: "Incoming Slack Webhook URL",
            type: "text",
            placeHolder: "https://hooks.slack.com/services/...",
            className: "col-span-12 md:col-span-8",
        },
        {
            id: "slackChannel",
            name: "slackChannel",
            label: "Default Channel",
            type: "text",
            placeHolder: "#hrm-approvals",
            className: "col-span-12 md:col-span-4",
        },
        {
            id: "s3Enabled",
            name: "s3Enabled",
            label: "Cloud Storage (AWS S3) Document Archival",
            description: "Offload employee KYC proofs, resumes, and signed offer PDFs to cloud storage",
            type: "checkbox",
            className: "col-span-12",
        },
        {
            id: "s3BucketName",
            name: "s3BucketName",
            label: "S3 Bucket Name",
            type: "text",
            placeHolder: "my-hrm-documents",
            className: "col-span-12 md:col-span-8",
        },
        {
            id: "s3Region",
            name: "s3Region",
            label: "AWS Region",
            type: "text",
            placeHolder: "ap-south-1",
            className: "col-span-12 md:col-span-4",
        },
    ], []);

    const integrationSchema = useMemo(() => [
        ...hardwareSyncSchema,
        ...cloudAndMessagingSchema,
    ], [hardwareSyncSchema, cloudAndMessagingSchema]);

    return {
        initialValue,
        hardwareSyncSchema,
        cloudAndMessagingSchema,
        integrationSchema,
    };
};

export default useIntegrationSettingsConfig;
