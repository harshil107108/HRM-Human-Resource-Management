import Swal from "sweetalert2";


const commonClasses = {
    popup: `!w - [calc(100 % -24px)] sm: !w - [440px] !rounded - 2xl
!bg - white
!p - 0
!shadow - 2xl
overflow - hidden
    `,

    title: `
!m - 0
!mt - 4
!px - 6
!text - [20px]
!font - semibold
!leading - 7
!text - gray - 900
    `,

    htmlContainer: `
!m - 0
!mt - 2
!px - 6
!text - [14px]
!leading - 6
!text - gray - 500
    `,

    actions: `
!mt - 6
!mb - 6
!flex
!w - full
!flex - col - reverse
sm: !flex - row
!gap - 3
!px - 6
    `,

    confirmButton: `
!m - 0
!w - full
sm: !w - auto
!min - w - [120px]
!rounded - lg
!bg - blue - 600
!px - 5
!py - 2.5
!text - sm
!font - medium
!text - white
!shadow - sm
hover: !bg - blue - 700
active: !scale - [0.98]
transition - all
duration - 150
    `,

    cancelButton: `
!m - 0
!w - full
sm: !w - auto
!min - w - [120px]
!rounded - lg
!border
!border - gray - 200
!bg - white
!px - 5
!py - 2.5
!text - sm
!font - medium
!text - gray - 700
!shadow - sm
hover: !bg - gray - 50
active: !scale - [0.98]
transition - all
duration - 150
    `,
};


export default function useAlert() {

    const deleteAlert = async ({
        title = "Delete this item?",
        text = "This action cannot be undone.",
        confirmButtonText = "Delete",
        cancelButtonText = "Cancel",
        onClick,
        ...options
    }) => {

        const result = await Swal.fire({
            title,
            text,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText,
            confirmButtonColor: "#dc2626",
            focusCancel: true,
            allowOutsideClick: true,
            allowEscapeKey: true,
            reverseButtons: true,
            customClass: {
                popup: commonClasses.popup,
                title: commonClasses.title,
                htmlContainer: commonClasses.htmlContainer,
                actions: commonClasses.actions,
                confirmButton: commonClasses.confirmButton,
                cancelButton: commonClasses.cancelButton,
            },

            buttonsStyling: true,
            ...options,
        });
        if (result.isConfirmed) {
            if (onClick) {
                await onClick();
            }
            return true;
        }
        return false;
    };


    /* ==========================================================
       GENERIC CONFIRM
       ========================================================== */

    const confirmAlert = async ({
        title = "Are you sure?",
        text = "",
        icon = "question",
        confirmButtonText = "Confirm",
        cancelButtonText = "Cancel",
        onClick,
        ...options
    }) => {

        const result = await Swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText,
            focusCancel: true,
            reverseButtons: true,
            allowOutsideClick: true,
            allowEscapeKey: true,
            customClass: commonClasses,
            ...options,
        });

        if (result.isConfirmed) {
            if (onClick) { await onClick(); }
            return true;
        }
        return false;
    };


    /* ==========================================================
       SUCCESS TOAST
       ========================================================== */

    const successAlert = ({
        title = "Success",
        text = "",
        timer = 2500,

        ...options
    }) => {

        return Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title,
            text,
            timer,
            timerProgressBar: true,
            showConfirmButton: false,
            showCloseButton: true,
            ...options,
        });
    };


    /* ==========================================================
       ERROR
       ========================================================== */

    const errorAlert = ({
        title = "Something went wrong",
        text = "Please try again.",
        confirmButtonText = "OK",
        ...options
    }) => {

        return Swal.fire({
            title,
            text,
            icon: "error",
            confirmButtonText,
            showCancelButton: false,
            confirmButtonColor: "#dc2626",
            customClass: {
                popup: commonClasses.popup,
                title: commonClasses.title,
                htmlContainer: commonClasses.htmlContainer,
                actions: commonClasses.actions,
                confirmButton: `${commonClasses.confirmButton} !bg - red - 600 hover: !bg - red - 700 `,
            },
            ...options,
        });
    };

    const warningAlert = ({
        title = "Warning",
        text = "",
        confirmButtonText = "OK",
        ...options
    }) => {

        return Swal.fire({
            title,
            text,
            icon: "warning",
            confirmButtonText,
            showCancelButton: false,
            confirmButtonColor: "#d97706",
            customClass: {
                popup: commonClasses.popup,
                title: commonClasses.title,
                htmlContainer: commonClasses.htmlContainer,
                actions: commonClasses.actions,
                confirmButton: commonClasses.confirmButton,
            },
            ...options,
        });
    };

    const infoAlert = ({
        title = "Information",
        text = "",
        confirmButtonText = "OK",
        ...options
    }) => {

        return Swal.fire({
            title,
            text,
            icon: "info",
            confirmButtonText,
            showCancelButton: false,
            confirmButtonColor: "#2563eb",
            customClass: {
                popup: commonClasses.popup,
                title: commonClasses.title,
                htmlContainer: commonClasses.htmlContainer,
                actions: commonClasses.actions,
                confirmButton: commonClasses.confirmButton,
            },
            ...options,
        });
    };


    return {
        deleteAlert,
        confirmAlert,
        successAlert,
        errorAlert,
        warningAlert,
        infoAlert,
    };
}
