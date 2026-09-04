/**
 * form-engine public API
 * -----------------------
 * Import everything you need from this single file:
 *
 *   import { formMethod, FormRenderer, registerFieldType } from './form-engine';
 */

import { registerFieldType } from "./core/fieldRegistry";
import NumberField from "./components/fields/NumberField";
import SelectWrapper from "./components/fields/SelectWrapper";
import TextField from "./components/fields/TextField";
import DateField from "./components/fields/DateField";
import CheckboxField from "./components/fields/CheckboxField";
import PhoneField from "./components/fields/PhoneField";
import EmailField from "./components/fields/EmailField";
import TextareaField from "./components/fields/TextareaField";
import { memo } from "react";

const areFieldValuesEqual = (previousValue, nextValue) => {
  if (Object.is(previousValue, nextValue)) return true;

  if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
    return (
      previousValue.length === nextValue.length &&
      previousValue.every((value, index) =>
        areFieldValuesEqual(value, nextValue[index]),
      )
    );
  }

  if (
    previousValue &&
    nextValue &&
    typeof previousValue === "object" &&
    typeof nextValue === "object"
  ) {
    const previousKeys = Object.keys(previousValue);
    const nextKeys = Object.keys(nextValue);

    return (
      previousKeys.length === nextKeys.length &&
      previousKeys.every((key) =>
        areFieldValuesEqual(previousValue[key], nextValue[key]),
      )
    );
  }

  return false;
};

const areFieldConfigsEqual = (previousField, nextField) =>
  areFieldValuesEqual(previousField, nextField);

const memoizeField = (FieldComponent) =>
  memo(
    FieldComponent,
    (previousProps, nextProps) =>
      previousProps.form === nextProps.form &&
      areFieldConfigsEqual(previousProps.field, nextProps.field),
  );

// ---- register built-in field types -----------------------------------
// Add new types anywhere in your app with the exported `registerFieldType`
// without ever touching this file, e.g.:
//   registerFieldType('date', DateField);
registerFieldType("number", memoizeField(NumberField));
registerFieldType("selectWrapper", memoizeField(SelectWrapper));
registerFieldType("text", memoizeField(TextField));
registerFieldType("date", memoizeField(DateField));
registerFieldType("checkbox", memoizeField(CheckboxField));
registerFieldType("phone", memoizeField(PhoneField));
registerFieldType("email", memoizeField(EmailField));
registerFieldType("textarea", memoizeField(TextareaField));

// ---- public exports -----------------------------------------------------
export { default as formMethod, extendFormMethod } from "./core/formMethod";
export { FormStore } from "./core/FormStore";
export { default as FormRenderer } from "./components/FormRenderer";
export {
  registerFieldType,
  getFieldComponent,
  hasFieldType,
  getRegisteredTypes,
} from "./core/fieldRegistry";
export { useFormStore, useWatch } from "./hooks/useFormStore";