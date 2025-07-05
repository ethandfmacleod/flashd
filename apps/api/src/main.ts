import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify'
import fastify from 'fastify'
import { auth } from 'src/lib/auth'
import { AppRouter, appRouter } from './routers'
import { createContext } from './trpc/context'

const server = fastify({
  maxParamLength: 5000,
  logger: true,
})

const isDev = process.env.NODE_ENV === 'development'
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

// Dev common origins
const devOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'flashd://',
]

server.register(import('@fastify/cors'), {
  origin: (origin, callback) => {
    // Allow requests with no origin (for mobile build)
    if (!origin) return callback(null, true)

    const allowedList = isDev ? [...allowedOrigins, ...devOrigins] : allowedOrigins

    if (allowedList.includes(origin) || origin.startsWith('flashd://')) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'), false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-forwarded-proto', 'x-forwarded-host'],
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
    onError({ path, error }: { path: string; error: any }) {
      console.error(`Error in tRPC handler on path '${path}':`, error)
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
