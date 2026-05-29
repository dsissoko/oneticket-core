import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'
import { queryClient } from './lib/query-client'
import './styles/globals.css'

// MSW setup with dev-only guard
async function initializeApp() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    try {
      await worker.start({
        onUnhandledRequest: 'warn',
      })
    } catch (error) {
      console.error('Failed to start MSW:', error)
    }
  }

  // Mount React application
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>,
  )
}

initializeApp().catch((error) => {
  console.error('Application initialization failed:', error)
})
