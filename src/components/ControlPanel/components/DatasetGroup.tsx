import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  smallDataset,
  mediumDataset,
  largeDataset,
  stressDataset,
} from "../../../mocks";
import type { MockDataset } from "../../../mocks/types";
import {
  selectNodes,
  selectEdges,
  setNodes,
  setEdges,
  setSelectedNodeIds,
  setSelectedEdgeIds,
  setViewport,
} from "../../../store/editorSlice";
import { CollapsibleSection } from "./CollapsibleSection";
import styled from "styled-components";

const DATASETS: MockDataset[] = [
  smallDataset,
  mediumDataset,
  largeDataset,
  stressDataset,
];

const DatasetInfo = styled.div`
  font-size: 0.75em;
  color: #666;
  margin-top: 2px;
`;

const CurrentInfo = styled.div`
  font-size: 0.75em;
  color: #333;
  padding: 4px;
  background: #f0f0f0;
  border-radius: 3px;
  margin-bottom: 4px;
`;

const DatasetOption = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const DatasetRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const DatasetGroup: React.FC = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodes);
  const edges = useSelector(selectEdges);

  const handleLoadDataset = (dataset: MockDataset) => {
    // Clear selections
    dispatch(setSelectedNodeIds([]));
    dispatch(setSelectedEdgeIds([]));

    // Reset viewport to origin
    dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));

    // Load new data
    dispatch(setNodes(dataset.nodes));
    dispatch(setEdges(dataset.edges));
  };

  return (
    <CollapsibleSection title="Dataset">
      <CurrentInfo>
        Current: {nodes.length} nodes, {edges.length} edges
      </CurrentInfo>
      {DATASETS.map((dataset) => (
        <DatasetOption key={dataset.name}>
          <DatasetRow>
            <span style={{ fontSize: "0.85em" }}>{dataset.name}</span>
            <button onClick={() => handleLoadDataset(dataset)}>Load</button>
          </DatasetRow>
          <DatasetInfo>
            {dataset.expectedMetrics.nodeCount} nodes,{" "}
            {dataset.expectedMetrics.edgeCount} edges
          </DatasetInfo>
        </DatasetOption>
      ))}
    </CollapsibleSection>
  );
};
