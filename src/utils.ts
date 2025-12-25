import { GRID_SIZE } from "./constants";
import type { Viewport } from "./types";

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
  return {
    cx: x,
    cy: y + height / 2,
  };
}

export function getRectCenterRight(
  x: number,
  y: number,
  width: number,
  height: number
) {
  return {
    cx: x + width,
    cy: y + height / 2,
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

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function roundToNearest(value: number, decimalPlaces: number = 0) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}
