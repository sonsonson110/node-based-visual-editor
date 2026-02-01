import { useMemo } from "react";
import { useAppSelector, useWindowSize } from ".";
import { selectEdges, selectNodes, selectViewport } from "../store/editorSlice";
import { screenToWorld } from "../utils";
import type { Node } from "../types";

/**
 * Buffer size in world coordinates.
 * Nodes within this distance from the viewport edge are still rendered.
 * Larger buffer = smoother scrolling but more nodes rendered.
 */
const VISIBILITY_BUFFER = 200;

interface VisibleBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Check if a node's bounding box intersects with the visible bounds
 */
function isNodeVisible(node: Node, bounds: VisibleBounds): boolean {
  const nodeRight = node.x + node.width;
  const nodeBottom = node.y + node.height;

  // AABB intersection check
  return (
    node.x < bounds.right &&
    nodeRight > bounds.left &&
    node.y < bounds.bottom &&
    nodeBottom > bounds.top
  );
}

/**
 * Hook that calculates which nodes and edges are within the visible viewport.
 * Returns only the nodes/edges that should be rendered, significantly reducing
 * DOM elements for large datasets.
 *
 * Uses a buffer zone around the viewport to prevent pop-in during panning.
 */
export function useVisibleNodes() {
  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const viewport = useAppSelector(selectViewport);
  const { width: screenWidth, height: screenHeight } = useWindowSize();

  // Calculate visible bounds in world coordinates
  const visibleBounds = useMemo((): VisibleBounds => {
    const topLeft = screenToWorld(0, 0, viewport);
    const bottomRight = screenToWorld(screenWidth, screenHeight, viewport);

    return {
      left: topLeft.x - VISIBILITY_BUFFER,
      right: bottomRight.x + VISIBILITY_BUFFER,
      top: topLeft.y - VISIBILITY_BUFFER,
      bottom: bottomRight.y + VISIBILITY_BUFFER,
    };
  }, [viewport, screenWidth, screenHeight]);

  // Filter nodes to only those within visible bounds
  const visibleNodes = useMemo(() => {
    return nodes.filter((node) => isNodeVisible(node, visibleBounds));
  }, [nodes, visibleBounds]);

  // Create a Set for O(1) lookup of visible node IDs
  const visibleNodeIds = useMemo(() => {
    return new Set(visibleNodes.map((node) => node.id));
  }, [visibleNodes]);

  // Filter edges: show edge if EITHER endpoint is visible (Option A - smoother)
  const visibleEdges = useMemo(() => {
    return edges.filter((edge) => {
      return visibleNodeIds.has(edge.from) || visibleNodeIds.has(edge.to);
    });
  }, [edges, visibleNodeIds]);

  return {
    visibleNodes,
    visibleNodeIds,
    visibleEdges,
  };
}
