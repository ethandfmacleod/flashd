import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { AppRouter } from 'flashd/apps/api/src/routers/index.ts'
import { useState } from 'react'
import { authClient } from './auth'

export const trpc = createTRPCReact<AppRouter>()

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000'
  }
  return process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
          if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
            return false
          }
          if (error instanceof Error && error.message.match(/4[0-9][0-9]/)) {
            return ['408', '429'].some(code => error.message.includes(code))
          }
          return failureCount < 3
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        networkMode: 'offlineFirst',
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
        networkMode: 'offlineFirst',
      },
    },
  }))

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/trpc`,
          headers() {
            const headers: Record<string, string> = {}

            try {
              // Get cookies from better-auth
              const cookies = authClient.getCookie()
              if (cookies) {
                headers['Cookie'] = cookies
              }
            } catch (error) {
              console.warn('Failed to get auth cookie:', error)
            }

            return headers
          },
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            })
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