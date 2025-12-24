import { useEffect, useRef, useState, type RefObject } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { selectNodes, selectViewport, setNodes } from "../store/editorSlice";
import { screenToWorld } from "../utils";

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
  } | null>(null);
  const resizeRaf = useRef<number | null>(null);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!resizingNodeId || !worldContainerRef.current || !resizeStart.current)
        return;

      if (resizeRaf.current) {
        cancelAnimationFrame(resizeRaf.current);
      }

      resizeRaf.current = requestAnimationFrame(() => {
        const worldPos = screenToWorld(e.pageX, e.pageY, viewport);
        const { startX, startY, initialWidth, initialHeight } =
          resizeStart.current!;

        const deltaX = worldPos.x - startX;
        const deltaY = worldPos.y - startY;

        const newWidth = Math.max(50, initialWidth + deltaX);
        const newHeight = Math.max(50, initialHeight + deltaY);

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
    };
  };

  return {
    resizingNodeId,
    handleResizeMouseDown,
  };
};