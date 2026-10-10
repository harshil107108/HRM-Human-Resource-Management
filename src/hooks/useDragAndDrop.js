import { useState, useCallback, useEffect, useRef } from "react";

/**
 * @typedef {Object} DragItemData
 * @property {any} item - The payload object being dragged
 * @property {string} type - The semantic type of the dragged item
 */

/**
 * useDragAndDrop
 * 
 * A professional, high-performance React hook for HTML5 Drag-and-Drop operations.
 * Designed for maximum reusability across listings, kanban boards, cards, and tables.
 * 
 * Features:
 * - In-memory reference tracking + dataTransfer JSON fallback (avoids serialization loss)
 * - Semantic drag types & drop acceptance filtering (e.g., only accept 'ASSET_CARD')
 * - Prop getters for declarative JSX: `getDraggableProps` and `getDroppableProps`
 * - Direct event handlers for custom components (like AgGrid / HpGrid / Table wrappers)
 * - Built-in Escape key cancel & window dragend cleanup
 * - Predicate validation for fine-grained permissions (`canDrag`, `canDrop`)
 * - Visual state helpers: `isDragging`, `isItemDragging`, `isDropTarget`
 * 
 * @param {Object} [options]
 * @param {string} [options.defaultType='ITEM'] - Default semantic type for dragged items
 * @param {Function} [options.onDrop] - Global drop callback `(draggedItem, targetId, meta, event) => void`
 * @param {Function} [options.onDragStart] - Callback fired on drag start `(item, type, event) => void`
 * @param {Function} [options.onDragEnd] - Callback fired on drag end `(item, type, event) => void`
 * 
 * @example
 * const {
 *   isDragging,
 *   draggedItem,
 *   getDraggableProps,
 *   getDroppableProps,
 *   isDropTarget,
 * } = useDragAndDrop({
 *   onDrop: (item, targetStatus) => updateItemStatus(item.id, targetStatus)
 * });
 */
export const useDragAndDrop = (options = {}) => {
  const {
    defaultType = "ITEM",
    onDrop: globalOnDrop,
    onDragStart: globalOnDragStart,
    onDragEnd: globalOnDragEnd,
  } = options;

  // Active state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragType, setDragType] = useState(null);
  const [activeDropTarget, setActiveDropTarget] = useState(null);
  const [activeDropMeta, setActiveDropMeta] = useState(null);

  // Keep ref to avoid stale closures in event handlers
  const draggedItemRef = useRef(null);
  const dragTypeRef = useRef(null);

  useEffect(() => {
    draggedItemRef.current = draggedItem;
    dragTypeRef.current = dragType;
  }, [draggedItem, dragType]);

  // Cancel / Reset Drag State
  const cancelDrag = useCallback(() => {
    setDraggedItem(null);
    setDragType(null);
    setActiveDropTarget(null);
    setActiveDropMeta(null);
    draggedItemRef.current = null;
    dragTypeRef.current = null;
  }, []);

  // Global escape listener and window blur cleanup to prevent stuck drag states
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        cancelDrag();
      }
    };

    const handleWindowDragEnd = () => {
      // Clear if window fires dragend
      cancelDrag();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("dragend", handleWindowDragEnd);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("dragend", handleWindowDragEnd);
    };
  }, [cancelDrag]);

  // ----------------------------------------------------
  // DRAGGABLE HELPERS
  // ----------------------------------------------------

  /**
   * Handle drag start event
   */
  const handleDragStart = useCallback(
    (event, item, startOptions = {}) => {
      const type = startOptions.type || defaultType;
      const effectAllowed = startOptions.effectAllowed || "move";

      if (startOptions.disabled || (startOptions.canDrag && !startOptions.canDrag(item))) {
        event.preventDefault();
        return;
      }

      setDraggedItem(item);
      setDragType(type);
      draggedItemRef.current = item;
      dragTypeRef.current = type;

      if (event?.dataTransfer) {
        event.dataTransfer.effectAllowed = effectAllowed;
        try {
          // Provide JSON payload in dataTransfer for cross-frame or native drop support
          event.dataTransfer.setData(
            "application/json",
            JSON.stringify({ type, data: item })
          );
          // Fallback text
          event.dataTransfer.setData("text/plain", JSON.stringify({ type, id: item?._id || item?.id }));
        } catch {
          // In case item contains circular structures, memory ref still works
        }
      }

      startOptions.onDragStart?.(item, type, event);
      globalOnDragStart?.(item, type, event);
    },
    [defaultType, globalOnDragStart]
  );

  /**
   * Handle drag end event
   */
  const handleDragEnd = useCallback(
    (event, endOptions = {}) => {
      const currentItem = draggedItemRef.current;
      const currentType = dragTypeRef.current;

      endOptions.onDragEnd?.(currentItem, currentType, event);
      globalOnDragEnd?.(currentItem, currentType, event);

      cancelDrag();
    },
    [cancelDrag, globalOnDragEnd]
  );

  /**
   * Helper to generate draggable attributes for JSX elements
   */
  const getDraggableProps = useCallback(
    (item, propOptions = {}) => {
      const disabled = Boolean(propOptions.disabled);

      return {
        draggable: !disabled,
        onDragStart: (e) => handleDragStart(e, item, propOptions),
        onDragEnd: (e) => handleDragEnd(e, propOptions),
        "data-draggable": !disabled,
        "data-dragging": draggedItemRef.current === item,
      };
    },
    [handleDragStart, handleDragEnd]
  );

  // ----------------------------------------------------
  // DROPPABLE HELPERS
  // ----------------------------------------------------

  /**
   * Validate if current dragged item can be dropped on this target
   */
  const canDropOnTarget = useCallback(
    (targetOptions = {}) => {
      if (targetOptions.disabled) return false;
      if (!draggedItemRef.current) return false;

      const acceptTypes = targetOptions.acceptTypes;
      if (acceptTypes && acceptTypes.length > 0) {
        if (!acceptTypes.includes(dragTypeRef.current)) {
          return false;
        }
      }

      if (typeof targetOptions.canDrop === "function") {
        return targetOptions.canDrop(draggedItemRef.current, targetOptions.meta);
      }

      return true;
    },
    []
  );

  /**
   * Handle drag over a drop target
   */
  const handleDragOver = useCallback(
    (event, targetId, overOptions = {}) => {
      if (!canDropOnTarget(overOptions)) {
        if (event?.dataTransfer) {
          event.dataTransfer.dropEffect = "none";
        }
        return;
      }

      event.preventDefault();
      if (event?.dataTransfer) {
        event.dataTransfer.dropEffect = overOptions.dropEffect || "move";
      }

      setActiveDropTarget(targetId);
      setActiveDropMeta(overOptions.meta || null);
      overOptions.onDragOver?.(event, targetId, draggedItemRef.current);
    },
    [canDropOnTarget]
  );

  /**
   * Handle drag leave from a drop target
   */
  const handleDragLeave = useCallback(
    (event, targetId, leaveOptions = {}) => {
      // Check if actually left the target element (not entering a child element)
      if (
        event?.currentTarget &&
        event?.relatedTarget &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return;
      }

      if (activeDropTarget === targetId) {
        setActiveDropTarget(null);
        setActiveDropMeta(null);
      }

      leaveOptions.onDragLeave?.(event, targetId);
    },
    [activeDropTarget]
  );

  /**
   * Handle drop on a drop target
   */
  const handleDrop = useCallback(
    (event, targetId, dropOptions = {}) => {
      if (!canDropOnTarget(dropOptions)) {
        return;
      }

      event.preventDefault();

      let droppedData = draggedItemRef.current;

      // Fallback: parse dataTransfer if in-memory ref was lost
      if (!droppedData && event?.dataTransfer) {
        try {
          const raw = event.dataTransfer.getData("application/json");
          if (raw) {
            const parsed = JSON.parse(raw);
            droppedData = parsed.data || parsed;
          }
        } catch (err) {
          console.warn("Failed to parse dropped dataTransfer JSON", err);
        }
      }

      const meta = dropOptions.meta;

      // Clear drop target highlight immediately
      setActiveDropTarget(null);
      setActiveDropMeta(null);

      if (droppedData) {
        dropOptions.onDrop?.(droppedData, targetId, meta, event);
        globalOnDrop?.(droppedData, targetId, meta, event);
      }

      cancelDrag();
    },
    [canDropOnTarget, cancelDrag, globalOnDrop]
  );

  /**
   * Helper to generate droppable attributes for JSX elements
   */
  const getDroppableProps = useCallback(
    (targetId, propOptions = {}) => {
      return {
        onDragOver: (e) => handleDragOver(e, targetId, propOptions),
        onDragLeave: (e) => handleDragLeave(e, targetId, propOptions),
        onDrop: (e) => handleDrop(e, targetId, propOptions),
        "data-droppable": !propOptions.disabled,
        "data-drop-active": activeDropTarget === targetId,
      };
    },
    [handleDragOver, handleDragLeave, handleDrop, activeDropTarget]
  );

  // ----------------------------------------------------
  // STATE CHECKERS
  // ----------------------------------------------------

  /**
   * Check if a specific targetId is currently active drop target
   */
  const isDropTarget = useCallback(
    (targetId) => activeDropTarget === targetId,
    [activeDropTarget]
  );

  /**
   * Check if a specific item is currently being dragged
   */
  const isItemDragging = useCallback(
    (itemId, idKey = "_id") => {
      if (!draggedItem) return false;
      return draggedItem[idKey] === itemId;
    },
    [draggedItem]
  );

  return {
    // Current Drag State
    draggedItem,
    dragType,
    isDragging: Boolean(draggedItem),
    activeDropTarget,
    activeDropMeta,

    // Draggable Methods
    handleDragStart,
    handleDragEnd,
    getDraggableProps,

    // Droppable Methods
    handleDragOver,
    handleDragLeave,
    handleDrop,
    getDroppableProps,

    // State Checkers & Control
    isDropTarget,
    isItemDragging,
    cancelDrag,
  };
};

export default useDragAndDrop;
