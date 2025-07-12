import { createSlice } from '@reduxjs/toolkit'


const globalSlice = createSlice({
  name: 'global',
  initialState: {
    sseData:{},
    setting:{}
  },
  reducers: {
    setSseData: (state, action) => {
      state.sseData = action.payload
    },
    setSetting: (state, action) => {
      state.setting = action.payload
    }
  }
})


export const { setSseData,setSetting } = globalSlice.actions
export default globalSlice.reducer
