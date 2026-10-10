import React from "react";
import { useFormStore } from "../hooks/useFormStore";
import { getFieldComponent } from "../core/fieldRegistry";

const getGridSpanStyle = (field) => {
  const classNames = [
    field.className,
    field.wrapperClassName,
    field.containerClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const matches = [...classNames.matchAll(/(?:([a-z0-9-]+):)?col-span-(\d+|full)/g)];

  if (matches.length > 0) {
    // Prioritize responsive breakpoint like md: or lg:, else prefer non-12, else last match
    const responsive = matches.find((m) => m[1] === "md" || m[1] === "lg");
    const nonFull = matches.find((m) => m[2] !== "12" && m[2] !== "full");
    const chosen = responsive || nonFull || matches[matches.length - 1];
    const spanValue = chosen[2];

    return {
      gridColumn: spanValue === "full" ? "1 / -1" : `span ${spanValue} / span ${spanValue}`,
    };
  }

  if (field.gridCols) {
    return {
      gridColumn: field.gridCols === "full" ? "1 / -1" : `span ${field.gridCols} / span ${field.gridCols}`,
    };
  }

  return {
    gridColumn: "span 6 / span 6",
  };
};

export default function FormRenderer({
  formMethod: form,
  formSchema,
  className = "",
  baseWidth = "220px",
}) {
  useFormStore(form, (snapshot) => snapshot.schema);

  if (!form) {
    console.error('[FormRenderer] "formMethod" prop is required.');
    return null;
  }

  const rawSchema = formSchema || form.methods?.getSchema?.() || [];
  const schema = Array.isArray(rawSchema)
    ? rawSchema
    : Object.entries(rawSchema).map(([key, val]) => ({ id: key, ...val }));

  return (
    <div
      className={`grid gap-x-4 gap-y-6 items-start ${className}`.trim()}
      style={{
        gridTemplateColumns: `repeat(12, minmax(0, 1fr))`,
      }}
    >
      {schema.map((field) => {
        const FieldComponent = getFieldComponent(field.type);

        if (!FieldComponent) {
          return (
            <div
              key={field.id}
              className="col-span-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              Unknown field type "{field.type}" for field "{field.id}"
            </div>
          );
        }

        const fieldWrapperClassName = [
          field.className,
          field.wrapperClassName,
          field.containerClassName,
        ]
          .filter(Boolean)
          .join(" ");

        const spanStyle = getGridSpanStyle(field);
        const fieldWrapperStyle = {
          ...(field.minWidth
            ? {
              minWidth:
                typeof field.minWidth === "number"
                  ? `${field.minWidth}px`
                  : field.minWidth,
            }
            : {}),
          ...spanStyle,
        };

        return (
          <div
            key={field.id}
            className={fieldWrapperClassName}
            style={fieldWrapperStyle}
          >
            <FieldComponent field={field} form={form} />
          </div>
        );
      })}
    </div>
  );
}
