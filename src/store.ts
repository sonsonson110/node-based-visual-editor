import { configureStore } from "@reduxjs/toolkit";
import { editorSlice } from "./store/editorSlice";
import { mapUiSlice } from "./store/mapUiSlice";

export const store = configureStore({
  reducer: {
    editor: editorSlice.reducer,
    mapUi: mapUiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
