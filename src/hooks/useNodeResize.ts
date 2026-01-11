import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { MINIMUM_NODE_SIZE, SNAP_THRESHOLD } from "../constants";
import { selectNodes, selectViewport, setNodes } from "../store/editorSlice";
import { screenToWorld, snapToGrid } from "../utils";

export const useNodeResize = () => {
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
    function handlePointerMove(e: PointerEvent) {
      if (!resizingNodeId || !resizeStart.current) return;

      if (resizeRaf.current) {
        cancelAnimationFrame(resizeRaf.current);
      }

      resizeRaf.current = requestAnimationFrame(() => {
        const snapEnabled = !e.altKey;
        const worldPos = screenToWorld(e.clientX, e.clientY, viewport);
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

    function handlePointerUp() {
      setResizingNodeId(null);
      resizeStart.current = null;
      if (resizeRaf.current) {
        cancelAnimationFrame(resizeRaf.current);
      }
    }

    if (resizingNodeId) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      if (resizeRaf.current) {
        cancelAnimationFrame(resizeRaf.current);
      }
    };
  }, [dispatch, nodes, resizingNodeId, viewport]);

  const handleNodeResizePointerDown = (x: number, y: number, nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const worldPos = screenToWorld(x, y, viewport);

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
    handleNodeResizePointerDown,
  };
};
