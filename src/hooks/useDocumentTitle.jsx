import { useEffect } from "react";

const useDocumentTitle = (title, defaultTitle = "HRM") => {
    useEffect(() => {
        if (title) {
            document.title = title;
        } else {
            document.title = defaultTitle;
        }

        return () => {
            document.title = defaultTitle;
        };
    }, [title, defaultTitle]);
};

export default useDocumentTitle;