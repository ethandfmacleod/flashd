import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { apiKey, organization } from 'better-auth/plugins'
import { db } from './db'

// TODO: Set up prod aware config
// TODO: API Key Handling (plugin)
// TODO: Organizations
export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // For development - true in prod
  },

  rateLimit: {
    window: 10, // time window in seconds
    max: 5, // max requests in the window
  },

  socialProviders: {
    github:
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ? {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }
        : undefined,

    google:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }
        : undefined,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 14, // Two weeks
    updateAge: 60 * 60 * 24, // One day
  },

  user: {
    additionalFields: {
      subscriptionTier: {
        type: 'string',
        required: false,
        defaultValue: 'FREE',
      },
      subscriptionStatus: {
        type: 'string',
        required: false,
        defaultValue: 'INACTIVE',
      },
    },
  },

  advanced: {
    generateId: false,
  },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  plugins: [apiKey(), organization()],
})

export type Auth = typeof auth
