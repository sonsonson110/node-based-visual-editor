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
  selectMapOrientation,
} from "./store/editorSlice";
import {
  PositionDisplay,
  RootContainer,
  SVGContainer,
  WorldContainer,
} from "./styled";
import { GRID_SIZE } from "./constants";
import Minimap from "./components/Minimap";

function App() {
  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const viewport = useAppSelector(selectViewport);
  const selectedNodeIds = useAppSelector(selectSelectedNodeIds);
  const mapOrientation = useAppSelector(selectMapOrientation);

  const worldContainerRef = useRef<HTMLDivElement>(null);

  const {
    selectionBox,
    isPanning,
    draggedNodeId,
    resizingNodeId,
    handleNodeMouseDown,
    handleResizeMouseDown,
  } = useMapInteraction({
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
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="3.5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#555" />
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
                orientation={mapOrientation}
              />
            );
          })}
        </SVGContainer>
        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodeIdSet.has(node.id)}
            isResizing={resizingNodeId === node.id}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              handleNodeMouseDown(e.pageX, e.pageY, node.id, e.shiftKey);
            }}
            onResizeMouseDown={(e) => handleResizeMouseDown(e, node.id)}
          />
        ))}
      </WorldContainer>
      <SelectionBox selectionBox={selectionBox} />
      <Minimap
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
        }}
      />
    </RootContainer>
  );
}

export default App;
