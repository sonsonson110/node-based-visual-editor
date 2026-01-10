import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
} from "../../../constants";
import {
  addNode,
  selectEdges,
  selectNodes,
  selectSelectedNodeIds,
  selectViewport,
  setEdges,
  setNodes,
  setSelectedEdgeIds,
  setSelectedNodeIds,
  updateNode,
} from "../../../store/editorSlice";
import type { Node } from "../../../types";
import { screenToWorld } from "../../../utils";
import { CheckboxLabel, HeaderRow, Row, StyleRow } from "../styled";
import { CollapsibleSection } from "./CollapsibleSection";

export const NodeGroup: React.FC = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodes);
  const edges = useSelector(selectEdges);
  const viewport = useSelector(selectViewport);
  const selectedNodeIds = useSelector(selectSelectedNodeIds);

  const [newNodeId, setNewNodeId] = useState("");

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  const selectedNodeIdSet = useMemo(
    () => new Set(selectedNodeIds),
    [selectedNodeIds]
  );

  const selectedNode = useMemo(
    () =>
      selectedNodeIds.length > 0
        ? nodes.find((n) => n.id === selectedNodeIds[0])
        : undefined,
    [nodes, selectedNodeIds]
  );

  const displayingNodeStyle = useMemo(() => {
    const defaultStyle = { isDisabled: false };

    if (selectedNodeIds.length === 0 || !selectedNode) {
      return defaultStyle;
    }

    const normalizedStyle = {
      isDisabled: selectedNode.isDisabled ?? defaultStyle.isDisabled,
    };

    if (selectedNodeIds.length === 1) {
      return normalizedStyle;
    }

    const allMatchDisabled = selectedNodeIds.every((nodeId) => {
      const node = nodeMap.get(nodeId);
      return (
        (node?.isDisabled ?? defaultStyle.isDisabled) ===
        normalizedStyle.isDisabled
      );
    });

    return {
      isDisabled: allMatchDisabled
        ? normalizedStyle.isDisabled
        : defaultStyle.isDisabled,
    };
  }, [nodeMap, selectedNode, selectedNodeIds]);

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

  const handleRemoveSelectedNodes = () => {
    const remainingNodes = nodes.filter(
      (node) => !selectedNodeIdSet.has(node.id)
    );
    const remainingEdges = edges.filter(
      (edge) =>
        !selectedNodeIdSet.has(edge.from) && !selectedNodeIdSet.has(edge.to)
    );
    dispatch(setNodes(remainingNodes));
    dispatch(setSelectedNodeIds([]));
    dispatch(setEdges(remainingEdges));
    dispatch(setSelectedEdgeIds([]));
  };

  const handleNodeDisabledChange = (isDisabled: boolean) => {
    selectedNodeIds.forEach((nodeId) => {
      dispatch(updateNode({ id: nodeId, isDisabled }));
    });
  };

  return (
    <CollapsibleSection title="Nodes">
      <Row>
        <input
          type="text"
          placeholder="New Node ID"
          value={newNodeId}
          onChange={(e) => setNewNodeId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddNode()}
          style={{ flex: 1 }}
        />
        <button onClick={handleAddNode}>Add</button>
      </Row>

      <HeaderRow>
        <span>Selected: {selectedNodeIds.length}</span>
        <button
          onClick={handleRemoveSelectedNodes}
          disabled={selectedNodeIds.length === 0}
        >
          Remove
        </button>
      </HeaderRow>
      {selectedNodeIds.length > 0 && (
        <StyleRow>
          <strong>Style</strong>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={displayingNodeStyle.isDisabled}
              onChange={(e) => handleNodeDisabledChange(e.target.checked)}
            />
            Disabled
          </CheckboxLabel>
        </StyleRow>
      )}
    </CollapsibleSection>
  );
};
