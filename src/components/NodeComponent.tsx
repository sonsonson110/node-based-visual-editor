import React from "react";
import type { Node } from "../types";

interface NodeComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  node: Node;
  isDragging: boolean;
  isSelected: boolean;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isDragging,
  isSelected,
  ...rest
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        border: isDragging ? "2px solid red" : "1px solid #000",
        outline: isSelected ? "2px dashed blue" : "none",
        outlineOffset: 2,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDragging ? "grabbing" : "pointer",
        userSelect: "none",
        pointerEvents: "auto",
      }}
      {...rest}
    >
      {node.id}
    </div>
  );
};

export default React.memo(NodeComponent);
