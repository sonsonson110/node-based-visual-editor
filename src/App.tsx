import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import EdgeComponent from "./components/EdgeComponent";
import NodeComponent from "./components/NodeComponent";
import type { Edge, Node } from "./types";

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
  const animationFrameRef = useRef<number>(null);

  const nodeMap = useMemo(() => {
    const map = new Map();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!draggedNodeId) return;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
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
      });
    }
    function handleMouseUp() {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setDraggedNodeId(null);
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
        <defs>
          <marker
            id="triangle"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
          </marker>
        </defs>

        {edges.map((edge, i) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;
          return (
            <EdgeComponent
              key={`${edge.from}->${edge.to}`}
              fromNode={fromNode}
              toNode={toNode}
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
