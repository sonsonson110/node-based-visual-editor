import { useEffect, useMemo, useRef } from "react";
import ControlPanel from "./components/ControlPanel";
import EdgeComponent from "./components/EdgeComponent";
import NodeComponent from "./components/NodeComponent";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  selectDraggedNodeId,
  selectEdges,
  selectIsPanning,
  selectNodes,
  selectViewport,
  setDraggedNodeId,
  setIsPanning,
  setNodes,
  setViewport,
} from "./store/editorSlice";
import {
  PositionDisplay,
  RootContainer,
  SVGContainer,
  WorldContainer,
} from "./styled";
import { screenToWorld } from "./utils";

function App() {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const viewport = useAppSelector(selectViewport);
  const draggedNodeId = useAppSelector(selectDraggedNodeId);
  const isPanning = useAppSelector(selectIsPanning);

  const offset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(null);
  const panStart = useRef({ x: 0, y: 0 });

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  const draggedNode = useMemo(() => {
    if (!draggedNodeId) return null;
    return nodeMap.get(draggedNodeId);
  }, [draggedNodeId, nodeMap]);

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
        dispatch(
          setNodes(
            nodes.map((node) =>
              node.id === draggedNodeId
                ? {
                    ...node,
                    x: worldPos.x - offset.current.x,
                    y: worldPos.y - offset.current.y,
                  }
                : node
            )
          )
        );
      });
    }
    function handleMouseUp() {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      dispatch(setDraggedNodeId(null));
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
  }, [dispatch, draggedNodeId, nodes, viewport]);

  // Panning logic - mousedown handler
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (draggedNodeId) return;
      if (e.button === 1 || e.button === 2) {
        dispatch(setIsPanning(true));
        panStart.current = { x: e.pageX - viewport.x, y: e.pageY - viewport.y };
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [dispatch, draggedNodeId, viewport.x, viewport.y]);

  // Panning logic - mousemove and mouseup handlers
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isPanning) return;
      dispatch(
        setViewport({
          ...viewport,
          x: e.pageX - panStart.current.x,
          y: e.pageY - panStart.current.y,
        })
      );
    }
    function handleMouseUp() {
      dispatch(setIsPanning(false));
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dispatch, isPanning, viewport]);

  // Zooming logic
  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const mouseWorld = screenToWorld(e.pageX, e.pageY, viewport);
      const newZoom = Math.min(
        3,
        Math.max(0.3, viewport.zoom * (1 - e.deltaY * 0.001))
      );
      setViewport({
        zoom: newZoom,
        x: e.pageX - mouseWorld.x * newZoom,
        y: e.pageY - mouseWorld.y * newZoom,
      });
    }
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, [viewport]);

  return (
    <RootContainer>
      <ControlPanel />

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
              dispatch(setDraggedNodeId(node.id));
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
