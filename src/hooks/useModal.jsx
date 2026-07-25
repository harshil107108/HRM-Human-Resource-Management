import { useState, useCallback } from "react";

const useModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [extraParams, setExtraParams] = useState(null);

    const onModalOpen = useCallback((params = null) => {
        setExtraParams(params);
        setIsModalOpen(true);
    }, []);

    const onModalClose = useCallback(() => {
        setIsModalOpen(false);
        setExtraParams(null);
    }, []);

    return {
        isModalOpen,
        extraParams,
        onModalOpen,
        onModalClose,
    };
};

export default useModal;