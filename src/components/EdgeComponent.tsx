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

const DOUBLE_TAP_DELAY = 300; // ms
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
  const { path, x2, y2, midX, midY } = getEdgeMetrics(
    fromNode,
    toNode,
    orientation
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(label || "");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastTapTime = useRef<number>(0);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();

      // Handle click/touch outside to blur on touch devices
      const handlePointerDownOutside = (e: PointerEvent) => {
        if (
          inputRef.current &&
          !inputRef.current.contains(e.target as HTMLElement)
        ) {
          inputRef.current.blur();
        }
      };

      document.addEventListener("pointerdown", handlePointerDownOutside, true);
      return () => {
        document.removeEventListener("pointerdown", handlePointerDownOutside, true);
      };
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditedLabel(label || "");
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Handle double-tap for touch devices
    if (e.pointerType === "touch") {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime.current;

      if (timeSinceLastTap < DOUBLE_TAP_DELAY && timeSinceLastTap > 0) {
        // Double tap detected
        e.stopPropagation();
        e.preventDefault();
        setIsEditing(true);
        setEditedLabel(label || "");
        lastTapTime.current = 0; // Reset to prevent triple-tap
      } else {
        lastTapTime.current = now;
      }
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedLabel.trim() !== label) {
      onLabelChange?.(editedLabel.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditedLabel(label || "");
    }
  };

  const angle = orientation === "left-right" ? 0 : 90;
  const edgeColor = color || "#555";

  return (
    <g
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      style={{
        pointerEvents: "all",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}
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
        <foreignObject
          x={midX - 75}
          y={midY - 50}
          width="150"
          height="100"
          style={{ overflow: "visible", pointerEvents: "none" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                maxWidth: "150px",
                wordWrap: "break-word",
                textAlign: "center",
                fontSize: "12px",
                color: edgeColor,
                userSelect: "none",
                pointerEvents: "all",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {label}
            </div>
          </div>
        </foreignObject>
      )}

      {/* Editing Input */}
      {isEditing && (
        <foreignObject
          x={midX - 75}
          y={midY - 50}
          width="150"
          height="100"
          style={{ overflow: "visible" }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={editedLabel}
              onChange={(e) => setEditedLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              style={{
                fieldSizing: "content",
                pointerEvents: "all",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                textAlign: "center",
                fontSize: "12px",
                color: edgeColor,
                outline: "none",
                resize: "none",
                overflow: "hidden",
                fontFamily: "inherit",
              }}
            />
          </div>
        </foreignObject>
      )}
    </g>
  );
}

export default React.memo(EdgeComponent);
