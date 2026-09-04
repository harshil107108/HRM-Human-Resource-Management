const AssetCard = ({ title, value, description, icon, type = "total" }) => {
  const styles = {
    total: {
      accent: "border-l-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },

    available: {
      accent: "border-l-emerald-500",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },

    assigned: {
      accent: "border-l-violet-500",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },

    repair: {
      accent: "border-l-amber-500",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },

    lost: {
      accent: "border-l-rose-500",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    },

    disposed: {
      accent: "border-l-slate-400",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-500",
    },
  };

  const currentStyle = styles[type] || styles.total;

  return (
    <div
      className={`
        flex
        h-[68px]
        min-w-0
        items-center
        gap-2.5
        rounded-md
        border
        border-slate-200
        border-l-[3px]
        bg-white
        px-2.5
        ${currentStyle.accent}
      `}
    >
      {/* Icon */}
      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-md
          ${currentStyle.iconBg}
          ${currentStyle.iconColor}
        `}
      >
        <span className="text-sm leading-none">{icon}</span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title */}
        <div
          className="
            truncate
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.6px]
            text-slate-500
          "
        >
          {title}
        </div>

        {/* Value + Description */}
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-[18px] font-bold leading-5 text-slate-800">
            {value}
          </span>

          {description && (
            <span className="hidden truncate text-[9px] text-slate-400 xl:block">
              {description}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
