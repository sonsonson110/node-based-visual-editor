import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  MAP_ORIENTATIONS,
} from "../constants";
import {
  addEdge,
  addNode,
  selectEdges,
  selectMapOrientation,
  selectNodes,
  selectSelectedEdgeIds,
  selectSelectedNodeIds,
  selectViewport,
  setEdges,
  setMapOrientation,
  setNodes,
  updateEdge,
} from "../store/editorSlice";
import { InputGroup, UIContainer } from "../styled";
import type { Node } from "../types";
import { getEdgeId, screenToWorld } from "../utils";

const ControlPanel: React.FC = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodes);
  const edges = useSelector(selectEdges);
  const viewport = useSelector(selectViewport);
  const selectedNodeIds = useSelector(selectSelectedNodeIds);
  const selectedEdgeIds = useSelector(selectSelectedEdgeIds);
  const selectedMapOrientation = useSelector(selectMapOrientation);

  const [newNodeId, setNewNodeId] = useState("");
  const [fromNode, setFromNode] = useState("");
  const [toNode, setToNode] = useState("");

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  const edgeMap = useMemo(
    () => new Map(edges.map((edge) => [getEdgeId(edge.from, edge.to), edge])),
    [edges]
  );

  const selectedNodeIdSet = useMemo(
    () => new Set(selectedNodeIds),
    [selectedNodeIds]
  );

  const selectedEdge = useMemo(
    () =>
      selectedEdgeIds.length > 0
        ? edges.find((e) => `${e.from}->${e.to}` === selectedEdgeIds[0])
        : undefined,
    [edges, selectedEdgeIds]
  );

  const displayingEdgeStyle = useMemo(() => {
    const defaultStyle = { color: "#555555", isAnimated: false };

    // Early return for no selection or missing selectedEdge
    if (selectedEdgeIds.length === 0 || !selectedEdge) {
      return defaultStyle;
    }

    const normalizedStyle = {
      color: selectedEdge.color ?? defaultStyle.color,
      isAnimated: selectedEdge.isAnimated ?? defaultStyle.isAnimated,
    };

    if (selectedEdgeIds.length === 1) {
      return normalizedStyle;
    }

    // Check if all selected edges share the same style
    const allMatchColor = selectedEdgeIds.every((edgeId) => {
      const edge = edgeMap.get(edgeId);
      return (edge?.color ?? defaultStyle.color) === normalizedStyle.color;
    });

    const allMatchAnimation = selectedEdgeIds.every((edgeId) => {
      const edge = edgeMap.get(edgeId);
      return (
        (edge?.isAnimated ?? defaultStyle.isAnimated) ===
        normalizedStyle.isAnimated
      );
    });

    return {
      color: allMatchColor ? normalizedStyle.color : defaultStyle.color,
      isAnimated: allMatchAnimation
        ? normalizedStyle.isAnimated
        : defaultStyle.isAnimated,
    };
  }, [edgeMap, selectedEdge, selectedEdgeIds]);

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

    const newNode: Node = {
      id: newNodeId,
      x: worldPos.x,
      y: worldPos.y,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
    };
    dispatch(addNode(newNode));
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
    dispatch(addEdge({ from: fromNode, to: toNode }));
    setFromNode("");
    setToNode("");
  };

  const handleRemoveSelectedNodes = () => {
    const remainingNodes = nodes.filter(
      (node) => !selectedNodeIdSet.has(node.id)
    );
    const remainingEdges = edges.filter(
      (edge) =>
        !selectedNodeIdSet.has(edge.from) && !selectedNodeIdSet.has(edge.to)
    );
    dispatch(setNodes(remainingNodes));
    dispatch(setEdges(remainingEdges));
  };

  const handleEdgeColorChange = (color: string) => {
    selectedEdgeIds.forEach((edgeId) => {
      const [from, to] = edgeId.split("->");
      dispatch(updateEdge({ from, to, color }));
    });
  };

  const handleEdgeAnimationChange = (isAnimated: boolean) => {
    selectedEdgeIds.forEach((edgeId) => {
      const [from, to] = edgeId.split("->");
      dispatch(updateEdge({ from, to, isAnimated }));
    });
  };

  return (
    <UIContainer onMouseDown={(e) => e.stopPropagation()}>
      {/* Node Controls */}
      <InputGroup>
        <strong>Nodes</strong>
        <div style={{ display: "flex", gap: 5 }}>
          <input
            type="text"
            placeholder="New Node ID"
            value={newNodeId}
            onChange={(e) => setNewNodeId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNode()}
            style={{ flex: 1 }}
          />
          <button onClick={handleAddNode}>Add</button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Selected: {selectedNodeIds.length}</span>
          <button
            onClick={handleRemoveSelectedNodes}
            disabled={selectedNodeIds.length === 0}
          >
            Remove
          </button>
        </div>
      </InputGroup>

      <hr style={{ width: "100%", border: "1px solid #ddd", margin: 0 }} />

      {/* Edge Controls */}
      <InputGroup>
        <strong>Edges</strong>
        <div style={{ display: "flex", gap: "5px" }}>
          <input
            type="text"
            placeholder="From"
            value={fromNode}
            onChange={(e) => setFromNode(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="text"
            placeholder="To"
            value={toNode}
            onChange={(e) => setToNode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddEdge()}
            style={{ flex: 1 }}
          />
          <button onClick={handleAddEdge}>Add</button>
        </div>
        <span>Selected: {selectedEdgeIds.length}</span>
        {selectedEdgeIds.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              marginTop: "5px",
            }}
          >
            <strong>Style</strong>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <label>Color:</label>
              <input
                type="color"
                value={displayingEdgeStyle.color}
                onChange={(e) => handleEdgeColorChange(e.target.value)}
              />
            </div>
            <label
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <input
                type="checkbox"
                checked={displayingEdgeStyle.isAnimated}
                onChange={(e) => handleEdgeAnimationChange(e.target.checked)}
              />
              Animated
            </label>
          </div>
        )}
      </InputGroup>

      <hr style={{ width: "100%", border: "1px solid #ddd", margin: 0 }} />

      {/* Orientation Controls */}
      <InputGroup>
        <strong>Orientation</strong>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {MAP_ORIENTATIONS.map((orientation) => (
            <label
              key={orientation}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="mapOrientation"
                value={orientation}
                checked={selectedMapOrientation === orientation}
                onChange={() => dispatch(setMapOrientation(orientation))}
              />
              <span style={{ marginLeft: "4px" }}>{orientation}</span>
            </label>
          ))}
        </div>
      </InputGroup>
    </UIContainer>
  );
};

export default ControlPanel;
