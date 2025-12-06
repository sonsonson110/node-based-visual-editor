import React from "react";
import { NODE_HEIGHT, NODE_WIDTH } from "../constants";
import type { Node } from "../types";

interface NodeComponentProps {
  node: Node;
  isDragging: boolean;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isDragging,
  isSelected,
  onMouseDown,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        border: isDragging ? "2px solid red" : "1px solid #000",
        outline: isSelected ? "2px dashed blue" : "none",
        outlineOffset: 2,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        pointerEvents: "auto",
      }}
      onMouseDown={onMouseDown}
    >
      {node.id}
    </div>
  );
};

export default React.memo(NodeComponent);
