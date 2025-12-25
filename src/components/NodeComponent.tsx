import React from "react";
import { NodeContainer, NodeResizingIndicator, ResizeHandle } from "../styled";
import type { Node } from "../types";
import { roundToNearest } from "../utils";

interface NodeComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  node: Node;
  isSelected: boolean;
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeMouseDown: (e: React.MouseEvent) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isSelected,
  isResizing,
  onMouseDown,
  onResizeMouseDown,
}) => {
  const displayWidth = roundToNearest(node.width, 2);
  const displayHeight = roundToNearest(node.height, 2);
  return (
    <NodeContainer
      $x={node.x}
      $y={node.y}
      $width={node.width}
      $height={node.height}
      $isSelected={isSelected}
      onMouseDown={onMouseDown}
    >
      {node.id}
      {isSelected && <ResizeHandle onMouseDown={onResizeMouseDown} />}
      {isResizing && (
        <NodeResizingIndicator>{`${displayWidth} x ${displayHeight}`}</NodeResizingIndicator>
      )}
    </NodeContainer>
  );
};

export default React.memo(NodeComponent);
