import { configureStore } from '@reduxjs/toolkit'
import menuReducer from './menuSlice'
import contextReducer from './contextSlice'
import  globalReducer from './globalSlice'

const store = configureStore({
  reducer: {
    menu: menuReducer,
    global:globalReducer,
    context:contextReducer
  },
})

export default store
