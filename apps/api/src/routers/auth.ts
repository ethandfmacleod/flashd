import { auth } from '../lib/auth'
import { isAuth } from '../trpc/middleware'
import { publicProcedure, router } from '../trpc/utils'
import { fastifyHeadersToWebHeaders } from '../lib/headers'
import { z } from 'zod'

export const authRouter = router({
  // Get session
  getSession: publicProcedure.query(async ({ ctx }) => {
    return {
      user: ctx.user,
      session: ctx.session,
    }
  }),

  // Sign up
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await auth.api.signUpEmail({
          body: {
            email: input.email,
            password: input.password,
            name: input.name || input.email.split('@')[0],
          },
          headers: fastifyHeadersToWebHeaders(ctx.req.headers),
        })

        return { success: true, user: result.user }
      } catch {
        throw new Error('Failed to create account')
      }
    }),

  // Sign in
  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await auth.api.signInEmail({
          body: {
            email: input.email,
            password: input.password,
          },
          headers: fastifyHeadersToWebHeaders(ctx.req.headers),
        })

        return { success: true, user: result.user }
      } catch {
        throw new Error('Invalid credentials')
      }
    }),

  // Sign out
  signOut: publicProcedure.mutation(async ({ ctx }) => {
    try {
      await auth.api.signOut({
        headers: fastifyHeadersToWebHeaders(ctx.req.headers),
      })

      return { success: true }
    } catch {
      throw new Error('Failed to sign out')
    }
  }),

  // Update profile
  updateProfile: publicProcedure
    .use(isAuth)
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          name: input.name,
          email: input.email,
        },
      })

      return updatedUser
    }),

  // Delete account
  deleteAccount: publicProcedure.use(isAuth).mutation(async ({ ctx }) => {
    await ctx.db.user.delete({
      where: { id: ctx.user.id },
    })

    return { success: true }
  }),
})
