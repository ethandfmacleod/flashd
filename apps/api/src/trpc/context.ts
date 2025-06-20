import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '../lib/auth'
import { db } from '../lib/db'

export async function createContext({ req, res }: { req: FastifyRequest; res: FastifyReply }) {
  // Better auth session
  const session = await auth.api.getSession({
    headers: req.headers as any,
  })

  return {
    db,
    req,
    res,
    user: session?.user || null,
    session: session?.session || null,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
