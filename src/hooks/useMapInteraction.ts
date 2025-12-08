import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { NODE_HEIGHT, NODE_WIDTH } from "../constants";
import {
  selectNodes,
  selectSelectedNodeIds,
  selectViewport,
  setNodes,
  setSelectedNodeIds,
  setViewport,
} from "../store/editorSlice";
import type { SelectionBoxMeta } from "../types";
import { screenToWorld, snapToGrid } from "../utils";

interface MapInteractionOptions {
  worldContainerRef: RefObject<HTMLDivElement | null>;
}

export const useMapInteraction = ({
  worldContainerRef,
}: MapInteractionOptions) => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const viewport = useAppSelector(selectViewport);
  const selectedNodeIds = useAppSelector(selectSelectedNodeIds);

  const [isPanning, setIsPanning] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBoxMeta | null>(
    null
  );

  const panStart = useRef({ x: 0, y: 0 });
  const dragAnchor = useRef<{
    offsets: Record<string, { dx: number; dy: number }>;
  } | null>(null);
  // Ref to track if a drag has occurred
  const hasDragged = useRef(false);
  const potentialDeselection = useRef<string | null>(null);

  const dragRaf = useRef<number | null>(null);
  const panRaf = useRef<number | null>(null);

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  const selectedNodeIdSet = useMemo(
    () => new Set(selectedNodeIds),
    [selectedNodeIds]
  );

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
        !worldContainerRef.current.contains(e.target as Node)
      ) {
        dispatch(setSelectedNodeIds([]));
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [dispatch, worldContainerRef]);

  // Dragging logic
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!draggedNodeId || !worldContainerRef.current) return;
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
              const nextX = worldPos.x - offset.dx;
              const nextY = worldPos.y - offset.dy;
              return {
                ...node,
                x: snapEnabled ? snapToGrid(nextX) : nextX,
                y: snapEnabled ? snapToGrid(nextY) : nextY,
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
  }, [
    dispatch,
    draggedNodeId,
    nodes,
    selectedNodeIds,
    viewport,
    worldContainerRef,
  ]);

  // Panning logic - mousedown handler
  useEffect(() => {
    const container = worldContainerRef.current;
    if (!container) return;

    function handleMouseDown(e: MouseEvent) {
      if (draggedNodeId) return;
      if (e.button === 1 || e.button === 2) {
        setIsPanning(true);
        panStart.current = { x: e.pageX - viewport.x, y: e.pageY - viewport.y };
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [dispatch, draggedNodeId, viewport.x, viewport.y, worldContainerRef]);

  // Panning logic - mousemove and mouseup handlers
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isPanning) return;
      if (panRaf.current) {
        cancelAnimationFrame(panRaf.current);
      }
      panRaf.current = requestAnimationFrame(() => {
        dispatch(
          setViewport({
            ...viewport,
            x: e.pageX - panStart.current.x,
            y: e.pageY - panStart.current.y,
          })
        );
      });
    }
    function handleMouseUp(e: MouseEvent) {
      if (e.button === 1 || e.button === 2) {
        setIsPanning(false);
      }
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (panRaf.current) {
        cancelAnimationFrame(panRaf.current);
      }
    };
  }, [dispatch, isPanning, viewport]);

  // Zooming logic
  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const mouseWorld = screenToWorld(e.pageX, e.pageY, viewport);
      const newZoom = Math.min(
        3,
        Math.max(0.3, viewport.zoom * (1 - e.deltaY * 0.001))
      );
      dispatch(
        setViewport({
          zoom: newZoom,
          x: e.pageX - mouseWorld.x * newZoom,
          y: e.pageY - mouseWorld.y * newZoom,
        })
      );
    }
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, [dispatch, viewport]);

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
              node.x + NODE_WIDTH <= xMax &&
              node.y >= yMin &&
              node.y + NODE_HEIGHT <= yMax
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

  // Node interaction handlers
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
    selectionBox,
    isPanning,
    draggedNodeId,
    handleNodeMouseDown,
  };
};
