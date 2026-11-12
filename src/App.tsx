import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Tooltip } from 'radix-ui'
import { router } from './routes'
import { ThemeProvider } from './components/ui/theme'
import { ToastContainer } from './components/ui'
import DevAccentSwitcher from './components/dev/DevAccentSwitcher'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Tooltip.Provider delayDuration={250}>
          <RouterProvider router={router} />
          <ToastContainer />
          {import.meta.env.DEV && <DevAccentSwitcher />}
        </Tooltip.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
