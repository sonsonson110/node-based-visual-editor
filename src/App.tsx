import React, { useEffect, useRef, useState } from "react";

interface Node {
  id: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

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
                  x: e.clientX - offset.current.x,
                  y: e.clientY - offset.current.y,
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

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f0f0f0",
        position: "relative",
      }}
    >
      {nodes.map((node) => (
        <div
          key={node.id}
          style={{
            position: "absolute",
            left: node.x,
            top: node.y,
            width: 80,
            height: 40,
            border: "1px solid #000",
          }}
          onMouseDown={(e) => {
            setDraggedNodeId(node.id);
            offset.current = {
              x: e.clientX - node.x,
              y: e.clientY - node.y,
            };
          }}
        >
          {node.id}
        </div>
      ))}
    </div>
  );
}

export default App;
