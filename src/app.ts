import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { Scalar } from '@scalar/hono-api-reference'
import { todoController } from './controllers/todo.controller.js'
import { authController } from './controllers/auth.controller.js'
import { env } from './lib/env.js'

const app = new OpenAPIHono()

app.use(
  '/api/*',
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Cookie', 'Authorization'],
  }),
)

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  console.error(err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.get('/api/v1/ping', (c) => c.text('pong'))

app.route('/api/v1/auth', authController)
app.route('/api/v1/todos', todoController)

app.doc('/api/v1/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'Hono Starter API',
    version: '1.0.0',
    description: 'A TODO API built with Hono',
  },
  tags: [
    { name: 'Auth', description: 'Authentication' },
    { name: 'Todos', description: 'Todo management' },
  ],
})

app.get(
  '/api/v1/docs',
  Scalar({ url: '/api/v1/openapi.json' }),
)

export default app
