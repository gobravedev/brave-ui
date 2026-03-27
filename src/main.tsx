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
import { sseClient } from "./sse"; // ⚡ 在 App 加载时自动创建 SSE
import { registerLLMActions } from "./llmv2/registerHandlers";
registerLLMActions(sseClient);

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
