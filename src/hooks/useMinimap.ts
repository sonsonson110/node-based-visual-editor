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
    const padding = 50;
    return {
      x: xMin - padding,
      y: yMin - padding,
      width: xMax - xMin + padding * 2,
      height: yMax - yMin + padding * 2,
    };
  }, [nodes]);

  // Calculate base scale to fit world bounds into fixed minimap dimensions
  const baseMinimapScale = useMemo(() => {
    if (worldBounds.width === 0 || worldBounds.height === 0) return 1;
    const scaleX = MINIMAP_WIDTH / worldBounds.width;
    const scaleY = MINIMAP_HEIGHT / worldBounds.height;
    return Math.min(scaleX, scaleY);
  }, [worldBounds]);

  // Apply viewport zoom to minimap scale, clamped to always fit all content at minimum
  const minimapScale = useMemo(() => {
    // When viewport.zoom > 1 (zoomed in), show minimap content larger
    // When viewport.zoom < 1 (zoomed out), clamp to baseMinimapScale to fit all content
    return Math.max(baseMinimapScale, baseMinimapScale * viewport.zoom);
  }, [baseMinimapScale, viewport.zoom]);

  // Calculate the visible content size at current minimap scale
  const scaledContentSize = useMemo(() => ({
    width: worldBounds.width * minimapScale,
    height: worldBounds.height * minimapScale,
  }), [worldBounds, minimapScale]);

  // Calculate offset to center viewport in minimap when zoomed in
  const contentOffset = useMemo(() => {
    const topLeft = screenToWorld(0, 0, viewport);
    const bottomRight = screenToWorld(screenWidth, screenHeight, viewport);
    const viewportCenterWorld = {
      x: (topLeft.x + bottomRight.x) / 2,
      y: (topLeft.y + bottomRight.y) / 2,
    };

    // Where the viewport center would be in uncentered minimap coords
    const viewportCenterMinimap = {
      x: (viewportCenterWorld.x - worldBounds.x) * minimapScale,
      y: (viewportCenterWorld.y - worldBounds.y) * minimapScale,
    };

    // Offset to center the viewport in the minimap
    let offsetX = MINIMAP_WIDTH / 2 - viewportCenterMinimap.x;
    let offsetY = MINIMAP_HEIGHT / 2 - viewportCenterMinimap.y;

    // Clamp offset so content doesn't scroll beyond edges
    // (only matters when content is larger than minimap)
    if (scaledContentSize.width > MINIMAP_WIDTH) {
      const minOffset = MINIMAP_WIDTH - scaledContentSize.width;
      offsetX = clamp(offsetX, minOffset, 0);
    } else {
      // Center when content fits
      offsetX = (MINIMAP_WIDTH - scaledContentSize.width) / 2;
    }

    if (scaledContentSize.height > MINIMAP_HEIGHT) {
      const minOffset = MINIMAP_HEIGHT - scaledContentSize.height;
      offsetY = clamp(offsetY, minOffset, 0);
    } else {
      // Center when content fits
      offsetY = (MINIMAP_HEIGHT - scaledContentSize.height) / 2;
    }

    return { x: offsetX, y: offsetY };
  }, [worldBounds, minimapScale, viewport, screenWidth, screenHeight, scaledContentSize]);

  const minimapNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      x: (node.x - worldBounds.x) * minimapScale + contentOffset.x,
      y: (node.y - worldBounds.y) * minimapScale + contentOffset.y,
      miniWidth: node.width * minimapScale,
      miniHeight: node.height * minimapScale,
    }));
  }, [nodes, worldBounds, minimapScale, contentOffset]);

  const minimapNodeMap = useMemo(() => {
    return new Map(minimapNodes.map((node) => [node.id, node]));
  }, [minimapNodes]);

  const viewportIndicator = useMemo(() => {
    const topLeft = screenToWorld(0, 0, viewport);
    const bottomRight = screenToWorld(screenWidth, screenHeight, viewport);
    return {
      x: (topLeft.x - worldBounds.x) * minimapScale + contentOffset.x,
      y: (topLeft.y - worldBounds.y) * minimapScale + contentOffset.y,
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
    contentOffset,
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

    const worldX = (nextX - contentOffset.x) / minimapScale + worldBounds.x;
    const worldY = (nextY - contentOffset.y) / minimapScale + worldBounds.y;

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
