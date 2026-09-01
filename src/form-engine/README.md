# Schema-Driven Form Engine (React)

A small, extensible engine for building forms purely from a schema array.

## File structure

```
form-engine/
├── core/
│   ├── FormStore.js       # reactive store: _private state + public `.methods` API
│   ├── formMethod.js      # public factory -> formMethod.createForm(...)
│   └── fieldRegistry.js   # type -> component map (extensible)
├── hooks/
│   └── useFormStore.js    # useFormStore(store, selector) + useWatch(store, id)
├── styles/
│   └── formtheme.js       # shared Tailwind class strings for every field
├── components/
│   ├── FormRenderer.jsx   # <FormRenderer formMethod={form} formSchema={schema} />
│   └── fields/
│       ├── NumberField.jsx
│       ├── TextField.jsx
│       ├── SelectWrapper.jsx   # dropdown, single or multi (react-select)
│       ├── DateField.jsx       # segmented DD/MM/YYYY + calendar dropdown
│       └── CheckboxField.jsx
├── __tests__/
│   └── DateField.test.js
├── example/
│   └── App.jsx             # full working usage example
└── index.js                # barrel export + default type registration
```

> Styling is plain Tailwind utility classes (see `styles/formtheme.js` and
> the `col-span-*` classes below) - there is no separate CSS file to
> import. Make sure Tailwind is set up in your app. `SelectWrapper` also
> requires `react-select` as a dependency.

## Basic usage

```jsx
import { formMethod, FormRenderer } from "./form-engine";

const userSchema = [
  {
    id: "age",
    type: "number",
    label: "Age",
    placeHolder: "Enter age",
    precision: 0,
    nextFocusField: "city",
  },
  {
    id: "city",
    type: "selectWrapper",
    label: "City",
    placeHolder: "Select city",
    options: [{ label: "Surat", value: "surat" }],
    prevFocusField: "age",
  },
];

const initialValue = { age: "", city: "" };

const form = formMethod.createForm({ schema: userSchema, initialValue });

<FormRenderer formMethod={form} formSchema={userSchema} />;
```

## Save workflow: `handleFormSave`

The form engine includes a centralized save workflow so every screen can reuse the same validation + error + submission behavior.

```jsx
const form = formMethod.createForm({
  schema: countrySchema,
  initialValue,
});

const handleSave = async (data) => {
  const payload = { ...data };

  const res = await apiCall({
    id: "addEditCountry",
    api: api + apiEndpoints.master.country.CountryAddEdit,
    payload,
    showSuccessAlert: false,
  });

  if (!res.success) {
    throw new Error(res.message || "Failed to save country");
  }

  return res;
};

const result = await form.methods.handleFormSave(handleSave, {
  successMessage: "Country saved successfully",
  onSuccess: async () => {
    onModalClose();
    await onSaved?.();
  },
});

if (!result.success) {
  return;
}
```

### What this does automatically

- validates all fields in schema order
- sets field errors on the store
- focuses the first invalid field
- shows a reusable toast notification
- prevents duplicate submissions while saving
- returns a predictable result object

```js
{
  success: false,
  type: "validation",
  errors: { countryName: "Country Name is required" },
  message: "Country Name is required"
}
```

## Country master example

```jsx
const form = formMethod.createForm({
  schema: countrySchema,
  initialValue,
});

const handleSave = async () => {
  await form.methods.handleFormSave(async (data) => {
    const response = await apiCall({
      id: "addEditCountry",
      api: api + apiEndpoints.master.country.CountryAddEdit,
      payload: {
        ...data,
        _id: countryId,
      },
      showSuccessAlert: false,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to save country");
    }

    return response;
  }, {
    successMessage: "Country saved successfully",
  });
};
```

## The `form` object shape

`formMethod.createForm(...)` returns a `FormStore` instance shaped like:

```js
form.schema; // current schema array
form.values; // { age: 25, city: 'surat' }
form.errors; // { age: 'Must be 18 or older' }
form.touched; // { age: true }
form._private; // internal only - refs, listeners, schemaMap. Don't touch.
form.methods; // every callable method lives here, see below
```

**All calls go through `form.methods.*`** - e.g. `form.methods.getValue('age')`,
not `form.getValue('age')`. Keeping methods in their own object means
`console.log(form)` and `console.log(form.methods)` show every available
method directly, with nothing hidden behind a class prototype.

## Supported schema keys (common to every field)

| key                  | type             | description                                                       |
| -------------------- | ---------------- | ----------------------------------------------------------------- |
| `id`                 | string           | unique field id, required                                         |
| `type`               | string           | key registered in `fieldRegistry`                                 |
| `label`              | string           | visible label (adds a red `*` if `required`)                      |
| `placeHolder`        | string           | placeholder text                                                  |
| `required`           | boolean          | used by `form.methods.validate()`                                 |
| `requiredMessage`    | string           | custom message when required check fails                          |
| `validate`           | function         | `(value, allValues) => string \| undefined`                       |
| `nextFocusField`     | string           | id of field to focus on Enter                                     |
| `prevFocusField`     | string           | id of field to focus on Shift+Tab                                 |
| `disabled`           | boolean          | disables the input                                                |
| `className`          | string           | applied to the field's grid wrapper - see Layout below            |
| `minWidth`           | number \| string | overrides the grid's default min column width for just this field |
| `wrapperClassName`   | string           | alias, merged alongside `className`                               |
| `containerClassName` | string           | alias, merged alongside `className`                               |
| `onChange`           | function         | `(form) => void`, fires after the value updates                   |
| `onBlur`             | function         | `(form) => void`, fires when the field loses focus                |

`number` fields additionally support `precision`, `min`, `max`.
`selectWrapper` fields additionally support `options: [{ label, value }]`
and `isMultiSelect` (checkbox-style multi-select with an Apply button);
it's built on [`react-select`](https://react-select.com), which must be
installed (`npm i react-select`) for it to work.
`date` fields additionally support `min`, `max` (both `"YYYY-MM-DD"`
strings) and `defaultToday`. It renders a segmented DD/MM/YYYY input with
a calendar dropdown (arrow keys, Home, PageUp/Down, Escape all work) and
always stores/emits its value as `"YYYY-MM-DD"`, ready to pass into
`new Date(value)` or any date library.
`checkbox` fields additionally support `description`, `checkedValue` /
`uncheckedValue` (defaults `true`/`false`), and `size` (`"xs" | "sm" | "md"
| "lg" | "xl"` or a number of pixels).

`className` / `wrapperClassName` / `containerClassName` are three names for
the same thing (all get merged onto the same wrapper `<div>`) - pick
whichever reads best at the call site; you don't need to use more than one.

## Layout: responsive auto-fit grid

`FormRenderer` lays fields out with:

```css
grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
```

What this buys you, out of the box, with zero config:

- **Fields are not block/full-row by default.** Each one only takes a
  natural ~220px-minimum column and sits side-by-side with the next
  field, wrapping to a new row automatically as the container narrows.
  Short fields (Age) don't force a lonely full-width row; several fields
  comfortably share one row.
- **Explicit control when you want it.** Give any field a `className`
  with a `col-span-*` (and optional `md:col-span-*`) utility to make it
  deliberately span multiple tracks:

  ```js
  { id: "email", type: "text", label: "Email", className: "col-span-2" }
  { id: "notes", type: "text", label: "Notes", className: "col-span-full" }
  ```

- **Per-field minimum width.** Instead of (or in addition to) `col-span`,
  set `minWidth` directly on a field for one-off sizing:

  ```js
  { id: "address", type: "text", label: "Address", minWidth: 320 }
  ```

- **Global default width.** `<FormRenderer baseWidth="260px" ... />` changes
  the minmax() floor for every field in that form (default `"220px"`).

This is the same auto-fit + minmax pattern used across most production
dashboard/form UIs - it reads naturally at any viewport width without
you having to hand-place every field into a fixed 12-column system, while
`col-span-*` remains available any time you need precise control.

## Per-field `onChange` / `onBlur` (schema-level)

```js
{
  id: "age",
  type: "number",
  label: "Age",
  precision: 0,
  required: true,
  nextFocusField: "salary",
  onChange: (form) => {
    const age = form.methods.getValue("age");
    if (age && age < 18) form.methods.setError("age", "Must be 18 or older");
  },
  onBlur: (form) => {
    console.log("age blurred:", form.methods.getValue("age"));
  },
}
```

- `onChange` fires after the value is set (including the built-in precision
  rounding for number fields), on every user edit.
- `onBlur` fires when the input loses focus.
- Both are optional - omit either and nothing extra happens.
- Programmatic updates can skip firing hooks with
  `form.methods.setValue(id, value, { triggerHooks: false })`.

For reacting to a field's changes from _outside_ the schema (e.g. a parent
component), use `form.methods.onFieldChange(id, callback)` instead - see
below.

## `form.methods` API

### Values

```js
form.methods.getValues(); // { age: 25, city: 'surat' }
form.methods.getValue("age"); // 25 (non-reactive, one-off read)
form.methods.watch("age"); // 25 (reactive - re-renders on change, see below)
form.methods.watch(); // whole values object, reactively
form.methods.setValue("age", 26); // sets value, fires schema onChange
form.methods.setValue("age", 26, { triggerHooks: false }); // silent update
form.methods.setValues({ age: 26, city: "surat" });
form.methods.resetField("age"); // reset just this field
form.methods.reset(); // reset the whole form
```

> Note on naming: it's `focusField` (capital F) and `reset` (not
> `focusfield`/`rest`) - see the Focus navigation section below.

### Reactively watching a value: `watch` vs `getValue` vs `onFieldChange`

Three different tools for three different needs:

| method | when to use it |
| --- | --- |
| `form.methods.getValue(id)` | one-off read - inside an event handler, `onChange`/`onBlur` callback, or `validate` function. Not reactive; doesn't cause re-renders. |
| `form.methods.watch(id)` | **inside a component's render** - reactively returns the current value and re-renders that component whenever it changes. Same idea as react-hook-form's `watch`. Call `watch()` with no `id` to get the whole values object. |
| `form.methods.onFieldChange(id, cb)` | imperative side effect from *outside* React's render cycle (e.g. logging, analytics, syncing to localStorage) - fires a callback, does not itself cause a re-render. |

```jsx
function SalaryPreview({ form }) {
  // reactive - this component re-renders only when "salary" changes
  const salary = form.methods.watch("salary");
  return <p>Monthly: {salary ? (salary / 12).toFixed(2) : "-"}</p>;
}
```

`form.methods.watch` is a real React hook internally (it calls
`useSyncExternalStore`), so call it unconditionally at the top level of a
component, the same as `useState`. If you'd rather have the react-hooks
ESLint plugin verify that for you, use the standalone, identically
behaving `useWatch` export instead:

```jsx
import { useWatch } from "./form-engine";

function SalaryPreview({ form }) {
  const salary = useWatch(form, "salary");
  return <p>Monthly: {salary ? (salary / 12).toFixed(2) : "-"}</p>;
}
```



### Errors & validation

```js
form.methods.getErrors(); // { age: 'Must be 18 or older' }
form.methods.setError("age", "Too young");
form.methods.setErrors({ age: "Too young" });
form.methods.clearError("age");
form.methods.clearErrors();
form.methods.validate(); // runs required/validate rules
form.methods.isValid(); // checks current error state
```

### Touched / dirty state

```js
form.methods.isTouched("age");
form.methods.isTouched(); // true if ANY field was touched
form.methods.isDirty("age");
form.methods.isDirty();
```

### Focus navigation

```js
form.methods.focusField("age");
form.methods.focusOnField("age"); // same thing, alias
form.methods.focusNext("age"); // focus schema.age.nextFocusField
form.methods.focusPrev("salary");
```

### Schema / dynamic fields

```js
form.methods.getSchema();
form.methods.getFieldConfig("city");
form.methods.setFieldConfig("city", { disabled: true });
form.methods.setSchema(newSchema);
```

### Field-level subscriptions (outside the schema)

```js
const unsubscribe = form.methods.onFieldChange("age", (value, form) => {
  console.log("age is now", value);
});
form.methods.offFieldChange("age", callback); // or call unsubscribe()
```

## Extending with new field types

`number`, `text`, `selectWrapper`, `date`, and `checkbox` all ship as
built-in types already registered in `index.js`. To add one of your own:

```jsx
import { registerFieldType } from "./form-engine";
import TextareaField from "./TextareaField";

registerFieldType("textarea", TextareaField);
```

Then just use `type: "textarea"` in your schema. `styles/formtheme.js`
already exports `textareaClass` and `radioClass` for wiring up those field
types the same way the built-in ones do.

## Extending `formMethod` with new top-level methods

```js
import { extendFormMethod } from "./form-engine";

extendFormMethod("createFormFromApi", async (url) => {
  const schema = await fetch(url).then((r) => r.json());
  return formMethod.createForm({ schema, initialValue: {} });
});

const form = await formMethod.createFormFromApi("/api/user-schema");
```