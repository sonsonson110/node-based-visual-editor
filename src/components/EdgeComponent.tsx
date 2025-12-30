import React from "react";
import type { Node, MapOrientation } from "../types";

interface EdgeComponentProps {
  fromNode: Node;
  toNode: Node;
  orientation: MapOrientation;
}

function EdgeComponent({ fromNode, toNode, orientation }: EdgeComponentProps) {
  let x1, y1, x2, y2, cp1x, cp1y, cp2x, cp2y;
  const arrowLength = 10; // Match markerWidth

  if (orientation === "left-right") {
    // Start: Right center of fromNode
    x1 = fromNode.x + fromNode.width;
    y1 = fromNode.y + fromNode.height / 2;
    // End: Left center of toNode (minus arrow length)
    x2 = toNode.x - arrowLength;
    y2 = toNode.y + toNode.height / 2;

    const dist = Math.abs(x2 - x1);
    const controlOffset = Math.max(dist * 0.5, 30);

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
    y2 = toNode.y - arrowLength;

    const dist = Math.abs(y2 - y1);
    const controlOffset = Math.max(dist * 0.5, 30);

    cp1x = x1;
    cp1y = y1 + controlOffset;
    cp2x = x2;
    cp2y = y2 - controlOffset;
  }

  const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

  return (
    <path
      d={path}
      stroke="#555"
      strokeWidth="2"
      fill="none"
      markerEnd="url(#arrowhead)"
    />
  );
}

export default React.memo(EdgeComponent);
