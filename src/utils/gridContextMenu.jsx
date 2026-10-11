import { cloneElement, isValidElement } from "react";
import { Edit, Eye, Trash2, ArrowRightLeft } from "lucide-react";

/**
 * Right-click menu builder for HpGrid listings.
 * ---------------------------------------------------------------------------
 * Returns a `contextData` function (HpGrid calls it per row), so every
 * listing gets the same menu shape:
 *
 *   Edit
 *   ─────────
 *   Mark as <status>   ← one per status card, current status hidden
 *   ─────────
 *   Delete             ← danger
 *
 * Items carry a `permission` tag (edit / status / delete); HpGrid uses it
 * to apply the current page's rights.
 *
 * Status items call the listing's existing status-change handler (the same
 * one drag-and-drop uses), so confirmations, modals and business rules stay
 * in one place.
 *
 * @param {object}   config
 * @param {Function} [config.onEdit]        (row) => void
 * @param {string|Function} [config.editLabel="Edit"]  label, or (row) => label
 * @param {Function} [config.isReadOnly]    (row) => bool — Edit becomes "View"
 * @param {Function} [config.onDelete]      (row) => void
 * @param {Function} [config.canDelete]     (row) => bool — false disables Delete
 * @param {Array}    [config.statusCards]   the listing's status-card array
 *                                          ({ status, title, icon, isDisabled })
 * @param {string}   [config.statusField]   row field holding the current status
 * @param {Function} [config.onStatusChange] (row, status, title) => void
 * @param {Function} [config.isStatusLocked] (row) => bool — hides status items
 * @param {string}   [config.statusLabel="Mark as"] verb before the status title
 * @param {Array}    [config.extraItems]    more items, shown after Edit
 * ---------------------------------------------------------------------------
 */

// Status-card icons are 18px; menu icons are 14px.
const toMenuIcon = (icon, fallback) =>
  isValidElement(icon) ? cloneElement(icon, { size: 14, className: "" }) : fallback;

const sameStatus = (a, b) =>
  String(a ?? "").trim().toUpperCase() === String(b ?? "").trim().toUpperCase();

// Drop leading/trailing/double dividers left behind by hidden items.
const tidyDividers = (items) => {
  const result = [];
  items.forEach((item) => {
    if (!item) return;
    if (item.divider && (!result.length || result[result.length - 1].divider)) return;
    result.push(item);
  });
  while (result.length && result[result.length - 1].divider) result.pop();
  return result;
};

export const createRowContextMenu = ({
  onEdit,
  editLabel = "Edit",
  canEdit,
  isReadOnly,
  onDelete,
  canDelete,
  statusCards = [],
  statusField,
  onStatusChange,
  isStatusLocked,
  statusLabel = "Mark as",
  extraItems = [],
} = {}) => {
  const statusOptions = statusCards.filter((card) => card?.status && !card.isDisabled);

  return ({ row }) => {
    if (!row) return [];
    const items = [];

    if (
      typeof onEdit === "function" &&
      (typeof canEdit !== "function" || canEdit(row))
    ) {
      const readOnly = typeof isReadOnly === "function" && isReadOnly(row);
      items.push({
        id: "edit",
        permission: "edit",
        text: readOnly ? "View" : typeof editLabel === "function" ? editLabel(row) : editLabel,
        icon: readOnly ? <Eye size={14} /> : <Edit size={14} />,
        onClick: (r) => onEdit(r),
      });
    }

    extraItems.forEach((item) => items.push(item));

    const locked = typeof isStatusLocked === "function" && isStatusLocked(row);
    if (!locked && statusField && typeof onStatusChange === "function") {
      const available = statusOptions.filter(
        (card) => !sameStatus(row[statusField], card.status),
      );
      if (available.length) {
        items.push({ divider: true });
        available.forEach((card) =>
          items.push({
            id: `status-${card.status}`,
            permission: "status",
            text: `${statusLabel} ${card.title}`,
            icon: toMenuIcon(card.icon, <ArrowRightLeft size={14} />),
            onClick: (r) => onStatusChange(r, card.status, card.title),
          }),
        );
      }
    }

    if (typeof onDelete === "function") {
      items.push({ divider: true });
      items.push({
        id: "delete",
        permission: "delete",
        text: "Delete",
        icon: <Trash2 size={14} />,
        danger: true,
        disabled: typeof canDelete === "function" ? !canDelete(row) : false,
        onClick: (r) => onDelete(r),
      });
    }

    return tidyDividers(items);
  };
};

export default createRowContextMenu;
