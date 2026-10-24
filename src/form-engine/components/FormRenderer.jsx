import React from "react";
import { useFormStore } from "../hooks/useFormStore";
import { getFieldComponent } from "../core/fieldRegistry";

export const getResponsiveGridClasses = (field) => {
  let classNames = [
    field.className,
    field.wrapperClassName,
    field.containerClassName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  // Normalize common developer typos like call-span or call-sapn
  classNames = classNames
    .replace(/\bcall-span-/gi, "col-span-")
    .replace(/\bcall-sapn-/gi, "col-span-")
    .replace(/\bcol-sapn-/gi, "col-span-");

  // Check if any responsive breakpoint prefixes exist: sm:, md:, lg:, xl:, 2xl:
  const hasResponsiveCol = /(?:^|\s)(?:sm|md|lg|xl|2xl):col-span-(?:\d+|full)/.test(classNames);
  const hasBaseCol = /(?:^|\s)col-span-(?:\d+|full)(?:\s|$)/.test(classNames);

  // If the schema developer explicitly provided responsive col-span classes:
  if (hasResponsiveCol) {
    if (!hasBaseCol) {
      return `col-span-12 ${classNames}`.trim();
    }
    return classNames;
  }

  // If a static col-span-X is specified (e.g. "col-span-3", "col-span-4", "col-span-6", etc.)
  const baseMatch = classNames.match(/(?:^|\s)col-span-(\d+|full)(?:\s|$)/);
  if (baseMatch) {
    const spanValue = baseMatch[1];
    const otherClasses = classNames.replace(/(?:^|\s)col-span-(\d+|full)(?:\s|$)/g, " ").trim();

    let responsiveSpan = "";
    switch (spanValue) {
      case "12":
      case "full":
        responsiveSpan = "col-span-12";
        break;
      case "6":
        responsiveSpan = "col-span-12 sm:col-span-6";
        break;
      case "4":
        responsiveSpan = "col-span-12 sm:col-span-6 lg:col-span-4";
        break;
      case "3":
        responsiveSpan = "col-span-12 sm:col-span-6 lg:col-span-3";
        break;
      case "2":
        responsiveSpan = "col-span-12 sm:col-span-4 lg:col-span-2";
        break;
      case "1":
        responsiveSpan = "col-span-6 sm:col-span-3 lg:col-span-1";
        break;
      default: {
        const num = parseInt(spanValue, 10);
        if (num >= 8) {
          responsiveSpan = `col-span-12 lg:col-span-${spanValue}`;
        } else {
          responsiveSpan = `col-span-12 sm:col-span-6 lg:col-span-${spanValue}`;
        }
        break;
      }
    }

    return otherClasses ? `${responsiveSpan} ${otherClasses}` : responsiveSpan;
  }

  // If field.gridCols is specified
  if (field.gridCols) {
    const cols = String(field.gridCols);
    let responsiveSpan = "";
    switch (cols) {
      case "12":
      case "full":
        responsiveSpan = "col-span-12";
        break;
      case "6":
        responsiveSpan = "col-span-12 sm:col-span-6";
        break;
      case "4":
        responsiveSpan = "col-span-12 sm:col-span-6 lg:col-span-4";
        break;
      case "3":
        responsiveSpan = "col-span-12 sm:col-span-6 lg:col-span-3";
        break;
      case "2":
        responsiveSpan = "col-span-12 sm:col-span-4 lg:col-span-2";
        break;
      case "1":
        responsiveSpan = "col-span-6 sm:col-span-3 lg:col-span-1";
        break;
      default:
        responsiveSpan = "col-span-12 sm:col-span-6";
        break;
    }
    return classNames ? `${responsiveSpan} ${classNames}` : responsiveSpan;
  }

  // Default fallback if no col-span or gridCols is set
  return classNames ? `col-span-12 sm:col-span-6 ${classNames}` : "col-span-12 sm:col-span-6";
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
      className={`hrm-form-grid grid grid-cols-12 gap-x-4 gap-y-5 items-start ${className}`.trim()}
      style={{
        gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
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

        const fieldWrapperClassName = getResponsiveGridClasses(field);
        const fieldWrapperStyle = {
          minWidth: 0,
          maxWidth: "100%",
          ...(field.minWidth
            ? {
              minWidth:
                typeof field.minWidth === "number"
                  ? `${field.minWidth}px`
                  : field.minWidth,
            }
            : {}),
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
