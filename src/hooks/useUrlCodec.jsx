import { useCallback } from "react";

const useUrlCodec = () => {
    const encode = useCallback((value) => {
        if (value === null || value === undefined) return "";
        return encodeURIComponent(String(value));
    }, []);

    const decode = useCallback((value) => {
        if (!value) return "";
        return decodeURIComponent(value);
    }, []);

    return {
        encode,
        decode,
    };
};

export default useUrlCodec;