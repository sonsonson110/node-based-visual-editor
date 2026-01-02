import React from "react";
import type { MapOrientation, Node } from "../types";
import { getEdgeMetrics } from "../utils";

interface EdgeComponentProps {
  fromNode: Node;
  toNode: Node;
  orientation: MapOrientation;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  color?: string;
}

function EdgeComponent({
  fromNode,
  toNode,
  orientation,
  isSelected,
  onClick,
  color,
}: EdgeComponentProps) {
  const { path, x2, y2 } = getEdgeMetrics(fromNode, toNode, orientation);

  const angle = orientation === "left-right" ? 0 : 90;
  const edgeColor = color || "#555";

  return (
    <g
      onClick={onClick}
      style={{ pointerEvents: "all", cursor: "pointer" }}
      data-interactive
    >
      {/* Hit area - invisible but clickable */}
      <path d={path} stroke="transparent" strokeWidth="6" fill="none" />
      <g transform={`translate(${x2}, ${y2}) rotate(${angle})`}>
        <polygon
          points="-2,-6 13,0 -2,6"
          fill="transparent"
          stroke="transparent"
          strokeWidth="0"
        />
      </g>

      {/* Selection highlight */}
      {isSelected && (
        <>
          <path
            d={path}
            stroke="rgba(0, 123, 255, 0.5)"
            strokeWidth="6"
            fill="none"
          />
          <g transform={`translate(${x2}, ${y2}) rotate(${angle})`}>
            <polygon points="-2,-6 13,0 -2,6" fill="rgba(0, 123, 255, 0.5)" />
          </g>
        </>
      )}

      {/* Visible edge */}
      <path d={path} stroke={edgeColor} strokeWidth="2" fill="none" />

      {/* Arrowhead */}
      <g transform={`translate(${x2}, ${y2}) rotate(${angle})`}>
        <polygon points="0,-3.5 10,0 0,3.5" fill={edgeColor} />
      </g>
    </g>
  );
}

export default React.memo(EdgeComponent);
