import { configureStore } from '@reduxjs/toolkit'
import menuReducer from './menuSlice'
import contextReducer from './contextSlice'
import globalReducer from './globalSlice'
import graphSlice from './graphSlice'
import userSlice from './userSlice'
import axios from 'axios'
import uiReducer from './ui'
import llmReducer from './llmSlice'
const store = configureStore({
  reducer: {
    menu: menuReducer,
    global: globalReducer,
    context: contextReducer,
    graph: graphSlice,
    user: userSlice,
    ui: uiReducer,
    llm:llmReducer
  },
})

export default store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

store.subscribe(() => {
  const currentBaseURL = store.getState().user.baseURL;
  const authorization = store.getState().user.authorization;
  if (axios.defaults.baseURL !== currentBaseURL) {
    console.log("currentBaseURL: ", currentBaseURL)
    axios.defaults.baseURL = `${currentBaseURL}/brave-api`;
    if(authorization){
      axios.defaults.headers.common['Authorization'] =`Bearer ${authorization}`;
    }

  }
});
