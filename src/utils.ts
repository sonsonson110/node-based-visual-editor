import {
  ARROW_LENGTH,
  CONTROL_OFFSET_MIN,
  CONTROL_OFFSET_RATIO,
  GRID_SIZE,
} from "./constants";
import type { MapOrientation, Node, Viewport } from "./types";

/**
 * Calculates Euclidean distance between two points
 */
export function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

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

  // Calculate midpoint for cubic bezier: B(0.5)
  // B(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t) t^2 P2 + t^3 P3
  // t = 0.5 => coefficients are 0.125, 0.375, 0.375, 0.125
  const midX = 0.125 * (x1 + x2) + 0.375 * (cp1x + cp2x);
  const midY = 0.125 * (y1 + y2) + 0.375 * (cp1y + cp2y);

  return {
    x1,
    y1,
    x2,
    y2,
    cp1x,
    cp1y,
    cp2x,
    cp2y,
    midX,
    midY,
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

export function getBezierBounds(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number
) {
  const tvalues: number[] = [];
  const xValues: number[] = [];
  const yValues: number[] = [];

  let a, b, c, t, t1, t2, b2ac, sqrtb2ac;

  for (let i = 0; i < 2; ++i) {
    if (i == 0) {
      b = 6 * x0 - 12 * x1 + 6 * x2;
      a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
      c = 3 * x1 - 3 * x0;
    } else {
      b = 6 * y0 - 12 * y1 + 6 * y2;
      a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
      c = 3 * y1 - 3 * y0;
    }

    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) < 1e-12) {
        continue;
      }
      t = -c / b;
      if (0 < t && t < 1) {
        tvalues.push(t);
      }
      continue;
    }
    b2ac = b * b - 4 * c * a;
    if (b2ac < 0) {
      if (Math.abs(b2ac) < 1e-12) b2ac = 0;
      else continue;
    }
    sqrtb2ac = Math.sqrt(b2ac);
    t1 = (-b + sqrtb2ac) / (2 * a);
    if (0 < t1 && t1 < 1) {
      tvalues.push(t1);
    }
    t2 = (-b - sqrtb2ac) / (2 * a);
    if (0 < t2 && t2 < 1) {
      tvalues.push(t2);
    }
  }

  let j = tvalues.length;
  let mt;
  while (j--) {
    t = tvalues[j];
    mt = 1 - t;
    xValues[j] =
      mt * mt * mt * x0 +
      3 * mt * mt * t * x1 +
      3 * mt * t * t * x2 +
      t * t * t * x3;
    yValues[j] =
      mt * mt * mt * y0 +
      3 * mt * mt * t * y1 +
      3 * mt * t * t * y2 +
      t * t * t * y3;
  }

  xValues.push(x0, x3);
  yValues.push(y0, y3);

  return {
    minX: Math.min(...xValues),
    maxX: Math.max(...xValues),
    minY: Math.min(...yValues),
    maxY: Math.max(...yValues),
  };
}
