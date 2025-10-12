import { createSlice } from '@reduxjs/toolkit'

const localProject = localStorage.getItem('currenct_project')
// const localNamespace = localStorage.getItem('currenct_namespace')

const contextSlice = createSlice({
  name: 'context',
  initialState: {
    project: localProject
      ? JSON.parse(localProject)  // 如果存在，从 localStorage 解析
      : {
        name: "default",
        project_id: "default",
      },
    // {
    //     name: "default",  // 否则使用默认值
    //     project_id: "default"
    //   },
    // namespace: localNamespace
    // ? JSON.parse(localNamespace)  // 如果存在，从 localStorage 解析
    // : {
    //     name: "default",  // 否则使用默认值
    //     namespaceKey: "default"
    //   },
  },
  reducers: {
    setProject: (state, action) => {
      state.project = action.payload
      localStorage.setItem('currenct_project', JSON.stringify(action.payload))  // 更新 localStorage
    },
    // setNamespace: (state, action) => {
    //   state.namespace = action.payload
    //   localStorage.setItem('currenct_namespace', JSON.stringify(action.payload))  // 更新 localStorage
    // }
  }
})


export const { setProject } = contextSlice.actions
export default contextSlice.reducer
