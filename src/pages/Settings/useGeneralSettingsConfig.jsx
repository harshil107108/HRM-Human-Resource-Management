import { useMemo } from "react";

const useGeneralSettingsConfig = () => {
    const initialValue = useMemo(() => ({
        companyName: "Orvexa Enterprise",
        companyEmail: "admin@orvexa.io",
        phone: "+91 98765 43210",
        website: "https://orvexa.io",
        address: "Plot 42, Cyber Gateway, Tech Park, Bangalore, India",
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        currency: "INR (₹)",
        fiscalYear: "April - March",
    }), []);

    const orgInfoSchema = useMemo(() => [
        {
            id: "companyName",
            name: "companyName",
            label: "Company Legal Name",
            type: "text",
            placeHolder: "Enter company name",
            className: "col-span-12 md:col-span-6",
            required: true,
            rules: {
                required: "Company name is required",
            },
        },
        {
            id: "companyEmail",
            name: "companyEmail",
            label: "Official Email Address",
            type: "text",
            placeHolder: "admin@company.com",
            className: "col-span-12 md:col-span-6",
            required: true,
            rules: {
                required: "Official email is required",
            },
        },
        {
            id: "phone",
            name: "phone",
            label: "Corporate Phone",
            type: "text",
            placeHolder: "+91 98765 43210",
            className: "col-span-12 md:col-span-6",
        },
        {
            id: "website",
            name: "website",
            label: "Corporate Website URL",
            type: "text",
            placeHolder: "https://example.com",
            className: "col-span-12 md:col-span-6",
        },
        {
            id: "address",
            name: "address",
            label: "Headquarters Address",
            type: "textarea",
            placeHolder: "Enter full corporate registered address...",
            rows: 3,
            className: "col-span-12",
        },
    ], []);

    const localeSchema = useMemo(() => [
        {
            id: "timezone",
            name: "timezone",
            label: "System Timezone",
            type: "selectWrapper",
            placeHolder: "Select Timezone",
            className: "col-span-12 md:col-span-6",
            options: [
                { label: "Asia/Kolkata (IST +5:30)", value: "Asia/Kolkata" },
                { label: "UTC (Coordinated Universal Time)", value: "UTC" },
                { label: "America/New_York (EST -5:00)", value: "America/New_York" },
                { label: "America/Los_Angeles (PST -8:00)", value: "America/Los_Angeles" },
                { label: "Europe/London (GMT +0:00)", value: "Europe/London" },
                { label: "Europe/Berlin (CET +1:00)", value: "Europe/Berlin" },
                { label: "Asia/Dubai (GST +4:00)", value: "Asia/Dubai" },
                { label: "Asia/Singapore (SGT +8:00)", value: "Asia/Singapore" },
            ],
            required: true,
        },
        {
            id: "dateFormat",
            name: "dateFormat",
            label: "System Date Format",
            type: "selectWrapper",
            placeHolder: "Select Date Format",
            className: "col-span-12 md:col-span-6",
            options: [
                { label: "DD/MM/YYYY (e.g. 31/12/2026)", value: "DD/MM/YYYY" },
                { label: "MM/DD/YYYY (e.g. 12/31/2026)", value: "MM/DD/YYYY" },
                { label: "YYYY-MM-DD (e.g. 2026-12-31)", value: "YYYY-MM-DD" },
                { label: "DD-MMM-YYYY (e.g. 31-Dec-2026)", value: "DD-MMM-YYYY" },
            ],
            required: true,
        },
        {
            id: "currency",
            name: "currency",
            label: "Base Currency",
            type: "selectWrapper",
            placeHolder: "Select Currency",
            className: "col-span-12 md:col-span-6",
            options: [
                { label: "INR (₹) - Indian Rupee", value: "INR (₹)" },
                { label: "USD ($) - US Dollar", value: "USD ($)" },
                { label: "EUR (€) - Euro", value: "EUR (€)" },
                { label: "GBP (£) - British Pound", value: "GBP (£)" },
                { label: "AED (د.إ) - UAE Dirham", value: "AED (د.إ)" },
                { label: "SGD (S$) - Singapore Dollar", value: "SGD (S$)" },
            ],
            required: true,
        },
        {
            id: "fiscalYear",
            name: "fiscalYear",
            label: "Fiscal Year Cycle",
            type: "selectWrapper",
            placeHolder: "Select Fiscal Year Cycle",
            className: "col-span-12 md:col-span-6",
            options: [
                { label: "April - March (Standard India)", value: "April - March" },
                { label: "January - December (Calendar Year)", value: "January - December" },
                { label: "July - June (Mid-year Cycle)", value: "July - June" },
                { label: "October - September (US Fiscal)", value: "October - September" },
            ],
            required: true,
        },
    ], []);

    const generalSchema = useMemo(() => [
        ...orgInfoSchema,
        ...localeSchema,
    ], [orgInfoSchema, localeSchema]);

    return {
        initialValue,
        orgInfoSchema,
        localeSchema,
        generalSchema,
    };
};

export default useGeneralSettingsConfig;
