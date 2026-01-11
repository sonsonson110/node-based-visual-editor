import { useEffect, useRef, useState, type RefObject } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { selectViewport, setViewport } from "../store/editorSlice";

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

  // Panning logic - pointerdown handler (supports mouse middle/right-click and touch)
  useEffect(() => {
    const container = worldContainerRef.current;
    if (!container) return;

    function handlePointerDown(e: PointerEvent) {
      if (shouldPreventPanning) return;

      // Mouse: middle button (1) or right button (2)
      // Touch: any touch (button will be 0 for touch)
      const isMousePan =
        e.pointerType === "mouse" && (e.button === 1 || e.button === 2);
      const isTouchPan = e.pointerType === "touch";

      if (isMousePan || isTouchPan) {
        e.preventDefault();
        setIsPanning(true);
        panStart.current = {
          x: e.clientX - viewport.x,
          y: e.clientY - viewport.y,
        };
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
      // End panning for mouse middle/right button or any touch
      const isMousePan =
        e.pointerType === "mouse" && (e.button === 1 || e.button === 2);
      const isTouchPan = e.pointerType === "touch";

      if (isMousePan || isTouchPan) {
        setIsPanning(false);
      }
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      if (panRaf.current) {
        cancelAnimationFrame(panRaf.current);
      }
    };
  }, [dispatch, isPanning, viewport]);

  return isPanning;
};
