import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addEdge,
  selectEdges,
  selectNodes,
  selectSelectedEdgeIds,
  setEdges,
  setSelectedEdgeIds,
  updateEdge,
} from "../../../store/editorSlice";
import { getEdgeId } from "../../../utils";
import {
  CheckboxLabel,
  ColorLabel,
  HeaderRow,
  Row,
  StyleRow,
} from "../styled";
import { CollapsibleSection } from "./CollapsibleSection";

export const EdgeGroup: React.FC = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodes);
  const edges = useSelector(selectEdges);
  const selectedEdgeIds = useSelector(selectSelectedEdgeIds);

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

  const selectedEdge = useMemo(
    () =>
      selectedEdgeIds.length > 0
        ? edges.find((e) => `${e.from}->${e.to}` === selectedEdgeIds[0])
        : undefined,
    [edges, selectedEdgeIds]
  );

  const displayingEdgeStyle = useMemo(() => {
    const defaultStyle = { color: "#555555", isAnimated: false };

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

  const handleRemoveSelectedEdges = () => {
    const remainingEdges = edges.filter(
      (edge) => !selectedEdgeIds.includes(getEdgeId(edge.from, edge.to))
    );
    dispatch(setEdges(remainingEdges));
    dispatch(setSelectedEdgeIds([]));
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
    <CollapsibleSection title="Edges">
      <Row>
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
      </Row>
      <HeaderRow>
        <span>Selected: {selectedEdgeIds.length}</span>
        <button
          onClick={handleRemoveSelectedEdges}
          disabled={selectedEdgeIds.length === 0}
        >
          Remove
        </button>
      </HeaderRow>
      {selectedEdgeIds.length > 0 && (
        <StyleRow>
          <strong>Style</strong>
          <ColorLabel>
            <label>Color:</label>
            <input
              type="color"
              value={displayingEdgeStyle.color}
              onChange={(e) => handleEdgeColorChange(e.target.value)}
            />
          </ColorLabel>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={displayingEdgeStyle.isAnimated}
              onChange={(e) => handleEdgeAnimationChange(e.target.checked)}
            />
            Animated
          </CheckboxLabel>
        </StyleRow>
      )}
    </CollapsibleSection>
  );
};
