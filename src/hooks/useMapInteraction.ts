import { useEffect, type RefObject } from "react";
import { useCanvasPan } from "./useCanvasPan";
import { useCanvasZoom } from "./useCanvasZoom";
import { useNodeDrag } from "./useNodeDrag";
import { useNodeResize } from "./useNodeResize";
import { useSelectionBox } from "./useSelectionBox";

interface MapInteractionOptions {
  worldContainerRef: RefObject<HTMLDivElement | null>;
}

export const useMapInteraction = ({
  worldContainerRef,
}: MapInteractionOptions) => {
  const { draggedNodeId, handleNodeMouseDown } = useNodeDrag();

  const { resizingNodeId, handleNodeResizeMouseDown } = useNodeResize();

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

  return {
    selectionBox,
    isPanning,
    draggedNodeId,
    resizingNodeId,
    handleNodeMouseDown,
    handleNodeResizeMouseDown,
  };
};
