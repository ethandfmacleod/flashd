import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify'
import fastify from 'fastify'
import { db } from './lib/db'
import { AppRouter, appRouter } from './routers'
import { createContext } from './trpc/context'

const server = fastify({ maxParamLength: 5000 })

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
    await db.$disconnect()
    process.exit(1)
  }
})()
