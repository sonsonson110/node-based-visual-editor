import { useMemo } from "react";
import { useAppDispatch, useAppSelector, useWindowSize } from ".";
import {
  MINIMAP_HEIGHT,
  MINIMAP_WIDTH
} from "../constants";
import {
  selectEdges,
  selectNodes,
  selectViewport,
  setViewport,
} from "../store/editorSlice";
import type { WorldBounds } from "../types";
import { clamp, screenToWorld } from "../utils";

export function useMinimap() {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const viewport = useAppSelector(selectViewport);

  // Track window size for viewport calculations
  const { width: screenWidth, height: screenHeight } = useWindowSize();

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
      xMax = Math.max(xMax, node.x + node.width);
      yMax = Math.max(yMax, node.y + node.height);
    });
    const padding = 200;
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
      miniWidth: node.width * minimapScale,
      miniHeight: node.height * minimapScale,
    }));
  }, [nodes, worldBounds, minimapScale]);

  const minimapNodeMap = useMemo(() => {
    return new Map(minimapNodes.map((node) => [node.id, node]));
  }, [minimapNodes]);

  const viewportIndicator = useMemo(() => {
    const topLeft = screenToWorld(0, 0, viewport);
    const bottomRight = screenToWorld(screenWidth, screenHeight, viewport);
    return {
      x: (topLeft.x - worldBounds.x) * minimapScale,
      y: (topLeft.y - worldBounds.y) * minimapScale,
      width: (bottomRight.x - topLeft.x) * minimapScale,
      height: (bottomRight.y - topLeft.y) * minimapScale,
    };
  }, [
    minimapScale,
    viewport,
    screenHeight,
    screenWidth,
    worldBounds.x,
    worldBounds.y,
  ]);

  const updateViewportFromMinimap = (miniX: number, miniY: number) => {
    const maxX = MINIMAP_WIDTH - viewportIndicator.width;
    const maxY = MINIMAP_HEIGHT - viewportIndicator.height;

    let nextX = miniX;
    let nextY = miniY;

    // Only clamp if the CURRENT viewport is already inside the bounds.
    // This prevents "jumping" when dragging a viewport that is currently out of bounds,
    // but enforces the boundary once the viewport is brought inside.
    const safeBuffer = 0.1;
    const isInsideX = viewportIndicator.x >= 0 && viewportIndicator.x <= maxX;
    if (isInsideX) {
      nextX = clamp(miniX, 0, maxX - safeBuffer);
    }
    const isInsideY = viewportIndicator.y >= 0 && viewportIndicator.y <= maxY;
    if (isInsideY) {
      nextY = clamp(miniY, 0, maxY - safeBuffer);
    }

    const worldX = nextX / minimapScale + worldBounds.x;
    const worldY = nextY / minimapScale + worldBounds.y;

    dispatch(
      setViewport({
        x: -worldX * viewport.zoom,
        y: -worldY * viewport.zoom,
      })
    );
  };

  return {
    minimapNodes,
    edges,
    minimapNodeMap,
    viewportIndicator,
    updateViewportFromMinimap,
  };
}
