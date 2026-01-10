import type { MAP_ORIENTATIONS } from "./constants";

export interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  isDisabled?: boolean;
}

export interface Edge {
  from: string;
  to: string;
  label?: string;
  color?: string;
  isAnimated?: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface SelectionBoxMeta {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface WorldBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type MapOrientation = (typeof MAP_ORIENTATIONS)[number];
