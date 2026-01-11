import { useEffect, useRef, useState, type RefObject } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { selectViewport, setViewport } from "../store/editorSlice";

// Touch interaction thresholds
const PAN_MOVE_THRESHOLD = 10; // pixels - movement needed to start panning
const TAP_TIME_THRESHOLD = 250; // ms - quick tap vs pan distinction

interface UseCanvasPanOptions {
  worldContainerRef: RefObject<HTMLDivElement | null>;
  shouldPreventPanning?: boolean;
}

export const useCanvasPan = ({
  worldContainerRef,
  shouldPreventPanning = false,
}: UseCanvasPanOptions) => {
  const dispatch = useAppDispatch();
  const viewport = useAppSelector(selectViewport);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panRaf = useRef<number | null>(null);
  const activePointers = useRef<Set<number>>(new Set());
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const pointerDownTime = useRef<number>(0);
  const intentDetermined = useRef<boolean>(false);

  // Panning logic - pointerdown handler (supports mouse middle/right-click and touch)
  useEffect(() => {
    const container = worldContainerRef.current;
    if (!container) return;

    function handlePointerDown(e: PointerEvent) {
      if (shouldPreventPanning) return;

      // Track all active pointers
      activePointers.current.add(e.pointerId);

      // Mouse: middle button (1) or right button (2)
      // Touch: any touch (button will be 0 for touch)
      const isMousePan =
        e.pointerType === "mouse" && (e.button === 1 || e.button === 2);
      const isTouchPan = e.pointerType === "touch";

      // Only start panning with single touch or mouse middle/right button
      if (isMousePan || (isTouchPan && activePointers.current.size === 1)) {
        e.preventDefault();
        
        // For mouse, start panning immediately
        if (isMousePan) {
          setIsPanning(true);
          panStart.current = {
            x: e.clientX - viewport.x,
            y: e.clientY - viewport.y,
          };
          intentDetermined.current = true;
        } else {
          // For touch, wait to determine intent (tap vs pan)
          pointerDownPos.current = { x: e.clientX, y: e.clientY };
          pointerDownTime.current = Date.now();
          intentDetermined.current = false;
          panStart.current = {
            x: e.clientX - viewport.x,
            y: e.clientY - viewport.y,
          };
        }
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [
    dispatch,
    shouldPreventPanning,
    viewport.x,
    viewport.y,
    worldContainerRef,
  ]);

  // Panning logic - pointermove and pointerup handlers
  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      // Stop panning if multiple touches detected (pinch-to-zoom)
      if (activePointers.current.size > 1) {
        if (isPanning) {
          setIsPanning(false);
        }
        return;
      }

      // Determine intent for touch gestures
      if (!intentDetermined.current && pointerDownPos.current) {
        const deltaX = Math.abs(e.clientX - pointerDownPos.current.x);
        const deltaY = Math.abs(e.clientY - pointerDownPos.current.y);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const timeElapsed = Date.now() - pointerDownTime.current;

        // Start panning if movement exceeds threshold OR time threshold passed with movement
        if (distance > PAN_MOVE_THRESHOLD || (timeElapsed > TAP_TIME_THRESHOLD && distance > 2)) {
          setIsPanning(true);
          intentDetermined.current = true;
        } else {
          return;
        }
      }

      if (!isPanning) return;
      
      e.preventDefault();

      if (panRaf.current) {
        cancelAnimationFrame(panRaf.current);
      }
      panRaf.current = requestAnimationFrame(() => {
        dispatch(
          setViewport({
            x: e.clientX - panStart.current.x,
            y: e.clientY - panStart.current.y,
          })
        );
      });
    }
    function handlePointerUp(e: PointerEvent) {
      // Remove pointer from tracking
      activePointers.current.delete(e.pointerId);

      // End panning for mouse middle/right button or any touch
      const isMousePan =
        e.pointerType === "mouse" && (e.button === 1 || e.button === 2);
      const isTouchPan = e.pointerType === "touch";

      if (isMousePan || isTouchPan) {
        setIsPanning(false);
        pointerDownPos.current = null;
        intentDetermined.current = false;
      }
    }

    function handlePointerCancel(e: PointerEvent) {
      // Remove pointer from tracking
      activePointers.current.delete(e.pointerId);
      setIsPanning(false);
      pointerDownPos.current = null;
      intentDetermined.current = false;
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
      if (panRaf.current) {
        cancelAnimationFrame(panRaf.current);
      }
    };
  }, [dispatch, isPanning, viewport]);

  return isPanning;
};
