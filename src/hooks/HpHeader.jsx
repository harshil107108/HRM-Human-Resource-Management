const HpHeader = ({ title, className = "" }) => {
    return (
        <header
            style={{
                background:
                    "linear-gradient(90deg, #6C9BD1 0%, #5FB4D6 50%, #4FCDC0 100%)",
                boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.55), 0 2px 6px rgba(76,140,180,0.25)",
                fontFamily:
                    'ui-rounded, "SF Pro Rounded", "Nunito", "Arial Rounded MT Bold", sans-serif',
            }}
            className={`
                sticky top-0 z-20
                flex h-9 w-full items-center
                border-b border-[#4E86B8]/40
                px-3
                text-[13px] font-bold tracking-wide
                text-white
                transition-[width] duration-300 ease-in-out
                ${className}
            `}
        >
            {/* Accent */}
            <span
                className="mr-2 h-5 w-1 rounded-full bg-white/90"
                aria-hidden="true"
            />

            {/* Title */}
            <span className="truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
                {title}
            </span>
        </header>
    );
};

export default HpHeader;