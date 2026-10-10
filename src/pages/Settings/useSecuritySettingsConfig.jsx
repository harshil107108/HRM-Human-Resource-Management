import { useMemo } from "react";

const useSecuritySettingsConfig = () => {
    const initialValue = useMemo(() => ({
        passwordMinLength: 8,
        passwordExpireDays: 90,
        requireSpecialChar: true,
        requireNumber: true,
        requireUppercase: true,
        twoFactorAuth: false,
        sessionTimeoutMinutes: 60,
        maxLoginAttempts: 5,
        ipWhitelisting: false,
        allowedIpRanges: "127.0.0.1, 192.168.1.0/24",
    }), []);

    const passwordPolicySchema = useMemo(() => [
        {
            id: "passwordMinLength",
            name: "passwordMinLength",
            label: "Minimum Password Length",
            type: "number",
            placeHolder: "8",
            min: 6,
            max: 32,
            className: "col-span-12 md:col-span-6",
            required: true,
        },
        {
            id: "passwordExpireDays",
            name: "passwordExpireDays",
            label: "Password Rotation Expiry (Days)",
            type: "number",
            placeHolder: "90",
            min: 0,
            className: "col-span-12 md:col-span-6",
            required: true,
        },
        {
            id: "requireSpecialChar",
            name: "requireSpecialChar",
            label: "Enforce Special Character",
            description: "Passwords must contain at least one special character (!@#$%^&*)",
            type: "checkbox",
            className: "col-span-12",
        },
        {
            id: "requireNumber",
            name: "requireNumber",
            label: "Enforce Numeric Digit",
            description: "Passwords must contain at least one digit (0-9)",
            type: "checkbox",
            className: "col-span-12",
        },
        {
            id: "requireUppercase",
            name: "requireUppercase",
            label: "Enforce Uppercase Letter",
            description: "Passwords must contain at least one uppercase letter (A-Z)",
            type: "checkbox",
            className: "col-span-12",
        },
    ], []);

    const sessionPolicySchema = useMemo(() => [
        {
            id: "twoFactorAuth",
            name: "twoFactorAuth",
            label: "Enforce Multi-Factor Authentication (MFA / 2FA)",
            description: "Require TOTP authenticator code on every staff and administrator login",
            type: "checkbox",
            className: "col-span-12",
        },
        {
            id: "sessionTimeoutMinutes",
            name: "sessionTimeoutMinutes",
            label: "Idle Session Timeout (Minutes)",
            type: "number",
            placeHolder: "60",
            min: 5,
            max: 1440,
            className: "col-span-12 md:col-span-6",
            required: true,
        },
        {
            id: "maxLoginAttempts",
            name: "maxLoginAttempts",
            label: "Max Failed Login Attempts",
            type: "number",
            placeHolder: "5",
            min: 3,
            max: 10,
            className: "col-span-12 md:col-span-6",
            required: true,
        },
        {
            id: "ipWhitelisting",
            name: "ipWhitelisting",
            label: "IP Subnet Restriction",
            description: "Restrict employee portal and back-office logins to authorized office network CIDRs",
            type: "checkbox",
            className: "col-span-12",
        },
        {
            id: "allowedIpRanges",
            name: "allowedIpRanges",
            label: "Allowed IPv4 / CIDR Ranges",
            type: "textarea",
            placeHolder: "127.0.0.1, 192.168.1.0/24, 10.0.0.0/16",
            rows: 2,
            className: "col-span-12",
        },
    ], []);

    const securitySchema = useMemo(() => [
        ...passwordPolicySchema,
        ...sessionPolicySchema,
    ], [passwordPolicySchema, sessionPolicySchema]);

    return {
        initialValue,
        passwordPolicySchema,
        sessionPolicySchema,
        securitySchema,
    };
};

export default useSecuritySettingsConfig;
