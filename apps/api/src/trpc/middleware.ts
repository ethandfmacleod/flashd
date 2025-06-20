import { TRPCError } from '@trpc/server'
import { t } from './utils'

// Auth middleware
export const isAuth = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

// Subscription middleware
export const requireSubscription = (requiredTier: string) =>
  t.middleware(({ next, ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
    }

    const tierHierarchy = ['FREE', 'STUDENT', 'PLUS', 'PRO', 'TEAM']
    const userTierIndex = tierHierarchy.indexOf(ctx.user.subscriptionTier || 'FREE')
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier)

    if (userTierIndex < requiredTierIndex) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `This feature requires ${requiredTier} subscription`,
      })
    }

    return next({ ctx })
  })
