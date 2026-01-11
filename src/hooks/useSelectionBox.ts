import { useEffect, useState, useMemo, useRef } from "react";
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
  const selectionStartRef = useRef<Pick<
    SelectionBoxMeta,
    "startX" | "startY"
  > | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBoxMeta | null>(
    null
  );
  const pointerTypeRef = useRef<string | null>(null); // Track if mouse or touch

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  // Selection box logic (mouse only) and tap-to-deselect (both mouse and touch)
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      
      // For mouse: respect isPanning and draggedNodeId
      // For touch: always track for tap-to-deselect (panning will be handled separately)
      if (e.pointerType === "mouse" && (draggedNodeId || isPanning)) return;
      
      pointerTypeRef.current = e.pointerType;
      const startX = e.clientX;
      const startY = e.clientY;
      
      // Track start position for both mouse and touch
      selectionStartRef.current = { startX, startY };
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [draggedNodeId, isPanning]);

  useEffect(() => {
    function handlePointerMove(ev: PointerEvent) {
      if (!selectionStartRef.current) return;
      
      // Only show selection box for mouse, not touch
      if (pointerTypeRef.current === "mouse") {
        setSelectionBox({
          ...selectionStartRef.current,
          endX: ev.clientX,
          endY: ev.clientY,
        });
      }
    }
    document.addEventListener("pointermove", handlePointerMove);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  useEffect(() => {
    function handlePointerUp(ev: PointerEvent) {
      if (ev.button !== 0 || !selectionStartRef.current) return;

      const selectionArea = Math.abs(
        (selectionStartRef.current.startX - ev.clientX) *
          (selectionStartRef.current.startY - ev.clientY)
      );
      const areaThreshold = 25;
      
      if (selectionArea < areaThreshold) {
        // Small movement = tap/click (not a drag)
        const target = ev.target as Element;
        if (!target.closest("[data-interactive]")) {
          // Clicked/tapped empty space - deselect all (works for both mouse and touch)
          // Only deselect if not currently dragging a node
          if (!draggedNodeId) {
            dispatch(setSelectedNodeIds([]));
            dispatch(setSelectedEdgeIds([]));
          }
        }
      } else if (pointerTypeRef.current === "mouse") {
        // Only process selection box for mouse, not touch
        const world1 = screenToWorld(
          selectionStartRef.current.startX,
          selectionStartRef.current.startY,
          viewport
        );
        const world2 = screenToWorld(ev.clientX, ev.clientY, viewport);

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
      }
      // If touch with large movement, do nothing (was probably panning)
      
      setSelectionBox(null);
      selectionStartRef.current = null;
      pointerTypeRef.current = null;
    }
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dispatch, edges, mapOrientation, nodeMap, nodes, viewport, draggedNodeId]);

  return selectionBox;
};
