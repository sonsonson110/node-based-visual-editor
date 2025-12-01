import React, { type RefObject } from "react";
import type { Node } from "../types";

interface NodeComponentProps {
  node: Node;
  setDraggedNodeId: (id: string | null) => void;
  offset: RefObject<{ x: number; y: number }>;
  isDragging: boolean;
}

const NodeComponent: React.FC<NodeComponentProps> = ({ node, setDraggedNodeId, offset: offsetRef, isDragging }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: 80,
        height: 40,
        border: isDragging ? "2px solid red" : "1px solid #000",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onMouseDown={(e) => {
        setDraggedNodeId(node.id);
        offsetRef.current = {
          x: e.pageX - node.x,
          y: e.pageY - node.y,
        };
      }}
    >
      {node.id}
    </div>
  );
};

export default React.memo(NodeComponent);