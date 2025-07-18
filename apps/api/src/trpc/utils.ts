import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context'

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error ? error.cause : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware
