import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Node, Edge, Viewport } from "../types";
import type { RootState } from "../store";
import { NODE_WIDTH } from "../constants";

interface EditorState {
  nodes: Node[];
  edges: Edge[];
  draggedNodeId: string | null;
  viewport: Viewport;
  isPanning: boolean;
}

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const initialState: EditorState = {
  nodes: [
    { id: "1", x: SCREEN_WIDTH / 2 - NODE_WIDTH, y: SCREEN_HEIGHT / 2 },
    { id: "2", x: SCREEN_WIDTH / 2 + NODE_WIDTH, y: SCREEN_HEIGHT / 2 },
  ],
  edges: [{ from: "1", to: "2" }],
  draggedNodeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  isPanning: false,
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
    setDraggedNodeId: (state, action: PayloadAction<string | null>) => {
      state.draggedNodeId = action.payload;
    },
    setViewport: (state, action: PayloadAction<Partial<Viewport>>) => {
      state.viewport = { ...state.viewport, ...action.payload };
    },
    setIsPanning: (state, action: PayloadAction<boolean>) => {
      state.isPanning = action.payload;
    },
  },
});

export const {
  setNodes,
  addNode,
  addEdge,
  setDraggedNodeId,
  setViewport,
  setIsPanning,
} = editorSlice.actions;

// Selectors
export const selectNodes = (state: RootState) => state.editor.nodes;
export const selectEdges = (state: RootState) => state.editor.edges;
export const selectDraggedNodeId = (state: RootState) =>
  state.editor.draggedNodeId;
export const selectViewport = (state: RootState) => state.editor.viewport;
export const selectIsPanning = (state: RootState) => state.editor.isPanning;

export default editorSlice.reducer;
