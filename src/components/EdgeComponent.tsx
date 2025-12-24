import React from "react";
import type { Node } from "../types";

interface EdgeComponentProps {
  fromNode: Node;
  toNode: Node;
}

function EdgeComponent({ fromNode, toNode }: EdgeComponentProps) {
  const x1 = fromNode.x + fromNode.width / 2;
  const y1 = fromNode.y + fromNode.height / 2;
  const x2 = toNode.x + toNode.width / 2;
  const y2 = toNode.y + toNode.height / 2;

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="black"
      strokeWidth="2"
    />
  );
}

export default React.memo(EdgeComponent);
