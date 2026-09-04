const AssetCard = ({
  title,
  value,
  percentage,
  description,
  icon,
  type = "blue",
}) => {
  const styles = {
    blue: {
      card: "border-blue-200 bg-blue-50",
      icon: "bg-blue-100 text-blue-700",
      percentage: "text-emerald-600",
    },

    orange: {
      card: "border-orange-200 bg-orange-50",
      icon: "bg-orange-100 text-orange-700",
      percentage: "text-red-600",
    },

    purple: {
      card: "border-violet-200 bg-violet-50",
      icon: "bg-violet-100 text-violet-700",
      percentage: "text-emerald-600",
    },

    green: {
      card: "border-emerald-200 bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-700",
      percentage: "text-emerald-600",
    },

    red: {
      card: "border-red-200 bg-red-50",
      icon: "bg-red-100 text-red-700",
      percentage: "text-red-600",
    },

    cyan: {
      card: "border-sky-200 bg-sky-50",
      icon: "bg-sky-100 text-sky-700",
      percentage: "text-emerald-600",
    },
  };

  const currentStyle = styles[type] || styles.blue;

  return (
    <div
      className={`
        h-[82px]
        w-full
        rounded-[5px]
        border
        px-3
        py-2.5
        ${currentStyle.card}
      `}
    >
      <div className="flex h-full items-start gap-2.5">
        {/* Icon */}
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${currentStyle.icon}
          `}
        >
          <span className="text-[17px] font-bold leading-none">{icon}</span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <div
            className="
              truncate
              text-[10px]
              font-bold
              leading-3
              text-slate-600
            "
          >
            {title}
          </div>

          {/* Value */}
          <div
            className="
              mt-0.5
              text-[22px]
              font-extrabold
              leading-[22px]
              tracking-tight
              text-slate-900
            "
          >
            {value}
          </div>

          {/* Percentage */}
          <div className="mt-1 flex items-center gap-1">
            <span
              className={`
                text-[9px]
                font-bold
                ${currentStyle.percentage}
              `}
            >
              {percentage}
            </span>

            <span
              className="
                truncate
                text-[9px]
                font-medium
                text-slate-500
              "
            >
              {description}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
