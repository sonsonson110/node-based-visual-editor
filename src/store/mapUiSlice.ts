import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { MINIMAP_HEIGHT, MINIMAP_WIDTH } from "../constants";

interface TooltipMeta {
  nodeId: string | null;
  x: number;
  y: number;
}

interface MapUiState {
  minimap: {
    isVisible: boolean;
    width: number;
    height: number;
    opacity: number;
  };
  showEdges: boolean;
  tooltip: {
    isVisible: boolean;
    meta: TooltipMeta | null;
  };
}

const initialState: MapUiState = {
  minimap: {
    isVisible: true,
    width: MINIMAP_WIDTH,
    height: MINIMAP_HEIGHT,
    opacity: 0.8,
  },
  showEdges: true,
  tooltip: {
    isVisible: false,
    meta: null,
  },
};

export const mapUiSlice = createSlice({
  name: "mapUi",
  initialState,
  reducers: {
    setMinimapVisible: (state, action: PayloadAction<boolean>) => {
      state.minimap.isVisible = action.payload;
    },
    setMinimapSize: (
      state,
      action: PayloadAction<{ width: number; height: number }>
    ) => {
      state.minimap.width = action.payload.width;
      state.minimap.height = action.payload.height;
    },
    setMinimapOpacity: (state, action: PayloadAction<number>) => {
      state.minimap.opacity = action.payload;
    },
    setShowEdges: (state, action: PayloadAction<boolean>) => {
      state.showEdges = action.payload;
    },
    setTooltip: (state, action: PayloadAction<TooltipMeta>) => {
      state.tooltip.isVisible = true;
      state.tooltip.meta = action.payload;
    },
    hideTooltip: (state) => {
      state.tooltip.isVisible = false;
      state.tooltip.meta = null;
    },
  },
});

export const {
  setMinimapVisible,
  setMinimapSize,
  setMinimapOpacity,
  setShowEdges,
  setTooltip,
  hideTooltip,
} = mapUiSlice.actions;

export const selectMinimapConfig = (state: RootState) => state.mapUi.minimap;
export const selectShowEdges = (state: RootState) => state.mapUi.showEdges;
export const selectTooltip = (state: RootState) => state.mapUi.tooltip;

export default mapUiSlice.reducer;
