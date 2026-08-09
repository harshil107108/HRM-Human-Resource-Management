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
font-semibold
text-slate-700
leading-5
select-none
tracking-[0.01em]
`;

// Input
export const inputClass = `w-full h-9 rounded-sm border border-slate-200 bg-slate-50/80 px-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 outline-none hover:border-sky-300 hover:bg-white focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed`;

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

rounded-sm

border
border-slate-200

bg-slate-50/80

px-2.5
py-2

text-sm
text-slate-800

placeholder:text-slate-400

shadow-[0_1px_2px_rgba(15,23,42,0.04)]

transition-all
duration-200

outline-none

hover:border-sky-300
hover:bg-white

focus:border-sky-500
focus:bg-white
focus:ring-2
focus:ring-sky-100

resize-y

disabled:bg-slate-100
disabled:border-slate-200
disabled:text-slate-500
disabled:cursor-not-allowed
`;

// Checkbox
export const checkboxClass = `
appearance-none
relative
inline-flex
shrink-0
items-center
justify-center
rounded-sm
border
border-slate-300
bg-white
text-sky-600
shadow-sm
transition-all
duration-200
outline-none
checked:bg-sky-500
checked:border-sky-500
checked:text-white
focus:ring-2
focus:ring-sky-100
focus:ring-offset-0
`;

// Radio
export const radioClass = `
h-4
w-4

border-slate-300

text-sky-600

focus:ring-4
focus:ring-sky-100
`;

// Error Input
export const errorInputClass = `
border-red-300
focus:border-red-400
focus:ring-2
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
