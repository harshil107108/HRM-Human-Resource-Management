import React from "react";

/**
 * icons.jsx
 * ------------------------------------------------------------------
 * Small, dependency-free inline SVG icons. All use `currentColor` so
 * they inherit color from CSS (see HpGrid.css: .hp-grid-action-btn--edit
 * / --delete, .hp-grid-add-btn, .hp-grid-search-icon).
 * ------------------------------------------------------------------
 */

export function PencilIcon(props) {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" {...props}>
      <path
        d="M13.5 3.5a1.5 1.5 0 0 1 2.12 0l0.88 0.88a1.5 1.5 0 0 1 0 2.12L7.5 15.5 4 16.5l1-3.5 8.5-9.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" {...props}>
      <path
        d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m-6.5 0 0.6 9a1.5 1.5 0 0 0 1.5 1.4h3.8a1.5 1.5 0 0 0 1.5-1.4l0.6-9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" {...props}>
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" {...props}>
      <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="m16 16-3.4-3.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
