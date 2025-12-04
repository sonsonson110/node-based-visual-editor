import { useEffect, useMemo, useRef, useState } from "react";
import EdgeComponent from "./components/EdgeComponent";
import NodeComponent from "./components/NodeComponent";
import { RootContainer, SVGContainer, WorldContainer } from "./styled";
import type { Edge, Node, Viewport } from "./types";
import { screenToWorld } from "./utils";

const initialNodes: Node[] = [
  { id: "Node1", x: 100, y: 100 },
  { id: "Node2", x: 300, y: 100 },
  { id: "Node3", x: 400, y: 100 },
  { id: "Node4", x: 200, y: 100 },
];

const initialEdges: Edge[] = [
  { from: "Node1", to: "Node2" },
  { from: "Node2", to: "Node3" },
  { from: "Node2", to: "Node4" },
];

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [isPanning, setIsPanning] = useState(false);

  const offset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(null);
  const panStart = useRef({ x: 0, y: 0 });

  const nodeMap = useMemo(() => {
    const map = new Map();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  // Prevent default context menu
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", handler);
    return () => window.removeEventListener("contextmenu", handler);
  }, []);

  // Dragging logic
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!draggedNodeId) return;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const worldPos = screenToWorld(e.pageX, e.pageY, viewport);

      animationFrameRef.current = requestAnimationFrame(() => {
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === draggedNodeId
              ? {
                  ...node,
                  x: worldPos.x - offset.current.x,
                  y: worldPos.y - offset.current.y,
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
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draggedNodeId, viewport]);

  // Panning logic - mousedown handler
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (e.button === 1 || e.button === 2) {
        setIsPanning(true);
        panStart.current = { x: e.pageX - viewport.x, y: e.pageY - viewport.y };
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [viewport.x, viewport.y]);

  // Panning logic - mousemove and mouseup handlers
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isPanning) return;
      setViewport((prev) => ({
        ...prev,
        x: e.pageX - panStart.current.x,
        y: e.pageY - panStart.current.y,
      }));
    }
    function handleMouseUp() {
      setIsPanning(false);
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning]);

  // Zooming logic
  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const mouseX = e.pageX;
      const mouseY = e.pageY;
      setViewport((prev) => {
        const newZoom = Math.min(
          3,
          Math.max(0.3, prev.zoom * (1 - e.deltaY * 0.001))
        );
        const scale = newZoom / prev.zoom;
        return {
          zoom: newZoom,
          x: mouseX - (mouseX - prev.x) * scale,
          y: mouseY - (mouseY - prev.y) * scale,
        };
      });
    }
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <RootContainer>
      <WorldContainer
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        <SVGContainer>
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

          {edges.map((edge) => {
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
        </SVGContainer>
        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isDragging={draggedNodeId === node.id}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              setDraggedNodeId(node.id);
              const worldPos = screenToWorld(e.pageX, e.pageY, viewport);
              offset.current = {
                x: worldPos.x - node.x,
                y: worldPos.y - node.y,
              };
            }}
          />
        ))}
      </WorldContainer>
    </RootContainer>
  );
}

export default App;
