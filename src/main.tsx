import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import axios from 'axios';
import store from './store'
import { Provider } from 'react-redux'
import { ConfigProvider, message } from 'antd'
import { SSEProvider } from './context/sse/SSEProvider.tsx'
import { useGlobalMessage } from './hooks/useGlobalMessage.ts'

console.log(import.meta.env.MODE)
const baseURL = localStorage.getItem('baseURL') || ""
axios.defaults.baseURL = `${baseURL}/brave-api`;
const authorization = localStorage.getItem('authorization')
if (authorization) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${authorization}`;

}
axios.defaults.timeout = 5000;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // console.log(error)
    const message = useGlobalMessage();

    if (error.response) {

      const { status,data } = error.response;
      switch (status) {
        // case 401:
        //   window.location.href = "/login";
        //   break;
        default:
          console.error("HTTP Error:", status);
          console.error(data?.detail)
          message.error(data?.detail)
      }
    } else {
      console.error("网络异常:", error.message);
    }
    return Promise.reject(error);
  }
);

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
