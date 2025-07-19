import type { FastifyRequest } from 'fastify'

/**
 * Converts Fastify headers to Web API Headers object
 * This is required for better-auth which expects Web API Headers
 */
export function fastifyHeadersToWebHeaders(headers: FastifyRequest['headers']): Headers {
  const webHeaders = new Headers()
  
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      const headerValue = Array.isArray(value) ? value.join(', ') : String(value)
      webHeaders.set(key, headerValue)
    }
  })
  
  return webHeaders
}