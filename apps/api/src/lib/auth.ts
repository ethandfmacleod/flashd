import { expo } from '@better-auth/expo'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
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
    window: 10,
    max: 5,
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
  trustedOrigins: process.env.NODE_ENV !== 'production' 
    ? ["flashd://", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8081", "http://127.0.0.1:8081"]
    : process.env.ALLOWED_ORIGINS?.split(',') || ["flashd://"],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [expo()],
})

export type Auth = typeof auth
