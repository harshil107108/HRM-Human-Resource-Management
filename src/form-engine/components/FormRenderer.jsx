import React from "react";
import { useFormStore } from "../hooks/useFormStore";
import { getFieldComponent } from "../core/fieldRegistry";

/**
 * FormRenderer
 * ------------
 * Layout model: a responsive, auto-fit CSS grid.
 *
 *   grid-template-columns: repeat(auto-fit, minmax(<baseWidth>, 1fr))
 *
 * This is what gives every field two things at once:
 *   1. By default (no className), a field is NOT block/full-row - it only
 *      takes up a natural, comfortable column width (baseWidth, 220px by
 *      default) and sits side-by-side with the next field, wrapping to a
 *      new row automatically when it runs out of horizontal space.
 *   2. When a field DOES declare a `className` with a `col-span-*` (and
 *      optional `md:col-span-*`) utility, it spans that many of the
 *      auto-generated tracks - giving you exact, deliberate control over
 *      wide fields (e.g. "col-span-2" for an email address) without
 *      having to think in a rigid fixed 12-column system.
 *
 * Per-field overrides:
 *   field.className / field.wrapperClassName / field.containerClassName
 *     - merged onto the field's wrapper <div>, aliases of each other
 *   field.minWidth
 *     - number (px) or CSS length string, overrides `baseWidth` for just
 *       this field, e.g. `minWidth: 320` for a field that needs more room
 *
 * FormRenderer-level prop:
 *   baseWidth - default minmax() floor for every column (default "220px")
 */
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
        gridTemplateColumns: `repeat(auto-fit, minmax(${baseWidth}, 1fr))`,
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

        const fieldWrapperStyle = field.minWidth
          ? {
              minWidth:
                typeof field.minWidth === "number"
                  ? `${field.minWidth}px`
                  : field.minWidth,
            }
          : undefined;

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
