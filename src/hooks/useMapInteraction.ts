import { useEffect, useRef, useState, type RefObject } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { NODE_HEIGHT, NODE_WIDTH } from "../constants";
import {
  selectDraggedNodeId,
  selectNodes,
  selectSelectedNodeIds,
  selectViewport,
  setDraggedNodeId,
  setNodes,
  setSelectedNodeIds,
  setViewport,
} from "../store/editorSlice";
import type { Node as MapNode, SelectionBoxMeta } from "../types";
import { screenToWorld } from "../utils";

interface MapInteractionOptions {
  worldContainerRef: RefObject<HTMLDivElement | null>;
  selectionBox?: SelectionBoxMeta | null;
  setSelectionBox?: (box: SelectionBoxMeta | null) => void;
}

export const useMapInteraction = ({
  worldContainerRef,
  selectionBox,
  setSelectionBox,
}: MapInteractionOptions) => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const viewport = useAppSelector(selectViewport);
  const draggedNodeId = useAppSelector(selectDraggedNodeId);
  const selectedNodeIds = useAppSelector(selectSelectedNodeIds);

  const [isPanning, setIsPanning] = useState(false);

  const offset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(null);
  const panStart = useRef({ x: 0, y: 0 });

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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const worldPos = screenToWorld(e.pageX, e.pageY, viewport);

      animationFrameRef.current = requestAnimationFrame(() => {
        dispatch(
          setNodes(
            nodes.map((node) =>
              node.id === draggedNodeId
                ? {
                    ...node,
                    x: worldPos.x - offset.current.x,
                    y: worldPos.y - offset.current.y,
                  }
                : node
            )
          )
        );
      });
    }
    function handleMouseUp(e: MouseEvent) {
      if (e.button !== 0) return;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      dispatch(setDraggedNodeId(null));
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dispatch, draggedNodeId, nodes, viewport, worldContainerRef]);

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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
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

  // Selection box - mousedown & mousemove
  useEffect(() => {
    const container = worldContainerRef.current;
    if (!container) return;

    function handleMouseDown(e: MouseEvent) {
      if (draggedNodeId || isPanning) return;
      if (e.button === 0) {
        const startX = e.pageX;
        const startY = e.pageY;
        setSelectionBox?.({ startX, startY, endX: startX, endY: startY });
      }
    }

    function handleMouseMove(e: MouseEvent) {
      if (!selectionBox) return;
      setSelectionBox?.({
        ...selectionBox,
        endX: e.pageX,
        endY: e.pageY,
      });
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    dispatch,
    draggedNodeId,
    isPanning,
    selectionBox,
    setSelectionBox,
    worldContainerRef,
  ]);

  // Selection - mouseup
  useEffect(() => {
    function handleMouseUp(e: MouseEvent) {
      if (e.button !== 0 || !selectionBox) return;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        const world1 = screenToWorld(
          selectionBox.startX,
          selectionBox.startY,
          viewport
        );
        const world2 = screenToWorld(
          selectionBox.endX,
          selectionBox.endY,
          viewport
        );

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
        setSelectionBox?.(null);
      });
    }
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dispatch, nodes, selectionBox, setSelectionBox, viewport]);

  // Node interaction handlers
  const handleNodeMouseDown = (pageX: number, pageY: number, node: MapNode) => {
    dispatch(setDraggedNodeId(node.id));
    const worldPos = screenToWorld(pageX, pageY, viewport);
    offset.current = {
      x: worldPos.x - node.x,
      y: worldPos.y - node.y,
    };
  };

  const handleNodeSelect = (nodeId: string, multi: boolean) => {
    const nextSelected = new Set(selectedNodeIds);
    if (multi) {
      if (nextSelected.has(nodeId)) {
        nextSelected.delete(nodeId);
      } else {
        nextSelected.add(nodeId);
      }
      dispatch(setSelectedNodeIds(Array.from(nextSelected)));
    } else {
      dispatch(setSelectedNodeIds([nodeId]));
    }
  };

  const handleDeselectAllNodes = () => {
    dispatch(setSelectedNodeIds([]));
  };

  return { handleNodeMouseDown, handleNodeSelect, handleDeselectAllNodes };
};
