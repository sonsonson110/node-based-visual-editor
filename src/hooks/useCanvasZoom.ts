import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { selectViewport, setViewport } from "../store/editorSlice";
import { screenToWorld } from "../utils";

// Zoom configuration constants
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const WHEEL_ZOOM_SENSITIVITY = 0.001;

export const useCanvasZoom = () => {
  const dispatch = useAppDispatch();
  const viewport = useAppSelector(selectViewport);
  
  // For pinch-to-zoom tracking
  const pointers = useRef<Map<number, PointerEvent>>(new Map());
  const lastDistance = useRef<number | null>(null);

  // Mouse wheel zooming logic
  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const mouseWorld = screenToWorld(e.clientX, e.clientY, viewport);
      const newZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, viewport.zoom * (1 - e.deltaY * WHEEL_ZOOM_SENSITIVITY))
      );
      dispatch(
        setViewport({
          zoom: newZoom,
          x: e.clientX - mouseWorld.x * newZoom,
          y: e.clientY - mouseWorld.y * newZoom,
        })
      );
    }
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, [dispatch, viewport]);

  // Pinch-to-zoom logic for touch devices
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (e.pointerType === "touch") {
        pointers.current.set(e.pointerId, e);
      }
    }

    function handlePointerMove(e: PointerEvent) {
      if (e.pointerType !== "touch") return;
      
      pointers.current.set(e.pointerId, e);

      // Need exactly 2 touches for pinch gesture
      if (pointers.current.size === 2) {
        const touches = Array.from(pointers.current.values());
        const [touch1, touch2] = touches;

        // Calculate distance between two fingers
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        if (lastDistance.current !== null) {
          // Calculate zoom factor based on distance change
          const scale = currentDistance / lastDistance.current;
          const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, viewport.zoom * scale));

          // Zoom origin is the midpoint between two fingers
          const centerX = (touch1.clientX + touch2.clientX) / 2;
          const centerY = (touch1.clientY + touch2.clientY) / 2;
          const centerWorld = screenToWorld(centerX, centerY, viewport);

          dispatch(
            setViewport({
              zoom: newZoom,
              x: centerX - centerWorld.x * newZoom,
              y: centerY - centerWorld.y * newZoom,
            })
          );
        }

        lastDistance.current = currentDistance;
      }
    }

    function handlePointerUp(e: PointerEvent) {
      pointers.current.delete(e.pointerId);
      
      // Reset distance when fingers are lifted
      if (pointers.current.size < 2) {
        lastDistance.current = null;
      }
    }

    function handlePointerCancel(e: PointerEvent) {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) {
        lastDistance.current = null;
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [dispatch, viewport]);
};
