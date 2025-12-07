import { useMemo, useRef, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import EdgeComponent from "./components/EdgeComponent";
import NodeComponent from "./components/NodeComponent";
import { useAppSelector, useMapInteraction } from "./hooks";
import {
  selectDraggedNodeId,
  selectEdges,
  selectNodes,
  selectSelectedNodeIds,
  selectViewport,
} from "./store/editorSlice";
import {
  PositionDisplay,
  RootContainer,
  SVGContainer,
  WorldContainer,
} from "./styled";
import { type SelectionBoxMeta } from "./types";
import SelectionBox from "./components/SelectionBox";

function App() {
  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const viewport = useAppSelector(selectViewport);
  const draggedNodeId = useAppSelector(selectDraggedNodeId);
  const selectedNodeIds = useAppSelector(selectSelectedNodeIds);

  // UI gesture state
  const [selectionBox, setSelectionBox] = useState<SelectionBoxMeta | null>(
    null
  );

  const worldContainerRef = useRef<HTMLDivElement>(null);

  const { handleNodeMouseDown, handleNodeSelect } = useMapInteraction({
    worldContainerRef,
    selectionBox,
    setSelectionBox,
  });

  const selectedNodeIdSet = useMemo(
    () => new Set(selectedNodeIds),
    [selectedNodeIds]
  );

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  const draggedNode = useMemo(() => {
    if (!draggedNodeId) return null;
    return nodeMap.get(draggedNodeId);
  }, [draggedNodeId, nodeMap]);

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
        ref={worldContainerRef}
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
            isSelected={selectedNodeIdSet.has(node.id)}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              handleNodeMouseDown(e.pageX, e.pageY, node);
              handleNodeSelect(node.id, e.shiftKey);
            }}
          />
        ))}
      </WorldContainer>
      <SelectionBox selectionBox={selectionBox} />
    </RootContainer>
  );
}

export default App;
