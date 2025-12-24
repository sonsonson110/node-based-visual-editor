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

  // Panning logic - mousedown handler
  useEffect(() => {
    const container = worldContainerRef.current;
    if (!container) return;

    function handleMouseDown(e: MouseEvent) {
      if (shouldPreventPanning) return;
      if (e.button === 1 || e.button === 2) {
        setIsPanning(true);
        panStart.current = { x: e.pageX - viewport.x, y: e.pageY - viewport.y };
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [
    dispatch,
    shouldPreventPanning,
    viewport.x,
    viewport.y,
    worldContainerRef,
  ]);

  // Panning logic - mousemove and mouseup handlers
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isPanning) return;
      if (panRaf.current) {
        cancelAnimationFrame(panRaf.current);
      }
      panRaf.current = requestAnimationFrame(() => {
        dispatch(
          setViewport({
            ...viewport,
            x: e.pageX - panStart.current.x,
            y: e.pageY - panStart.current.y,
          })
        );
      });
    }
    function handleMouseUp(e: MouseEvent) {
      if (e.button === 1 || e.button === 2) {
        setIsPanning(false);
      }
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (panRaf.current) {
        cancelAnimationFrame(panRaf.current);
      }
    };
  }, [dispatch, isPanning, viewport]);

  return isPanning;
};
