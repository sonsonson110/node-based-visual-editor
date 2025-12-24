import React from "react";
import { NodeContainer, ResizeHandle } from "../styled";
import type { Node } from "../types";

interface NodeComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  node: Node;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeMouseDown: (e: React.MouseEvent) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isSelected,
  onMouseDown,
  onResizeMouseDown,
}) => {
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
    </NodeContainer>
  );
};

export default React.memo(NodeComponent);
