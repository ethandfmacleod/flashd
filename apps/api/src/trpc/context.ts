import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '../lib/auth'
import { db } from '../lib/db'
import { fastifyHeadersToWebHeaders } from '../lib/headers'

export async function createContext({ req, res }: { req: FastifyRequest; res: FastifyReply }) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  let session = null

  if (token) {
    session = await auth.api.getSession({
      headers: new Headers({
        authorization: `Bearer ${token}`,
      }),
    })
  } else {
    session = await auth.api.getSession({
      headers: fastifyHeadersToWebHeaders(req.headers),
    })
  }

  return {
    db,
    req,
    res,
    user: session?.user || null,
    session: session?.session || null,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
