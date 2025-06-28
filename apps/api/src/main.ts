import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import fastify from 'fastify';
import { auth } from 'src/lib/auth';
import { AppRouter, appRouter } from './routers';
import { createContext } from './trpc/context';

const server = fastify({ 
  maxParamLength: 5000,
  logger: true
})

server.register(import('@fastify/cors'), {
  origin: true,
  credentials: true
})

server.all('/api/auth/*', async (request, reply) => {
  const protocol = request.headers['x-forwarded-proto'] || 'http'
  const host = request.headers.host
  const fullUrl = `${protocol}://${host}${request.url}`
  
  const authRequest = new Request(fullUrl, {
    method: request.method,
    headers: request.headers as any,
    body: request.method !== 'GET' && request.method !== 'HEAD' 
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
    onError({ path, error }) {
      console.error(`Error in tRPC handler on path '${path}':`, error)
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
})

;(async () => {
  try {
    await server.listen({ port: 3000 })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
})()