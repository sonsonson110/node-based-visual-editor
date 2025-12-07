import React, { useMemo, useState } from "react";
import { InputGroup, UIContainer } from "../styled";
import { useDispatch, useSelector } from "react-redux";
import {
  addEdge,
  addNode,
  selectEdges,
  selectNodes,
  selectViewport,
} from "../store/editorSlice";
import { screenToWorld } from "../utils";
import type { Node } from "../types";

const ControlPanel: React.FC = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodes);
  const edges = useSelector(selectEdges);
  const viewport = useSelector(selectViewport);

  const [newNodeId, setNewNodeId] = useState("");
  const [fromNode, setFromNode] = useState("");
  const [toNode, setToNode] = useState("");

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

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

  return (
    <UIContainer onMouseDown={(e) => e.stopPropagation()}>
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
  );
};

export default ControlPanel;
