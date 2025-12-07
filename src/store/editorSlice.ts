import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { Edge, Node, Viewport } from "../types";

interface EditorState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeIds: Array<string>;
  viewport: Viewport;
}

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const initialNodes: Node[] = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * 2 * Math.PI;
  return {
    id: `${i + 1}`,
    x: SCREEN_WIDTH / 2 + 350 * Math.cos(angle),
    y: SCREEN_HEIGHT / 2 + 350 * Math.sin(angle),
  };
});

const initialState: EditorState = {
  nodes: initialNodes,
  edges: [
    { from: "1", to: "2" },
    { from: "1", to: "3" },
    { from: "1", to: "4" },
    { from: "2", to: "5" },
    { from: "2", to: "6" },
    { from: "3", to: "7" },
    { from: "4", to: "8" },
    { from: "5", to: "9" },
    { from: "6", to: "9" },
    { from: "7", to: "10" },
    { from: "8", to: "10" },
    { from: "9", to: "10" },
    { from: "10", to: "1" },
    { from: "3", to: "5" },
    { from: "4", to: "6" },
  ],
  selectedNodeIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
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
    addEdge: (state, action: PayloadAction<Edge>) => {
      state.edges.push(action.payload);
    },
    setSelectedNodeIds: (state, action: PayloadAction<Array<string>>) => {
      state.selectedNodeIds = action.payload;
    },
    setViewport: (state, action: PayloadAction<Partial<Viewport>>) => {
      state.viewport = { ...state.viewport, ...action.payload };
    },
  },
});

export const { setNodes, addNode, addEdge, setSelectedNodeIds, setViewport } =
  editorSlice.actions;

// Selectors
export const selectNodes = (state: RootState) => state.editor.nodes;
export const selectEdges = (state: RootState) => state.editor.edges;
export const selectSelectedNodeIds = (state: RootState) =>
  state.editor.selectedNodeIds;
export const selectViewport = (state: RootState) => state.editor.viewport;

export default editorSlice.reducer;
