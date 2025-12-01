import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Node } from "./types";
import NodeComponent from "./components/NodeComponent";

const initialNodes: Node[] = [
  { id: "Node1", x: 100, y: 100 },
  { id: "Node2", x: 300, y: 100 },
];

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
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
