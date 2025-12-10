import React, { useMemo } from "react";
import type { Node } from "../types";
import { getRectCenterLeft, getRectCenterRight } from "../utils";
import { NODE_HEIGHT, NODE_WIDTH } from "../constants";

interface EdgeComponentProps {
  fromNode: Node;
  toNode: Node;
}

function EdgeComponent({ fromNode, toNode }: EdgeComponentProps) {
  const from = getRectCenterRight(
    fromNode.x,
    fromNode.y,
    NODE_WIDTH,
    NODE_HEIGHT
  );
  const to = getRectCenterLeft(toNode.x, toNode.y, NODE_HEIGHT);

  // Define the length of the straight lines at the start and end
  const straightLineLength = 20;

  // Calculate the horizontal distance for a stronger curve
  const dx = Math.abs(to.cx - from.cx);
  const curveStrength = Math.max(dx / 2, 50);

  // Define points for the path
  const startPoint = `${from.cx} ${from.cy}`;
  const line1End = `${from.cx + straightLineLength} ${from.cy}`;
  const controlPoint1 = `${from.cx + straightLineLength + curveStrength} ${
    from.cy
  }`;
  const controlPoint2 = `${to.cx - straightLineLength - curveStrength} ${
    to.cy
  }`;
  const line2Start = `${to.cx - straightLineLength} ${to.cy}`;
  const endPoint = `${to.cx} ${to.cy}`;

  const pathData = useMemo(() => {
    return `M ${startPoint} L ${line1End} C ${controlPoint1}, ${controlPoint2}, ${line2Start} L ${endPoint}`;
  }, [
    startPoint,
    line1End,
    controlPoint1,
    controlPoint2,
    line2Start,
    endPoint,
  ]);

  return (
    <path
      d={pathData}
      stroke="black"
      strokeWidth={2}
      fill="none"
      markerEnd="url(#triangle)"
    />
  );
}

export default React.memo(EdgeComponent, (prev, next) => {
  return (
    prev.fromNode.x === next.fromNode.x &&
    prev.fromNode.y === next.fromNode.y &&
    prev.toNode.x === next.toNode.x &&
    prev.toNode.y === next.toNode.y
  );
});
