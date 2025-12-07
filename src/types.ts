export interface Node {
  id: string;
  x: number;
  y: number;
}

export interface Edge {
  from: string;
  to: string;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
