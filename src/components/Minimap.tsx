import React, { useEffect, useMemo, useRef, useState } from "react";
import { MINIMAP_HEIGHT, MINIMAP_WIDTH } from "../constants";
import { useAppSelector, useMinimap } from "../hooks";
import {
  selectSelectedEdgeIds,
  selectSelectedNodeIds,
} from "../store/editorSlice";
import { getEdgeId, getRectCenter } from "../utils";

type MinimapProps = React.HTMLProps<HTMLDivElement>;

function Minimap(props: MinimapProps) {
  const selectedNodeIds = useAppSelector(selectSelectedNodeIds);
  const selectedEdgeIds = useAppSelector(selectSelectedEdgeIds);
  const {
    minimapNodes,
    edges,
    minimapNodeMap,
    viewportIndicator,
    updateViewportFromMinimap,
  } = useMinimap();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const selectedNodeIdSet = useMemo(
    () => new Set(selectedNodeIds),
    [selectedNodeIds]
  );

  const selectedEdgeIdSet = useMemo(
    () => new Set(selectedEdgeIds),
    [selectedEdgeIds]
  );

  const renderMinimapEdges = () =>
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
      const edgeId = getEdgeId(edge.from, edge.to);
      const isSelected = selectedEdgeIdSet.has(edgeId);
      return (
        <line
          key={`${edge.from}->${edge.to}`}
          x1={fromPos.cx}
          y1={fromPos.cy}
          x2={toPos.cx}
          y2={toPos.cy}
          stroke={isSelected ? "#0000FF" : "#666"}
          strokeWidth={isSelected ? 3 : 1}
        />
      );
    });

  const renderMinimapNodes = () =>
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

  // Handle mouse down to start dragging or jump to position
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    e.stopPropagation(); // Prevent interacting with the world behind
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicked inside the viewport indicator
    const isInside =
      mouseX >= viewportIndicator.x &&
      mouseX <= viewportIndicator.x + viewportIndicator.width &&
      mouseY >= viewportIndicator.y &&
      mouseY <= viewportIndicator.y + viewportIndicator.height;

    if (isInside) {
      // Grab at the specific point
      setDragOffset({
        x: mouseX - viewportIndicator.x,
        y: mouseY - viewportIndicator.y,
      });
    } else {
      // Jump to center
      const newX = mouseX - viewportIndicator.width / 2;
      const newY = mouseY - viewportIndicator.height / 2;
      updateViewportFromMinimap(newX, newY);
      // Set offset to center so subsequent drags feel natural
      setDragOffset({
        x: viewportIndicator.width / 2,
        y: viewportIndicator.height / 2,
      });
    }
    setIsDragging(true);
  };

  useEffect(() => {
    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - dragOffset.x;
        const newY = mouseY - dragOffset.y;

        updateViewportFromMinimap(newX, newY);
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (rafId) cancelAnimationFrame(rafId);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, updateViewportFromMinimap]);

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
        onMouseDown={handleMouseDown}
        ref={containerRef}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${MINIMAP_WIDTH} ${MINIMAP_HEIGHT}`}
          style={{ display: "block" }}
        >
          {renderMinimapEdges()}
          {renderMinimapNodes()}

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
