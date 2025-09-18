import { configureStore } from '@reduxjs/toolkit'
import menuReducer from './menuSlice'
import contextReducer from './contextSlice'
import  globalReducer from './globalSlice'
import graphSlice from './graphSlice'
import userSlice from './userSlice'
const store = configureStore({
  reducer: {
    menu: menuReducer,
    global:globalReducer,
    context:contextReducer,
    graph:graphSlice,
    user:userSlice
  },
})

export default store
