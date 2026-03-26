import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LLMState {
    bizType:string;
    bizId:string;
}
const llmSlice = createSlice({
  name: "llm",
  initialState: { 
    bizType:"default",
    bizId:""
  },
  reducers: {
    setLLMArgs(state, action:{payload:Partial<LLMState>}) {
        const { bizType, bizId } = action.payload;
        state.bizType = bizType ?? state.bizType;
        state.bizId = bizId ?? state.bizId;
    },
  },
});

// export const { setFilter } = filterSlice.actions;
export const { setLLMArgs } = llmSlice.actions;
export default llmSlice.reducer;