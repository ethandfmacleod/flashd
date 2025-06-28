// lib/trpc.ts - Updated tRPC client configuration
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import { AppRouter } from '../../api/src/routers/index'
import { authClient } from './auth'; // Import your auth client

export const trpc = createTRPCReact<AppRouter>()

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  return process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        retry: (failureCount, error) => {
          if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
            return false
          }
          return failureCount < 3
        },
      },
    },
  }))

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/trpc`,
          headers() {
            const headers = new Map<string, string>()
            try {
              const cookies = authClient.getCookie()
              if (cookies) {
                headers.set('Cookie', cookies)
              }
            } catch (error) {
              console.warn('Failed to get auth cookie:', error)
            }

            return Object.fromEntries(headers)
          },
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}