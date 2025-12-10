import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { selectEdges, selectNodes, selectViewport } from "../store/editorSlice";
import {
  MINIMAP_HEIGHT,
  MINIMAP_WIDTH,
  NODE_HEIGHT,
  NODE_WIDTH,
} from "../constants";
import type { WorldBounds } from "../types";

export function useMinimap() {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const viewport = useAppSelector(selectViewport);

  // Calculate world bounds based on nodes' positions
  const worldBounds: WorldBounds = useMemo(() => {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    let xMin = Infinity;
    let yMin = Infinity;
    let xMax = -Infinity;
    let yMax = -Infinity;
    nodes.forEach((node) => {
      xMin = Math.min(xMin, node.x);
      yMin = Math.min(yMin, node.y);
      xMax = Math.max(xMax, node.x + NODE_WIDTH);
      yMax = Math.max(yMax, node.y + NODE_WIDTH);
    });
    const padding = 50;
    return {
      x: xMin - padding,
      y: yMin - padding,
      width: xMax - xMin + padding * 2,
      height: yMax - yMin + padding * 2,
    };
  }, [nodes]);

  // Calculate scale to fit world bounds into minimap dimensions
  const minimapScale = useMemo(() => {
    const scaleX = MINIMAP_WIDTH / worldBounds.width;
    const scaleY = MINIMAP_HEIGHT / worldBounds.height;
    return Math.min(scaleX, scaleY);
  }, [worldBounds]);

  const minimapNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      x: (node.x - worldBounds.x) * minimapScale,
      y: (node.y - worldBounds.y) * minimapScale,
      miniWidth: NODE_WIDTH * minimapScale,
      miniHeight: NODE_HEIGHT * minimapScale,
    }));
  }, [nodes, worldBounds, minimapScale]);

  const minimapNodeMap = useMemo(() => {
    return new Map(minimapNodes.map((node) => [node.id, node]));
  }, [minimapNodes]);

  return { minimapNodes, edges, minimapNodeMap };
}
