import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { SNAP_THRESHOLD } from "../constants";
import {
  selectNodes,
  selectSelectedNodeIds,
  selectViewport,
  setNodes,
  setSelectedEdgeIds,
  setSelectedNodeIds,
} from "../store/editorSlice";
import { screenToWorld, snapToGrid } from "../utils";

export const useNodeDrag = () => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const viewport = useAppSelector(selectViewport);
  const selectedNodeIds = useAppSelector(selectSelectedNodeIds);

  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const dragAnchor = useRef<{
    offsets: Record<string, { dx: number; dy: number }>;
  } | null>(null);
  const hasDragged = useRef(false);
  const potentialDeselection = useRef<string | null>(null);
  const dragRaf = useRef<number | null>(null);

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  const selectedNodeIdSet = useMemo(
    () => new Set(selectedNodeIds),
    [selectedNodeIds]
  );

  // Dragging logic
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!draggedNodeId) return;
      if (dragRaf.current) {
        cancelAnimationFrame(dragRaf.current);
      }

      dragRaf.current = requestAnimationFrame(() => {
        hasDragged.current = true;
        const snapEnabled = !e.altKey;

        const worldPos = screenToWorld(e.pageX, e.pageY, viewport);
        dispatch(
          setNodes(
            nodes.map((node) => {
              if (!dragAnchor.current) return node;
              const offset = dragAnchor.current.offsets[node.id];
              if (!offset) return node;
              let nextX = worldPos.x - offset.dx;
              let nextY = worldPos.y - offset.dy;
              // Snapping logic
              if (snapEnabled) {
                const snappedX = snapToGrid(nextX);
                if (Math.abs(snappedX - nextX) < SNAP_THRESHOLD) {
                  nextX = snappedX;
                }
                const snappedY = snapToGrid(nextY);
                if (Math.abs(snappedY - nextY) < SNAP_THRESHOLD) {
                  nextY = snappedY;
                }
              }
              return {
                ...node,
                x: nextX,
                y: nextY,
              };
            })
          )
        );
      });
    }
    function handleMouseUp(e: MouseEvent) {
      if (e.button !== 0) return;
      if (potentialDeselection.current && !hasDragged.current) {
        const nextSelected = selectedNodeIds.filter(
          (id) => id !== potentialDeselection.current
        );
        dispatch(setSelectedNodeIds(nextSelected));
      }
      dragAnchor.current = null;
      setDraggedNodeId(null);
      potentialDeselection.current = null;
      hasDragged.current = false;
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (dragRaf.current) {
        cancelAnimationFrame(dragRaf.current);
      }
    };
  }, [dispatch, draggedNodeId, nodes, selectedNodeIds, viewport]);

  const handleNodeMouseDown = (
    pageX: number,
    pageY: number,
    nodeId: string,
    withShiftKey: boolean
  ) => {
    setDraggedNodeId(nodeId);
    hasDragged.current = false;
    potentialDeselection.current = null;

    const worldPos = screenToWorld(pageX, pageY, viewport);
    const nextSelected = new Set(selectedNodeIdSet);
    let entries;
    const nodeListToOffsetEntries = (nodeIds: string[]) => {
      return nodeIds
        .map((id) => {
          const n = nodeMap.get(id);
          if (!n) return null;
          return [id, { dx: worldPos.x - n.x, dy: worldPos.y - n.y }];
        })
        .filter((entry) => entry !== null);
    };

    if (!withShiftKey) {
      dispatch(setSelectedEdgeIds([]));
    }

    if (selectedNodeIdSet.has(nodeId)) {
      if (withShiftKey) {
        potentialDeselection.current = nodeId;
      }
      // Drag entries
      entries = nodeListToOffsetEntries(selectedNodeIds);
    } else {
      // Selection logic
      if (withShiftKey) {
        nextSelected.add(nodeId);
      } else {
        nextSelected.clear();
        nextSelected.add(nodeId);
      }
      const nextSelectedArray = Array.from(nextSelected);
      dispatch(setSelectedNodeIds(nextSelectedArray));
      // Drag entries
      entries = nodeListToOffsetEntries(nextSelectedArray);
    }
    // Drag logic
    dragAnchor.current = {
      offsets: Object.fromEntries(entries),
    };
  };

  return {
    draggedNodeId,
    handleNodeMouseDown,
  };
};
