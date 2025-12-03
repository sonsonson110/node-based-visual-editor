import { NODE_HALF_HEIGHT, NODE_HALF_WIDTH, NODE_WIDTH } from "./constants";
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
