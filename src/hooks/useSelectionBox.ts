import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from ".";
import {
  selectNodes,
  selectViewport,
  setSelectedNodeIds,
} from "../store/editorSlice";
import { screenToWorld } from "../utils";
import type { SelectionBoxMeta } from "../types";

interface UseSelectionBoxOptions {
  draggedNodeId: string | null;
  isPanning: boolean;
}

export const useSelectionBox = ({
  draggedNodeId,
  isPanning,
}: UseSelectionBoxOptions) => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const viewport = useAppSelector(selectViewport);
  const [selectionBox, setSelectionBox] = useState<SelectionBoxMeta | null>(
    null
  );

  // Selection box mouse logic
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (draggedNodeId || isPanning || e.button !== 0) return;

      const startX = e.pageX;
      const startY = e.pageY;

      setSelectionBox({ startX, startY, endX: startX, endY: startY });

      let rafId: number | null = null;
      function handleMouseMove(ev: MouseEvent) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          setSelectionBox((prev) => {
            if (!prev) return null;
            return { ...prev, endX: ev.pageX, endY: ev.pageY };
          });
        });
      }

      function handleMouseUp(ev: MouseEvent) {
        if (ev.button !== 0) return;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        if (rafId) cancelAnimationFrame(rafId);

        const world1 = screenToWorld(startX, startY, viewport);
        const world2 = screenToWorld(ev.pageX, ev.pageY, viewport);

        const xMin = Math.min(world1.x, world2.x);
        const xMax = Math.max(world1.x, world2.x);
        const yMin = Math.min(world1.y, world2.y);
        const yMax = Math.max(world1.y, world2.y);

        const insideNodeIds = nodes
          .filter(
            (node) =>
              node.x >= xMin &&
              node.x + node.width <= xMax &&
              node.y >= yMin &&
              node.y + node.height <= yMax
          )
          .map((node) => node.id);

        dispatch(setSelectedNodeIds(Array.from(new Set(insideNodeIds))));
        setSelectionBox(null);
      }

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [dispatch, draggedNodeId, isPanning, nodes, viewport]);

  return selectionBox;
};
