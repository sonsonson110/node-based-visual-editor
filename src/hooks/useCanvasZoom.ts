import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { selectViewport, setViewport } from "../store/editorSlice";
import { screenToWorld } from "../utils";

export const useCanvasZoom = () => {
  const dispatch = useAppDispatch();
  const viewport = useAppSelector(selectViewport);

  // Zooming logic
  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const mouseWorld = screenToWorld(e.pageX, e.pageY, viewport);
      const newZoom = Math.min(
        3,
        Math.max(0.3, viewport.zoom * (1 - e.deltaY * 0.001))
      );
      dispatch(
        setViewport({
          zoom: newZoom,
          x: e.pageX - mouseWorld.x * newZoom,
          y: e.pageY - mouseWorld.y * newZoom,
        })
      );
    }
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, [dispatch, viewport]);
};
