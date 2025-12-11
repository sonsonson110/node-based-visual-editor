import React, { useMemo } from "react";
import { MINIMAP_HEIGHT, MINIMAP_WIDTH } from "../constants";
import { useAppSelector } from "../hooks";
import { useMinimap } from "../hooks/useMinimap";
import { selectSelectedNodeIds } from "../store/editorSlice";
import { getRectCenter } from "../utils";

type MinimapProps = React.HTMLProps<HTMLDivElement>;

function Minimap(props: MinimapProps) {
  const selectedNodeIds = useAppSelector(selectSelectedNodeIds);
  const { minimapNodes, edges, minimapNodeMap, viewportIndicator } =
    useMinimap();

  const selectedNodeIdSet = useMemo(
    () => new Set(selectedNodeIds),
    [selectedNodeIds]
  );

  const renderMinimapNodes = () =>
    edges.map((edge) => {
      const fromNode = minimapNodeMap.get(edge.from);
      const toNode = minimapNodeMap.get(edge.to);

      if (!fromNode || !toNode) return null;
      const fromPos = getRectCenter(
        fromNode.x,
        fromNode.y,
        fromNode.miniWidth,
        fromNode.miniHeight
      );
      const toPos = getRectCenter(
        toNode.x,
        toNode.y,
        toNode.miniWidth,
        toNode.miniHeight
      );
      return (
        <line
          key={`${edge.from}->${edge.to}`}
          x1={fromPos.cx}
          y1={fromPos.cy}
          x2={toPos.cx}
          y2={toPos.cy}
          stroke="#999"
          strokeWidth="1"
        />
      );
    });

  const renderMinimapEdges = () =>
    minimapNodes.map((node) => {
      const isSelected = selectedNodeIdSet.has(node.id);
      return (
        <rect
          key={node.id}
          x={node.x}
          y={node.y}
          width={node.miniWidth}
          height={node.miniHeight}
          fill={isSelected ? "#0000FF" : "#666"}
        />
      );
    });

  return (
    <div {...props}>
      <div
        style={{
          width: MINIMAP_WIDTH,
          height: MINIMAP_HEIGHT,
          border: "1px solid black",
          background: "rgba(255, 255, 255, 0.8)",
          overflow: "hidden",
          userSelect: "none",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${MINIMAP_WIDTH} ${MINIMAP_HEIGHT}`}
          style={{ display: "block" }}
        >
          {renderMinimapNodes()}
          {renderMinimapEdges()}

          <rect
            x={viewportIndicator.x}
            y={viewportIndicator.y}
            width={viewportIndicator.width}
            height={viewportIndicator.height}
            stroke="#e24a4a"
            fill="#e24a4a"
            fillOpacity={0.1}
          />
        </svg>
      </div>
    </div>
  );
}

export default Minimap;
