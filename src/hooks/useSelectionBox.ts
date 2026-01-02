import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from ".";
import {
  selectEdges,
  selectMapOrientation,
  selectNodes,
  selectViewport,
  setSelectedEdgeIds,
  setSelectedNodeIds,
} from "../store/editorSlice";
import {
  getBezierBounds,
  getEdgeId,
  getEdgeMetrics,
  screenToWorld,
} from "../utils";
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
  const edges = useAppSelector(selectEdges);
  const viewport = useAppSelector(selectViewport);
  const mapOrientation = useAppSelector(selectMapOrientation);
  const [selectionBox, setSelectionBox] = useState<SelectionBoxMeta | null>(
    null
  );

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
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

        // Select Nodes
        const insideNodeIds = nodes
          .filter(
            (node) =>
              node.x >= xMin &&
              node.x + node.width <= xMax &&
              node.y >= yMin &&
              node.y + node.height <= yMax
          )
          .map((node) => node.id);

        // Select Edges
        const insideEdgeIds = edges
          .filter((edge) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return false;

            const { x1, y1, x2, y2, cp1x, cp1y, cp2x, cp2y } = getEdgeMetrics(
              fromNode,
              toNode,
              mapOrientation
            );

            // Calculate precise bounding box of the Bezier curve
            const {
              minX: edgeMinX,
              maxX: edgeMaxX,
              minY: edgeMinY,
              maxY: edgeMaxY,
            } = getBezierBounds(x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2);

            // Check if selection box fully contains the edge bounding box
            return (
              xMin <= edgeMinX &&
              xMax >= edgeMaxX &&
              yMin <= edgeMinY &&
              yMax >= edgeMaxY
            );
          })
          .map((edge) => getEdgeId(edge.from, edge.to));

        dispatch(setSelectedNodeIds(Array.from(new Set(insideNodeIds))));
        dispatch(setSelectedEdgeIds(Array.from(new Set(insideEdgeIds))));
        setSelectionBox(null);
      }

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [
    dispatch,
    draggedNodeId,
    isPanning,
    nodes,
    edges,
    viewport,
    mapOrientation,
    nodeMap,
  ]);

  return selectionBox;
};
