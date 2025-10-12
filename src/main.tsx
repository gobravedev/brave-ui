import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import axios from 'axios';
import store from './store'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import { SSEProvider } from './context/sse/SSEProvider.tsx'

console.log(import.meta.env.MODE)
const baseURL = localStorage.getItem('baseURL') || ""
axios.defaults.baseURL = `${baseURL}/brave-api`;
const authorization = localStorage.getItem('authorization')
if (authorization) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${authorization}`;

}
axios.defaults.timeout = 5000;

createRoot(document.getElementById('root')!).render(
  // <StrictMode>

  // </StrictMode>
  // <ConfigProvider>
  <Provider store={store}>
    <SSEProvider>
      <App />
    </SSEProvider>
  </Provider>
  // </ConfigProvider>



)
