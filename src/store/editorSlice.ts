import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { Edge, MapOrientation, Node, Viewport } from "../types";
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from "../constants";

interface EditorState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeIds: Array<string>;
  selectedEdgeIds: Array<string>;
  viewport: Viewport;
  mapOrientation: MapOrientation;
}

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const initialNodes: Node[] = Array.from({ length: 5 }, (_, i) => ({
  id: `${i + 1}`,
  x:
    SCREEN_WIDTH / 2 -
    2 * (DEFAULT_NODE_WIDTH + 40) +
    i * (DEFAULT_NODE_WIDTH + 40),
  y: SCREEN_HEIGHT / 2,
  width: DEFAULT_NODE_WIDTH,
  height: DEFAULT_NODE_HEIGHT,
}));

const initialState: EditorState = {
  nodes: initialNodes,
  edges: [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "3", to: "4" },
    { from: "4", to: "5" },
  ],
  selectedNodeIds: [],
  selectedEdgeIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  mapOrientation: "top-down",
};

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload;
    },
    addNode: (state, action: PayloadAction<Node>) => {
      state.nodes.push(action.payload);
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
    addEdge: (state, action: PayloadAction<Edge>) => {
      state.edges.push(action.payload);
    },
    setSelectedNodeIds: (state, action: PayloadAction<Array<string>>) => {
      state.selectedNodeIds = action.payload;
    },
    setSelectedEdgeIds: (state, action: PayloadAction<Array<string>>) => {
      state.selectedEdgeIds = action.payload;
    },
    updateEdge: (state, action: PayloadAction<Edge>) => {
      const index = state.edges.findIndex(
        (e) => e.from === action.payload.from && e.to === action.payload.to
      );
      if (index !== -1) {
        state.edges[index] = { ...state.edges[index], ...action.payload };
      }
    },
    updateNode: (state, action: PayloadAction<Partial<Node> & { id: string }>) => {
      const index = state.nodes.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.nodes[index] = { ...state.nodes[index], ...action.payload };
      }
    },
    setViewport: (state, action: PayloadAction<Partial<Viewport>>) => {
      state.viewport = { ...state.viewport, ...action.payload };
    },
    setMapOrientation: (state, action: PayloadAction<MapOrientation>) => {
      state.mapOrientation = action.payload;
    },
  },
});

export const {
  setNodes,
  addNode,
  addEdge,
  setSelectedNodeIds,
  setSelectedEdgeIds,
  updateEdge,
  updateNode,
  setViewport,
  setEdges,
  setMapOrientation,
} = editorSlice.actions;

// Selectors
export const selectNodes = (state: RootState) => state.editor.nodes;
export const selectEdges = (state: RootState) => state.editor.edges;
export const selectSelectedNodeIds = (state: RootState) =>
  state.editor.selectedNodeIds;
export const selectSelectedEdgeIds = (state: RootState) =>
  state.editor.selectedEdgeIds;
export const selectViewport = (state: RootState) => state.editor.viewport;
export const selectMapOrientation = (state: RootState) =>
  state.editor.mapOrientation;

export default editorSlice.reducer;
