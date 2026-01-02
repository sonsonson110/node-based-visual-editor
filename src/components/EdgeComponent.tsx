import React from "react";
import type { Node, MapOrientation } from "../types";
import { getRectCenterLeft, getRectCenterRight } from "../utils";

interface EdgeComponentProps {
  fromNode: Node;
  toNode: Node;
  orientation: MapOrientation;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const ARROW_LENGTH = 10;
const CONTROL_OFFSET_RATIO = 0.55;
const CONTROL_OFFSET_MIN = 50;

function EdgeComponent({
  fromNode,
  toNode,
  orientation,
  isSelected,
  onClick,
}: EdgeComponentProps) {
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

  return (
    <g onClick={onClick} style={{ pointerEvents: "all", cursor: "pointer" }}>
      {/* Hit area - invisible but clickable */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="4"
        fill="none"
      />
      
      {/* Selection highlight */}
      {isSelected && (
        <path
          d={path}
          stroke="rgba(0, 123, 255, 0.3)"
          strokeWidth="4"
          fill="none"
        />
      )}

      {/* Visible edge */}
      <path
        d={path}
        stroke="#555"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
    </g>
  );
}

export default React.memo(EdgeComponent);
