import { useEffect, useRef, useState, type RefObject } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { MINIMUM_NODE_SIZE, SNAP_THRESHOLD } from "../constants";
import { selectNodes, selectViewport, setNodes } from "../store/editorSlice";
import { screenToWorld, snapToGrid } from "../utils";

interface UseNodeResizeOptions {
  worldContainerRef: RefObject<HTMLDivElement | null>;
}

export const useNodeResize = ({ worldContainerRef }: UseNodeResizeOptions) => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const viewport = useAppSelector(selectViewport);

  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const resizeStart = useRef<{
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
    nodeX: number;
    nodeY: number;
  } | null>(null);
  const resizeRaf = useRef<number | null>(null);

  useEffect(() => {
    const container = worldContainerRef.current;
    if (!container) return;
    function handleMouseMove(e: MouseEvent) {
      if (!resizingNodeId || !resizeStart.current) return;

      if (resizeRaf.current) {
        cancelAnimationFrame(resizeRaf.current);
      }

      resizeRaf.current = requestAnimationFrame(() => {
        const snapEnabled = !e.altKey;
        const worldPos = screenToWorld(e.pageX, e.pageY, viewport);
        const { startX, startY, initialWidth, initialHeight, nodeX, nodeY } =
          resizeStart.current!;

        const deltaX = worldPos.x - startX;
        const deltaY = worldPos.y - startY;

        let newWidth = initialWidth + deltaX;
        let newHeight = initialHeight + deltaY;

        if (snapEnabled) {
          // Snap the right and bottom edges to the grid
          const rightEdge = nodeX + newWidth;
          const bottomEdge = nodeY + newHeight;

          const snappedRight = snapToGrid(rightEdge);
          const snappedBottom = snapToGrid(bottomEdge);

          if (Math.abs(snappedRight - rightEdge) < SNAP_THRESHOLD) {
            newWidth = snappedRight - nodeX;
          }
          if (Math.abs(snappedBottom - bottomEdge) < SNAP_THRESHOLD) {
            newHeight = snappedBottom - nodeY;
          }
        }

        // Enforce minimum dimensions
        newWidth = Math.max(MINIMUM_NODE_SIZE, newWidth);
        newHeight = Math.max(MINIMUM_NODE_SIZE, newHeight);

        dispatch(
          setNodes(
            nodes.map((node) => {
              if (node.id !== resizingNodeId) return node;
              return {
                ...node,
                width: newWidth,
                height: newHeight,
              };
            })
          )
        );
      });
    }

    function handleMouseUp() {
      setResizingNodeId(null);
      resizeStart.current = null;
      if (resizeRaf.current) {
        cancelAnimationFrame(resizeRaf.current);
      }
    }

    if (resizingNodeId) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (resizeRaf.current) {
        cancelAnimationFrame(resizeRaf.current);
      }
    };
  }, [dispatch, nodes, resizingNodeId, viewport, worldContainerRef]);

  const handleResizeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const worldPos = screenToWorld(e.pageX, e.pageY, viewport);

    setResizingNodeId(nodeId);
    resizeStart.current = {
      startX: worldPos.x,
      startY: worldPos.y,
      initialWidth: node.width,
      initialHeight: node.height,
      nodeX: node.x,
      nodeY: node.y,
    };
  };

  return {
    resizingNodeId,
    handleResizeMouseDown,
  };
};
