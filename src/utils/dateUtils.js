export const formatDateForInput = (date) => {
    if (!date) return "";
    try {
        return new Date(date).toISOString().split("T")[0];
    } catch {
        return "";
    }
};

export const formatDate = (date) => {
    if (!date) return "-";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    } catch {
        return "-";
    }
};

export const formatDateTime = (date) => {
    if (!date) return "-";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch {
        return "-";
    }
};