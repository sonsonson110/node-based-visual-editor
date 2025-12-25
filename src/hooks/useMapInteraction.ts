import { useEffect, type RefObject } from "react";
import { useAppDispatch } from ".";
import { setSelectedNodeIds } from "../store/editorSlice";
import { useCanvasPan } from "./useCanvasPan";
import { useCanvasZoom } from "./useCanvasZoom";
import { useNodeDrag } from "./useNodeDrag";
import { useSelectionBox } from "./useSelectionBox";
import { useNodeResize } from "./useNodeResize";

interface MapInteractionOptions {
  worldContainerRef: RefObject<HTMLDivElement | null>;
}

export const useMapInteraction = ({
  worldContainerRef,
}: MapInteractionOptions) => {
  const dispatch = useAppDispatch();

  const { draggedNodeId, handleNodeMouseDown } = useNodeDrag({
    worldContainerRef,
  });

  const { resizingNodeId, handleResizeMouseDown } = useNodeResize({
    worldContainerRef,
  });

  const isPanning = useCanvasPan({
    worldContainerRef,
    shouldPreventPanning: !!draggedNodeId || !!resizingNodeId,
  });

  useCanvasZoom();

  const selectionBox = useSelectionBox({
    draggedNodeId,
    isPanning,
  });

  // Prevent default context menu
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", handler);
    return () => window.removeEventListener("contextmenu", handler);
  }, []);

  // Deselect all nodes on background left click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        e.button === 0 &&
        worldContainerRef.current &&
        !worldContainerRef.current.contains(e.target as globalThis.Node)
      ) {
        dispatch(setSelectedNodeIds([]));
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [dispatch, worldContainerRef]);

  return {
    selectionBox,
    isPanning,
    draggedNodeId,
    resizingNodeId,
    handleNodeMouseDown,
    handleResizeMouseDown,
  };
};
