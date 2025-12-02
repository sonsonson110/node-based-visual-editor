import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Edge, Node } from "./types";
import NodeComponent from "./components/NodeComponent";
import { getNodeCenter } from "./utils";

const initialNodes: Node[] = [
  { id: "Node1", x: 100, y: 100 },
  { id: "Node2", x: 300, y: 100 },
];

const initialEdges: Edge[] = [{ from: "Node1", to: "Node2" }];

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [draggedNodeId, setDraggedNodeId] = React.useState<string | null>(null);
  const offset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (draggedNodeId) {
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === draggedNodeId
              ? {
                  ...node,
                  x: e.pageX - offset.current.x,
                  y: e.pageY - offset.current.y,
                }
              : node
          )
        );
      }
    }
    function handleMouseUp() {
      setDraggedNodeId(null);
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedNodeId]);

  const handleSetDraggedNodeId = useCallback((id: string | null) => {
    setDraggedNodeId(id);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f0f0f0",
        position: "relative",
        overflow: "auto",
      }}
    >
      <svg style={{ position: "absolute", width: "100%", height: "100%" }}>
        {edges.map((edge, i) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const { cx: x1, cy: y1 } = getNodeCenter(fromNode);
          const { cx: x2, cy: y2 } = getNodeCenter(toNode);

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1} ${x2} ${y2}`}
              stroke="black"
              strokeWidth={2}
              fill="none"
            />
          );
        })}
      </svg>
      {nodes.map((node) => (
        <NodeComponent
          key={node.id}
          node={node}
          setDraggedNodeId={handleSetDraggedNodeId}
          offset={offset}
          isDragging={draggedNodeId === node.id}
        />
      ))}
    </div>
  );
}

export default App;
