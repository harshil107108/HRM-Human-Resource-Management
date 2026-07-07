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

// ---- register built-in field types -----------------------------------
// Add new types anywhere in your app with the exported `registerFieldType`
// without ever touching this file, e.g.:
//   registerFieldType('date', DateField);
registerFieldType("number", NumberField);
registerFieldType("selectWrapper", SelectWrapper);
registerFieldType("text", TextField);
registerFieldType("date", DateField);

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
export { useFormStore } from "./hooks/useFormStore";
