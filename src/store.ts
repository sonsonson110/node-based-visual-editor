import { configureStore } from "@reduxjs/toolkit";
import { editorSlice } from "./store/editorSlice";

export const store = configureStore({
  reducer: {
    editor: editorSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
