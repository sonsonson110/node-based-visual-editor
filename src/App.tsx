import { useMemo, useRef } from "react";
import ControlPanel from "./components/ControlPanel";
import EdgeComponent from "./components/EdgeComponent";
import Minimap from "./components/Minimap";
import NodeComponent from "./components/NodeComponent";
import SelectionBox from "./components/SelectionBox";
import { GRID_SIZE } from "./constants";
import { useAppDispatch, useAppSelector, useMapInteraction } from "./hooks";
import {
  selectEdges,
  selectMapOrientation,
  selectNodes,
  selectSelectedEdgeIds,
  selectSelectedNodeIds,
  selectViewport,
  setSelectedEdgeIds,
  setSelectedNodeIds,
  updateEdge,
} from "./store/editorSlice";
import {
  PositionDisplay,
  RootContainer,
  SVGContainer,
  WorldContainer,
} from "./styled";
import { getEdgeId } from "./utils";

function App() {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const viewport = useAppSelector(selectViewport);
  const selectedNodeIds = useAppSelector(selectSelectedNodeIds);
  const selectedEdgeIds = useAppSelector(selectSelectedEdgeIds);
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

  const selectedEdgeIdSet = useMemo(
    () => new Set(selectedEdgeIds),
    [selectedEdgeIds]
  );

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  const draggedNode = useMemo(() => {
    if (!draggedNodeId) return null;
    return nodeMap.get(draggedNodeId);
  }, [draggedNodeId, nodeMap]);

  const handleEdgeClick = (e: React.MouseEvent, edgeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      if (selectedEdgeIdSet.has(edgeId)) {
        dispatch(
          setSelectedEdgeIds(selectedEdgeIds.filter((id) => id !== edgeId))
        );
      } else {
        dispatch(setSelectedEdgeIds([...selectedEdgeIds, edgeId]));
      }
    } else {
      dispatch(setSelectedEdgeIds([edgeId]));
      dispatch(setSelectedNodeIds([]));
    }
  };

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
          {edges.map((edge) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;
            const edgeId = getEdgeId(edge.from, edge.to);

            return (
              <EdgeComponent
                key={edgeId}
                fromNode={fromNode}
                toNode={toNode}
                orientation={mapOrientation}
                isSelected={selectedEdgeIdSet.has(edgeId)}
                onClick={(e) => handleEdgeClick(e, edgeId)}
                color={edge.color}
                isAnimated={edge.isAnimated}
                label={edge.label}
                onLabelChange={(newLabel) =>
                  dispatch(
                    updateEdge({
                      from: edge.from,
                      to: edge.to,
                      label: newLabel,
                    })
                  )
                }
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
              e.stopPropagation();
              handleNodeMouseDown(e.pageX, e.pageY, node.id, e.shiftKey);
            }}
            onResizeMouseDown={(e) => handleResizeMouseDown(e, node.id)}
          />
        ))}
      </WorldContainer>
      <SelectionBox selectionBox={selectionBox} />
      <Minimap />
    </RootContainer>
  );
}

export default App;
