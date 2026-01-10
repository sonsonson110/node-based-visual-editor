import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { getDistance, screenToWorld, snapToGrid } from "../utils";

/**
 * State Machine States:
 * - IDLE: No interaction in progress
 * - POINTER_DOWN: Pointer pressed, waiting to determine if it's a click or drag
 * - DRAGGING: Actively dragging node(s)
 *
 * State Diagram:
 * [IDLE]
 *   └─ POINTER_DOWN → [POINTER_DOWN]
 *
 * [POINTER_DOWN]
 *   ├─ POINTER_MOVE (distance ≥ threshold) → [DRAGGING]
 *   └─ POINTER_UP → resolveClick → [IDLE]
 *
 * [DRAGGING]
 *   ├─ POINTER_MOVE → updateDrag
 *   └─ POINTER_UP → endDrag → [IDLE]
 */
type InteractionState = "IDLE" | "POINTER_DOWN" | "DRAGGING";

// Distance threshold (in pixels) to distinguish click from drag
const DRAG_THRESHOLD = 3;

// Context stored when pointer is pressed
interface PointerDownContext {
  nodeId: string;
  startX: number; // Screen coordinates at pointer down
  startY: number;
  withShiftKey: boolean;
  offsets: Record<string, { dx: number; dy: number }>; // Offsets for all selected nodes
  potentialDeselection: string | null; // Node to potentially deselect on shift+click
  shouldReplaceSelection: boolean; // Whether to replace selection with just this node on click
}

export const useNodeMouseInteraction = () => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const viewport = useAppSelector(selectViewport);
  const selectedNodeIds = useAppSelector(selectSelectedNodeIds);

  // State machine current state
  const [state, setState] = useState<InteractionState>("IDLE");
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Context preserved across state transitions
  const contextRef = useRef<PointerDownContext | null>(null);

  // RAF handle for throttling drag updates
  const dragRaf = useRef<number | null>(null);

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  const selectedNodeIdSet = useMemo(
    () => new Set(selectedNodeIds),
    [selectedNodeIds]
  );

  /**
   * Resolves a click action (called when POINTER_UP in POINTER_DOWN state)
   * Handles selection logic: deselection for shift+click, or replace selection for regular click
   */
  const resolveClick = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx) return;

    if (ctx.potentialDeselection) {
      // Shift+click on an already selected node: deselect it
      const nextSelected = selectedNodeIds.filter(
        (id) => id !== ctx.potentialDeselection
      );
      dispatch(setSelectedNodeIds(nextSelected));
    } else if (ctx.shouldReplaceSelection) {
      // Click on an already selected node without shift: select only this node
      dispatch(setSelectedNodeIds([ctx.nodeId]));
    }
  }, [dispatch, selectedNodeIds]);

  /**
   * Updates node positions during drag (called on POINTER_MOVE in DRAGGING state)
   */
  const updateDrag = useCallback(
    (e: MouseEvent) => {
      const ctx = contextRef.current;
      if (!ctx) return;

      const snapEnabled = !e.altKey;
      const worldPos = screenToWorld(e.pageX, e.pageY, viewport);

      dispatch(
        setNodes(
          nodes.map((node) => {
            const offset = ctx.offsets[node.id];
            if (!offset) return node;

            let nextX = worldPos.x - offset.dx;
            let nextY = worldPos.y - offset.dy;

            // Apply grid snapping if enabled
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

            return { ...node, x: nextX, y: nextY };
          })
        )
      );
    },
    [dispatch, nodes, viewport]
  );

  /**
   * Cleans up drag state and transitions to IDLE
   */
  const endDrag = useCallback(() => {
    if (dragRaf.current) {
      cancelAnimationFrame(dragRaf.current);
      dragRaf.current = null;
    }
    contextRef.current = null;
    setState("IDLE");
    setDraggedNodeId(null);
  }, []);

  // Global event listeners for state machine transitions
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const ctx = contextRef.current;
      if (!ctx) return;

      if (state === "POINTER_DOWN") {
        // Check if movement exceeds drag threshold
        const distance = getDistance(ctx.startX, ctx.startY, e.pageX, e.pageY);
        if (distance >= DRAG_THRESHOLD) {
          // Transition: POINTER_DOWN → DRAGGING
          setState("DRAGGING");
          setDraggedNodeId(ctx.nodeId);
          // Immediately start dragging
          updateDrag(e);
        }
      } else if (state === "DRAGGING") {
        // Throttle drag updates with RAF
        if (dragRaf.current) {
          cancelAnimationFrame(dragRaf.current);
        }
        dragRaf.current = requestAnimationFrame(() => {
          updateDrag(e);
        });
      }
    }

    function handleMouseUp(e: MouseEvent) {
      if (e.button !== 0) return;

      if (state === "POINTER_DOWN") {
        // Transition: POINTER_DOWN → IDLE (click detected)
        resolveClick();
        endDrag();
      } else if (state === "DRAGGING") {
        // Transition: DRAGGING → IDLE
        endDrag();
      }
    }

    // Only attach listeners when not IDLE
    if (state !== "IDLE") {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (dragRaf.current) {
        cancelAnimationFrame(dragRaf.current);
      }
    };
  }, [state, updateDrag, resolveClick, endDrag]);

  /**
   * Entry point: handles initial pointer down on a node
   * Transition: IDLE → POINTER_DOWN
   */
  const handleNodeMouseDown = useCallback(
    (x: number, y: number, nodeId: string, withShiftKey: boolean) => {
      if (state !== "IDLE") return;

      const worldPos = screenToWorld(x, y, viewport);

      // Helper to compute drag offsets for a list of node IDs
      const computeOffsets = (nodeIds: string[]) => {
        const entries = nodeIds
          .map((id) => {
            const n = nodeMap.get(id);
            if (!n) return null;
            return [
              id,
              { dx: worldPos.x - n.x, dy: worldPos.y - n.y },
            ] as const;
          })
          .filter(
            (entry): entry is NonNullable<typeof entry> => entry !== null
          );
        return Object.fromEntries(entries);
      };

      // Clear edge selection when not holding shift
      if (!withShiftKey) {
        dispatch(setSelectedEdgeIds([]));
      }

      let offsets: Record<string, { dx: number; dy: number }>;
      let potentialDeselection: string | null = null;
      let shouldReplaceSelection = false;

      if (selectedNodeIdSet.has(nodeId)) {
        // Clicking on already selected node
        if (withShiftKey) {
          // Mark for potential deselection (only deselect if no drag occurs)
          potentialDeselection = nodeId;
        } else if (selectedNodeIds.length > 1) {
          // Multiple nodes selected, mark to replace selection on click (not drag)
          shouldReplaceSelection = true;
        }
        offsets = computeOffsets(selectedNodeIds);
      } else {
        // Clicking on unselected node - update selection
        let nextSelectedArray: string[];
        if (withShiftKey) {
          // Add to selection
          nextSelectedArray = [...selectedNodeIds, nodeId];
        } else {
          // Replace selection
          nextSelectedArray = [nodeId];
        }
        dispatch(setSelectedNodeIds(nextSelectedArray));
        offsets = computeOffsets(nextSelectedArray);
      }

      // Store context for subsequent events
      contextRef.current = {
        nodeId,
        startX: x,
        startY: y,
        withShiftKey,
        offsets,
        potentialDeselection,
        shouldReplaceSelection,
      };

      // Transition: IDLE → POINTER_DOWN
      setState("POINTER_DOWN");
    },
    [state, viewport, nodeMap, selectedNodeIdSet, selectedNodeIds, dispatch]
  );

  return {
    draggedNodeId,
    handleNodeMouseDown,
  };
};
