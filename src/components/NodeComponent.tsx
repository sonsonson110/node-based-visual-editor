import React, { useState, useRef, useEffect } from "react";
import {
  NodeContainer,
  NodeContentText,
  NodeContentTextarea,
  NodeResizingIndicator,
  ResizeHandle,
} from "../styled";
import type { Node } from "../types";
import { roundToNearest } from "../utils";

interface NodeComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  node: Node;
  isSelected: boolean;
  isResizing: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onResizePointerDown: (e: React.PointerEvent) => void;
  onContentChange?: (newContent: string) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isSelected,
  isResizing,
  onPointerDown,
  onResizePointerDown,
  onContentChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(node.content || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTapTimeRef = useRef<number>(0);

  const displayWidth = roundToNearest(node.width, 2);
  const displayHeight = roundToNearest(node.height, 2);

  const DOUBLE_TAP_DELAY = 300; // ms

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();

      // Handle click/touch outside to blur on touch devices
      const handlePointerDownOutside = (e: PointerEvent) => {
        if (
          textareaRef.current &&
          !textareaRef.current.contains(e.target as HTMLElement)
        ) {
          textareaRef.current.blur();
        }
      };

      document.addEventListener("pointerdown", handlePointerDownOutside, true);
      return () => {
        document.removeEventListener("pointerdown", handlePointerDownOutside, true);
      };
    }
  }, [isEditing]);

  const startEditing = () => {
    if (node.isDisabled) return;
    setIsEditing(true);
    setEditedContent(node.content || "");
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startEditing();
  };

  const handlePointerDownWithDoubleTap = (e: React.PointerEvent) => {
    // Double-tap detection for touch devices
    if (e.pointerType === "touch") {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;

      if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
        e.preventDefault();
        e.stopPropagation();
        startEditing();
        lastTapTimeRef.current = 0;
        return;
      }
      lastTapTimeRef.current = now;
    }

    // Pass through to original handler for drag/selection
    onPointerDown(e);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedContent.trim() !== node.content) {
      onContentChange?.(editedContent.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditedContent(node.content || "");
    }
  };

  return (
    <NodeContainer
      $x={node.x}
      $y={node.y}
      $width={node.width}
      $height={node.height}
      $isSelected={isSelected}
      $isDisabled={node.isDisabled}
      onPointerDown={handlePointerDownWithDoubleTap}
      onDoubleClick={handleDoubleClick}
      data-interactive
    >
      {isEditing ? (
        <NodeContentTextarea
          ref={textareaRef}
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder={node.id}
          $maxWidth={node.width}
        />
      ) : (
        <NodeContentText>{node.content || node.id}</NodeContentText>
      )}
      {isSelected && <ResizeHandle onPointerDown={onResizePointerDown} />}
      {isResizing && (
        <NodeResizingIndicator>{`${displayWidth} x ${displayHeight}`}</NodeResizingIndicator>
      )}
    </NodeContainer>
  );
};

export default React.memo(NodeComponent);
