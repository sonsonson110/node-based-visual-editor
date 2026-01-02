import React from "react";
import type { Node, MapOrientation } from "../types";
import { getEdgeMetrics } from "../utils";

interface EdgeComponentProps {
  fromNode: Node;
  toNode: Node;
  orientation: MapOrientation;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

function EdgeComponent({
  fromNode,
  toNode,
  orientation,
  isSelected,
  onClick,
}: EdgeComponentProps) {
  const { path } = getEdgeMetrics(fromNode, toNode, orientation);

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
