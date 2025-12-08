import { useMemo, useRef } from "react";
import ControlPanel from "./components/ControlPanel";
import EdgeComponent from "./components/EdgeComponent";
import NodeComponent from "./components/NodeComponent";
import SelectionBox from "./components/SelectionBox";
import { useAppSelector, useMapInteraction } from "./hooks";
import {
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
import { GRID_SIZE } from "./constants";

function App() {
  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const viewport = useAppSelector(selectViewport);
  const selectedNodeIds = useAppSelector(selectSelectedNodeIds);

  const worldContainerRef = useRef<HTMLDivElement>(null);

  const { selectionBox, isPanning, draggedNodeId, handleNodeMouseDown } =
    useMapInteraction({
      worldContainerRef,
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

  const bgSize = GRID_SIZE * viewport.zoom;
  const majorBgSize = bgSize * 4;

  return (
    <RootContainer
      style={{
        cursor: isPanning ? "move" : "default",
        backgroundSize: `${majorBgSize}px ${majorBgSize}px, ${majorBgSize}px ${majorBgSize}px, ${bgSize}px ${bgSize}px, ${bgSize}px ${bgSize}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
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
              handleNodeMouseDown(e.pageX, e.pageY, node.id, e.shiftKey);
            }}
          />
        ))}
      </WorldContainer>
      <SelectionBox selectionBox={selectionBox} />
    </RootContainer>
  );
}

export default App;
