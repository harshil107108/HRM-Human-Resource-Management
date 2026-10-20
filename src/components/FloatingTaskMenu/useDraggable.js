import { useState, useEffect, useRef, useCallback } from "react";

const BUTTON_SIZE = 56;
const DEFAULT_MARGIN = 16;
const DRAG_THRESHOLD = 6; // px moved before considering it a drag vs tap
const IDLE_TIMEOUT_MS = 2500;

/**
 * Custom hook to handle AssistiveTouch-style dragging, edge clamping,
 * snapping to screen edges, and idle opacity states.
 */
export function useDraggable({
  size = BUTTON_SIZE,
  margin = DEFAULT_MARGIN,
  snapToEdge = true,
  defaultPosition = "bottom-right",
  isOpen = false,
  onToggle = () => {},
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const pointerStateRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    hasMoved: false,
  });

  const wasDraggedRef = useRef(false);
  const idleTimerRef = useRef(null);

  // Calculate safe boundary limits based on viewport size
  const getBounds = useCallback(() => {
    if (typeof window === "undefined") {
      return { minX: margin, maxX: 400, minY: margin, maxY: 600 };
    }
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    return {
      minX: margin,
      maxX: Math.max(margin, winWidth - size - margin),
      minY: margin,
      maxY: Math.max(margin, winHeight - size - margin),
    };
  }, [size, margin]);

  // Compute initial starting coordinates
  const computeInitialPosition = useCallback(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };

    if (typeof defaultPosition === "object" && defaultPosition !== null) {
      const bounds = getBounds();
      return {
        x: Math.min(Math.max(bounds.minX, defaultPosition.x || 0), bounds.maxX),
        y: Math.min(Math.max(bounds.minY, defaultPosition.y || 0), bounds.maxY),
      };
    }

    const { minX, maxX, minY, maxY } = getBounds();
    const bottomOffset = 80; // avoid overlapping fixed bottom bars if any

    switch (defaultPosition) {
      case "bottom-left":
        return { x: minX, y: Math.max(minY, maxY - bottomOffset) };
      case "top-right":
        return { x: maxX, y: minY + 60 };
      case "top-left":
        return { x: minX, y: minY + 60 };
      case "bottom-right":
      default:
        return { x: maxX, y: Math.max(minY, maxY - bottomOffset) };
    }
  }, [defaultPosition, getBounds]);

  // Initialize position once on mount
  useEffect(() => {
    const initial = computeInitialPosition();
    setPosition(initial);
    setIsInitialized(true);
  }, [computeInitialPosition]);

  // Keep button safely inside bounds when browser window resizes
  useEffect(() => {
    const handleResize = () => {
      const { minX, maxX, minY, maxY } = getBounds();
      setPosition((prev) => {
        let newX = Math.min(Math.max(minX, prev.x), maxX);
        const newY = Math.min(Math.max(minY, prev.y), maxY);

        // If snapped to right edge previously, stick to right edge on resize
        if (snapToEdge && prev.x > (window.innerWidth - size) / 2) {
          newX = maxX;
        }

        return { x: newX, y: newY };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getBounds, snapToEdge, size]);

  // Idle timer logic: dim icon when user is inactive and menu is closed
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    if (!isOpen) {
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, IDLE_TIMEOUT_MS);
    }
  }, [isOpen]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // Pointer Down: begin tracking potential drag
  const handlePointerDown = useCallback(
    (e) => {
      // Only respond to primary mouse button or touch
      if (e.button !== 0 && e.pointerType === "mouse") return;

      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      pointerStateRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startPosX: position.x,
        startPosY: position.y,
        hasMoved: false,
      };

      wasDraggedRef.current = false;
      setIsSnapping(false);
      resetIdleTimer();
    },
    [position, resetIdleTimer]
  );

  // Pointer Move: update position and enforce boundaries
  const handlePointerMove = useCallback(
    (e) => {
      const state = pointerStateRef.current;
      if (state.pointerId !== e.pointerId) return;

      const deltaX = e.clientX - state.startX;
      const deltaY = e.clientY - state.startY;
      const distance = Math.hypot(deltaX, deltaY);

      if (!state.hasMoved && distance > DRAG_THRESHOLD) {
        state.hasMoved = true;
        wasDraggedRef.current = true;
        setIsDragging(true);
      }

      if (state.hasMoved) {
        const { minX, maxX, minY, maxY } = getBounds();
        const targetX = state.startPosX + deltaX;
        const targetY = state.startPosY + deltaY;

        // Strict boundary clamping so icon never leaves the screen
        const clampedX = Math.min(Math.max(minX, targetX), maxX);
        const clampedY = Math.min(Math.max(minY, targetY), maxY);

        setPosition({ x: clampedX, y: clampedY });
        resetIdleTimer();
      }
    },
    [getBounds, resetIdleTimer]
  );

  // Pointer Up / Cancel: finish drag, handle snap-to-edge, and trigger click if not dragged
  const handlePointerUp = useCallback(
    (e) => {
      const state = pointerStateRef.current;
      if (state.pointerId !== e.pointerId) return;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored if capture was already released
      }

      const didDrag = state.hasMoved;
      state.pointerId = null;
      setIsDragging(false);

      if (didDrag) {
        if (snapToEdge) {
          setIsSnapping(true);
          const { minX, maxX, minY, maxY } = getBounds();
          const centerX = position.x + size / 2;
          const winMidX = window.innerWidth / 2;

          // Snap to closest screen edge (left or right)
          const targetX = centerX < winMidX ? minX : maxX;
          const clampedY = Math.min(Math.max(minY, position.y), maxY);

          setPosition({ x: targetX, y: clampedY });

          // Reset snapping transition class after animation finishes
          setTimeout(() => {
            setIsSnapping(false);
          }, 320);
        }

        // Suppress click triggered immediately after dragging
        setTimeout(() => {
          wasDraggedRef.current = false;
        }, 50);
      } else {
        // Pure tap / click: toggle menu
        onToggle();
      }

      resetIdleTimer();
    },
    [snapToEdge, getBounds, position, size, onToggle, resetIdleTimer]
  );

  const handleClick = useCallback((e) => {
    // If a drag operation was just completed, swallow the click event
    if (wasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      wasDraggedRef.current = false;
    }
  }, []);

  const handlePointerEnter = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  return {
    position,
    setPosition,
    isDragging,
    isSnapping,
    isIdle: isIdle && !isOpen && !isDragging,
    isInitialized,
    dragProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onClick: handleClick,
      onPointerEnter: handlePointerEnter,
    },
    resetIdleTimer,
  };
}
