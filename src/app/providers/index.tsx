import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'

/**
 * Retrying a 401 is pointless — the session token is injected once at page load,
 * so it will still be wrong on the next attempt. Everything else gets one retry.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status = (error as { status?: number }).status
          if (status === 401 || status === 403 || status === 404) return false
          return failureCount < 1
        },
      },
    },
  })
}

export const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  const [client] = useState(makeQueryClient)
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
    </QueryClientProvider>
  )
}
