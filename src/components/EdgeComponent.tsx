import React, { useState, useRef, useEffect } from "react";
import type { MapOrientation, Node } from "../types";
import { getEdgeMetrics } from "../utils";
import { EdgeVisblePath } from "../styled";

interface EdgeComponentProps {
  fromNode: Node;
  toNode: Node;
  orientation: MapOrientation;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  color?: string;
  label?: string;
  isAnimated?: boolean;
  onLabelChange?: (newLabel: string) => void;
}

function EdgeComponent({
  fromNode,
  toNode,
  orientation,
  isSelected,
  onClick,
  color,
  label,
  isAnimated = false,
  onLabelChange,
}: EdgeComponentProps) {
  const { path, x2, y2, x1, y1, cp1x, cp1y, cp2x, cp2y } = getEdgeMetrics(
    fromNode,
    toNode,
    orientation
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(label || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditedLabel(label || "");
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedLabel !== label) {
      onLabelChange?.(editedLabel);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditedLabel(label || "");
    }
  };

  // Calculate midpoint for cubic bezier: B(0.5)
  // B(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t) t^2 P2 + t^3 P3
  // t = 0.5 => coefficients are 0.125, 0.375, 0.375, 0.125
  const midX = 0.125 * (x1 + x2) + 0.375 * (cp1x + cp2x);
  const midY = 0.125 * (y1 + y2) + 0.375 * (cp1y + cp2y);

  const angle = orientation === "left-right" ? 0 : 90;
  const edgeColor = color || "#555";

  return (
    <g
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      style={{ pointerEvents: "all", cursor: "pointer" }}
      data-interactive
    >
      {/* Hit area - invisible but clickable */}
      <path d={path} stroke="transparent" strokeWidth="15" fill="none" />
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
      <EdgeVisblePath
        d={path}
        stroke={edgeColor}
        strokeWidth={2}
        fill="none"
        $isAnimated={isAnimated}
      />

      {/* Arrowhead */}
      <g transform={`translate(${x2}, ${y2}) rotate(${angle})`}>
        <polygon points="0,-3.5 10,0 0,3.5" fill={edgeColor} />
      </g>

      {/* Label Display */}
      {!isEditing && label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x="-30"
            y="-10"
            width="60"
            height="20"
            fill="white"
            opacity="0.8"
            rx="4"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill={edgeColor}
            style={{ pointerEvents: "none", userSelect: "none" }}
            dy="1"
          >
            {label}
          </text>
        </g>
      )}

      {/* Editing Input */}
      {isEditing && (
        <foreignObject
          x={midX - 40}
          y={midY - 12}
          width="80"
          height="24"
          style={{ overflow: "visible" }}
        >
          <input
            ref={inputRef}
            value={editedLabel}
            onChange={(e) => setEditedLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              height: "100%",
              border: "1px solid #007bff",
              borderRadius: "4px",
              fontSize: "12px",
              textAlign: "center",
              outline: "none",
              background: "white",
            }}
          />
        </foreignObject>
      )}
    </g>
  );
}

export default React.memo(EdgeComponent);
