import { useMemo } from "react";

const useNotificationSettingsConfig = () => {
    const initialValue = useMemo(() => ({
        emailAlerts: true,
        emailOnLeaveApply: true,
        emailOnLeaveDecision: true,
        emailOnPayslipRelease: true,
        emailOnInterviewScheduled: true,
        emailOnOfferLetterSent: true,
        inAppAttendanceAlerts: true,
        inAppPerformanceReminders: true,
        inAppSystemAnnouncements: true,
        dailyDigestEmail: false,
        announcementSound: false,
    }), []);

    const emailNotificationSchema = useMemo(() => [
        {
            id: "emailAlerts",
            name: "emailAlerts",
            label: "Master Email Dispatch",
            description: "Enable or pause all automated transactional email deliveries across the platform",
            type: "checkbox",
            className: "col-span-12",
        },
        {
            id: "emailOnLeaveApply",
            name: "emailOnLeaveApply",
            label: "Leave Application Notices",
            description: "Notify line managers and HR whenever an employee submits a leave request",
            type: "checkbox",
            className: "col-span-12 md:col-span-6",
        },
        {
            id: "emailOnLeaveDecision",
            name: "emailOnLeaveDecision",
            label: "Leave Decision Updates",
            description: "Notify applicants as soon as their leave request is approved or rejected",
            type: "checkbox",
            className: "col-span-12 md:col-span-6",
        },
        {
            id: "emailOnPayslipRelease",
            name: "emailOnPayslipRelease",
            label: "Monthly Payslip Releases",
            description: "Alert employees with disbursement summaries when monthly payslips are issued",
            type: "checkbox",
            className: "col-span-12 md:col-span-6",
        },
        {
            id: "emailOnInterviewScheduled",
            name: "emailOnInterviewScheduled",
            label: "Interview Schedule Reminders",
            description: "Dispatch calendar invites to interviewers and candidate communication",
            type: "checkbox",
            className: "col-span-12 md:col-span-6",
        },
        {
            id: "emailOnOfferLetterSent",
            name: "emailOnOfferLetterSent",
            label: "Offer Letter Delivery",
            description: "Send formal offer notifications and track candidate digital acceptances",
            type: "checkbox",
            className: "col-span-12 md:col-span-6",
        },
        {
            id: "dailyDigestEmail",
            name: "dailyDigestEmail",
            label: "Daily Management Digest",
            description: "Morning email summary of absentees, pending approvals, and upcoming events",
            type: "checkbox",
            className: "col-span-12 md:col-span-6",
        },
    ], []);

    const inAppNotificationSchema = useMemo(() => [
        {
            id: "inAppAttendanceAlerts",
            name: "inAppAttendanceAlerts",
            label: "Real-time Attendance Alerts",
            description: "Push notifications for punch-in failures, late arrivals, and shift revisions",
            type: "checkbox",
            className: "col-span-12 md:col-span-6",
        },
        {
            id: "inAppPerformanceReminders",
            name: "inAppPerformanceReminders",
            label: "Performance & Review Deadlines",
            description: "In-app banner reminders when appraisal cycles or 360 feedback reviews are due",
            type: "checkbox",
            className: "col-span-12 md:col-span-6",
        },
        {
            id: "inAppSystemAnnouncements",
            name: "inAppSystemAnnouncements",
            label: "Company Broadcast Announcements",
            description: "Show enterprise bulletin banners and holiday updates in the employee header",
            type: "checkbox",
            className: "col-span-12 md:col-span-6",
        },
        {
            id: "announcementSound",
            name: "announcementSound",
            label: "Notification Sound Chime",
            description: "Play an audible pleasant chime for high-priority alerts and messages",
            type: "checkbox",
            className: "col-span-12 md:col-span-6",
        },
    ], []);

    const notificationSchema = useMemo(() => [
        ...emailNotificationSchema,
        ...inAppNotificationSchema,
    ], [emailNotificationSchema, inAppNotificationSchema]);

    return {
        initialValue,
        emailNotificationSchema,
        inAppNotificationSchema,
        notificationSchema,
    };
};

export default useNotificationSettingsConfig;
