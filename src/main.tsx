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
import { RenderProvider } from './context/render/RenderProvider.tsx'
import { RegistryProvider } from './core/component-registry/registry-context.tsx'
import { QueryClient, QueryClientProvider } from 'react-query'

console.log(import.meta.env.MODE)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      keepPreviousData: true,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  // <StrictMode>

  // </StrictMode>
  // <ConfigProvider>
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <SSEProvider>
        <RegistryProvider>
          <App />
        </RegistryProvider>
      </SSEProvider>
    </Provider>
  </QueryClientProvider>
  // </ConfigProvider>



)
