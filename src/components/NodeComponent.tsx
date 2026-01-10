import React, { useState, useRef, useEffect } from "react";
import {
  NodeContainer,
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
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeMouseDown: (e: React.MouseEvent) => void;
  onContentChange?: (newContent: string) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isSelected,
  isResizing,
  onMouseDown,
  onResizeMouseDown,
  onContentChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(node.content || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayWidth = roundToNearest(node.width, 2);
  const displayHeight = roundToNearest(node.height, 2);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (node.isDisabled) return;
    e.stopPropagation();
    setIsEditing(true);
    setEditedContent(node.content || "");
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
      onMouseDown={onMouseDown}
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
          onMouseDown={(e) => e.stopPropagation()}
          placeholder={node.id}
        />
      ) : (
        node.content || node.id
      )}
      {isSelected && !node.isDisabled && (
        <ResizeHandle onMouseDown={onResizeMouseDown} />
      )}
      {isResizing && (
        <NodeResizingIndicator>{`${displayWidth} x ${displayHeight}`}</NodeResizingIndicator>
      )}
    </NodeContainer>
  );
};

export default React.memo(NodeComponent);
