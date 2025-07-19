import { router } from '../trpc/utils'
import { authRouter } from './auth'
import { deckRouter } from './deck'

export const appRouter = router({
  auth: authRouter,
  deck: deckRouter,
})

export type AppRouter = typeof appRouter
