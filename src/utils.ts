import {
  ARROW_LENGTH,
  CONTROL_OFFSET_MIN,
  CONTROL_OFFSET_RATIO,
  GRID_SIZE,
} from "./constants";
import type { MapOrientation, Node, Viewport } from "./types";

export function getEdgeId(from: string, to: string) {
  return `${from}->${to}`;
}

export function getEdgeMetrics(
  fromNode: Node,
  toNode: Node,
  orientation: MapOrientation
) {
  let x1, y1, x2, y2, cp1x, cp1y, cp2x, cp2y;

  if (orientation === "left-right") {
    // Start: Right center of fromNode
    [x1, y1] = getRectCenterRight(
      fromNode.x,
      fromNode.y,
      fromNode.width,
      fromNode.height
    );
    // End: Left center of toNode (minus arrow length)
    [x2, y2] = getRectCenterLeft(toNode.x, toNode.y, toNode.height);
    x2 -= ARROW_LENGTH;

    const dist = Math.abs(x2 - x1);
    const controlOffset = Math.max(
      dist * CONTROL_OFFSET_RATIO,
      CONTROL_OFFSET_MIN
    );

    cp1x = x1 + controlOffset;
    cp1y = y1;
    cp2x = x2 - controlOffset;
    cp2y = y2;
  } else {
    // Top-down (default)
    // Start: Bottom center of fromNode
    x1 = fromNode.x + fromNode.width / 2;
    y1 = fromNode.y + fromNode.height;
    // End: Top center of toNode (minus arrow length)
    x2 = toNode.x + toNode.width / 2;
    y2 = toNode.y - ARROW_LENGTH;

    const dist = Math.abs(y2 - y1);
    const controlOffset = Math.max(
      dist * CONTROL_OFFSET_RATIO,
      CONTROL_OFFSET_MIN
    );

    cp1x = x1;
    cp1y = y1 + controlOffset;
    cp2x = x2;
    cp2y = y2 - controlOffset;
  }

  const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

  return {
    x1,
    y1,
    x2,
    y2,
    cp1x,
    cp1y,
    cp2x,
    cp2y,
    path,
  };
}

export function getRectCenter(
  x: number,
  y: number,
  width: number,
  height: number
) {
  return {
    cx: x + width / 2,
    cy: y + height / 2,
  };
}

export function getRectCenterLeft(x: number, y: number, height: number) {
  const cx = x;
  const cy = y + height / 2;
  return [cx, cy];
}

export function getRectCenterRight(
  x: number,
  y: number,
  width: number,
  height: number
) {
  const cx = x + width;
  const cy = y + height / 2;
  return [cx, cy];
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

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function roundToNearest(value: number, decimalPlaces: number = 0) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}
