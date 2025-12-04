import { useEffect, useMemo, useRef, useState } from "react";
import EdgeComponent from "./components/EdgeComponent";
import NodeComponent from "./components/NodeComponent";
import {
  InputGroup,
  PositionDisplay,
  RootContainer,
  SVGContainer,
  UIContainer,
  WorldContainer,
} from "./styled";
import type { Edge, Node, Viewport } from "./types";
import { screenToWorld } from "./utils";

const initialNodes: Node[] = [
  { id: "1", x: 100, y: 100 },
  { id: "2", x: 300, y: 100 },
];

const initialEdges: Edge[] = [{ from: "1", to: "2" }];

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

  const [newNodeId, setNewNodeId] = useState("");
  const [fromNode, setFromNode] = useState("");
  const [toNode, setToNode] = useState("");

  const draggedNode = useMemo(() => {
    if (!draggedNodeId) return null;
    return nodeMap.get(draggedNodeId);
  }, [draggedNodeId, nodeMap]);

  const handleAddNode = () => {
    if (!newNodeId.trim()) {
      alert("Node ID cannot be empty.");
      return;
    }
    if (nodeMap.has(newNodeId)) {
      alert(`Node with ID "${newNodeId}" already exists.`);
      return;
    }

    const screenCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const worldPos = screenToWorld(screenCenter.x, screenCenter.y, viewport);

    const newNode: Node = { id: newNodeId, x: worldPos.x, y: worldPos.y };
    setNodes((prev) => [...prev, newNode]);
    setNewNodeId("");
  };

  const handleAddEdge = () => {
    if (!fromNode || !toNode) {
      alert("Please specify both 'from' and 'to' nodes.");
      return;
    }
    if (!nodeMap.has(fromNode) || !nodeMap.has(toNode)) {
      alert("One or both nodes do not exist.");
      return;
    }
    if (edges.some((edge) => edge.from === fromNode && edge.to === toNode)) {
      alert("This edge already exists.");
      return;
    }
    setEdges((prev) => [...prev, { from: fromNode, to: toNode }]);
    setFromNode("");
    setToNode("");
  };

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
      if (draggedNodeId) return;
      if (e.button === 1 || e.button === 2) {
        setIsPanning(true);
        panStart.current = { x: e.pageX - viewport.x, y: e.pageY - viewport.y };
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [draggedNodeId, viewport.x, viewport.y]);

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
      const mouseWorld = screenToWorld(e.pageX, e.pageY, viewport);
      setViewport((prev) => {
        const newZoom = Math.min(
          3,
          Math.max(0.3, prev.zoom * (1 - e.deltaY * 0.001))
        );
        return {
          zoom: newZoom,
          x: e.pageX - mouseWorld.x * newZoom,
          y: e.pageY - mouseWorld.y * newZoom,
        };
      });
    }
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, [viewport]);

  return (
    <RootContainer>
      <UIContainer>
        <InputGroup>
          <input
            type="text"
            placeholder="New Node ID"
            value={newNodeId}
            onChange={(e) => setNewNodeId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNode()}
          />
          <button onClick={handleAddNode}>Add Node</button>
        </InputGroup>
        <InputGroup>
          <input
            type="text"
            placeholder="From Node ID"
            value={fromNode}
            onChange={(e) => setFromNode(e.target.value)}
          />
          <input
            type="text"
            placeholder="To Node ID"
            value={toNode}
            onChange={(e) => setToNode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddEdge()}
          />
          <button onClick={handleAddEdge}>Add Edge</button>
        </InputGroup>
      </UIContainer>

      {draggedNode && (
        <PositionDisplay>
          {draggedNode.id}: ({draggedNode.x.toFixed(0)},{" "}
          {draggedNode.y.toFixed(0)})
        </PositionDisplay>
      )}
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
