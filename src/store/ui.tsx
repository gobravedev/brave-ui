// src/store/index.ts
import { configureStore, createSlice } from "@reduxjs/toolkit";

// const filterSlice = createSlice({
//   name: "filter",
//   initialState: {} as Record<string, any>,
//   reducers: {
//     setFilter(state, action) {
//       const { field, value } = action.payload;
//       state[field] = value;
//     },
//   },
// });

const uiSlice = createSlice({
  name: "ui",
  initialState: { panels: {} as Record<string, any>},
  reducers: {
    openPanel(state, action) {
      state.panels[action.payload] = true;
    },
  },
});

// export const { setFilter } = filterSlice.actions;
export const { openPanel } = uiSlice.actions;
export default uiSlice.reducer;

// export const store = configureStore({
//   reducer: {
//     filter: filterSlice.reducer,
//     ui: uiSlice.reducer,
//   },
// });

