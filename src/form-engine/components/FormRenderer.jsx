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

  const spanMatch = classNames.match(/(?:^|\s)(?:[a-z-]+:)?col-span-(\d+|full)(?:\s|$)/);

  if (!spanMatch) {
    return {
      gridColumn: "span 6 / span 6",
    };
  }

  const spanValue = spanMatch[1];

  return {
    gridColumn: spanValue === "full" ? "1 / -1" : `span ${spanValue} / span ${spanValue}`,
  };
};

export default function FormRenderer({
  formMethod: form,
  formSchema,
  className = "",
  baseWidth = "220px",
}) {
  useFormStore(form);

  if (!form) {
    console.error('[FormRenderer] "formMethod" prop is required.');
    return null;
  }

  const schema = formSchema || form.methods.getSchema();

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
