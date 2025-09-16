import { createSlice } from '@reduxjs/toolkit'

const displayNode= localStorage.getItem('display_node')

const contextSlice = createSlice({
  name: 'graph',
  initialState: {
    displayNode: displayNode
      ? JSON.parse(displayNode)  // 如果存在，从 localStorage 解析
      : ["disease","taxonomy","diet_and_food"],
  },
  reducers: {
    setDisplayNode: (state, action) => {
      state.displayNode = action.payload
      localStorage.setItem('display_node', JSON.stringify(action.payload))  // 更新 localStorage
    },

  }
})


export const { setDisplayNode } = contextSlice.actions
export default contextSlice.reducer
