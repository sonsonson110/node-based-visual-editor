import {
  GRID_SIZE,
  NODE_HALF_HEIGHT,
  NODE_HALF_WIDTH,
  NODE_WIDTH,
} from "./constants";
import type { Node, Viewport } from "./types";

export function getNodeCenter(node: Node) {
  return {
    cx: node.x + NODE_HALF_WIDTH,
    cy: node.y + NODE_HALF_HEIGHT,
  };
}

export function getNodeCenterLeft(node: Node) {
  return {
    cx: node.x,
    cy: node.y + NODE_HALF_HEIGHT,
  };
}

export function getNodeCenterRight(node: Node) {
  return {
    cx: node.x + NODE_WIDTH,
    cy: node.y + NODE_HALF_HEIGHT,
  };
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: Viewport
) {
  return {
    x: (screenX - viewport.x) / viewport.zoom,
    y: (screenY - viewport.y) / viewport.zoom,
  };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  viewport: Viewport
) {
  return {
    x: worldX * viewport.zoom + viewport.x,
    y: worldY * viewport.zoom + viewport.y,
  };
}

export function snapToGrid(value: number) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}
