import React from "react";
import type { Node } from "../types";
import { NodeResizer } from "../styled";

interface NodeComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  node: Node;
  isDragging: boolean;
  isSelected: boolean;
}

const nodeResizerPositions = [
  "top-left",
  "top-middle",
  "top-right",
  "middle-right",
  "bottom-right",
  "bottom-middle",
  "bottom-left",
  "middle-left",
] as const;

const outlineOffset = 0;

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
        border: "1px solid #000",
        outline: isSelected ? "1px dashed blue" : undefined,
        outlineOffset: outlineOffset,
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
      {!isDragging &&
        isSelected &&
        nodeResizerPositions.map((position) => (
          <NodeResizer
            key={position}
            position={position}
            outlineOffset={outlineOffset}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          />
        ))}
    </div>
  );
};

export default React.memo(NodeComponent);
