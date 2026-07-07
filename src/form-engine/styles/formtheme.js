// styles/formTheme.js

// Wrapper
export const wrapperClass = `
flex
flex-col
gap-1.5
`;

// Label
export const labelClass = `
block
text-[13px]
font-medium
text-slate-700
leading-5
select-none
`;

// Input
export const inputClass = `w-full h-8 rounded-sm border border-slate-300 bg-white px-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-200 outline-none hover:border-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-100 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed`;

// Select
export const selectClass = `
${inputClass}
appearance-none
cursor-pointer
pr-10
`;

// Textarea
export const textareaClass = `
w-full
min-h-[100px]

rounded-md

border
border-slate-300

bg-white

px-3.5
py-2.5

text-sm
text-slate-900

placeholder:text-slate-400

shadow-sm

transition-all
duration-200

outline-none

hover:border-slate-400

focus:border-blue-600
focus:ring-1
focus:ring-blue-100

resize-y

disabled:bg-slate-100
disabled:border-slate-200
disabled:text-slate-500
disabled:cursor-not-allowed
`;

// Checkbox
export const checkboxClass = `
h-4
w-4

rounded

border-slate-300

text-blue-600

focus:ring-2
focus:ring-blue-100
`;

// Radio
export const radioClass = `
h-4
w-4

border-slate-300

text-blue-600

focus:ring-2
focus:ring-blue-100
`;

// Error Input
export const errorInputClass = `
border-red-500
focus:border-red-500
focus:ring-1
focus:ring-red-100
`;

// Helper Text
export const helperClass = `
mt-1
text-xs
text-slate-500
`;

// Error Text
export const errorClass = `
mt-1
text-xs
font-medium
text-red-600
`;
