import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on client errors (4xx) — retrying a 429 makes it worse
      retry: (failureCount, error) => {
        const msg = error instanceof Error ? error.message : '';
        if (msg.includes('Too Many Requests') || msg.includes('401') || msg.includes('403') || msg.includes('404')) {
          return false;
        }
        return failureCount < 2;
      },
      // Keep data fresh for 30s — avoids redundant refetches when switching tabs
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
