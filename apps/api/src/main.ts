import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify'
import 'dotenv/config'
import fastify from 'fastify'
import { auth } from './lib/auth'
import { AppRouter, appRouter } from './routers'
import { createContext } from './trpc/context'

const server = fastify({
  maxParamLength: 5000,
  logger: true,
})

const isDev = process.env.NODE_ENV !== 'production'

const allowedOrigins = isDev
  ? [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'flashd://',
    ]
  : (process.env.ALLOWED_ORIGINS?.split(',') ?? ['flashd://'])

server.register(import('@fastify/cors'), {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    if (origin.startsWith('flashd://')) return callback(null, true)

    console.log('CORS rejected origin:', origin, 'Allowed:', allowedOrigins)
    return callback(new Error('Not allowed by CORS'), false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-forwarded-proto',
    'x-forwarded-host',
    'Cookie',
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200,
})

server.all('/api/auth/*', async (request, reply) => {
  const protocol = request.headers['x-forwarded-proto'] || 'http'
  const host = request.headers.host
  const fullUrl = `${protocol}://${host}${request.url}`

  const authRequest = new Request(fullUrl, {
    method: request.method,
    headers: request.headers as any,
    body:
      request.method !== 'GET' && request.method !== 'HEAD'
        ? JSON.stringify(request.body)
        : undefined,
  })

  const authResponse = await auth.handler(authRequest)

  reply.code(authResponse.status)

  authResponse.headers.forEach((value, key) => {
    reply.header(key, value)
  })

  const responseText = await authResponse.text()
  reply.send(responseText)
})

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
    onError(opts) {
      console.error(`Error in tRPC handler on path '${opts.path}':`, opts.error)
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
})
;(async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
})()
