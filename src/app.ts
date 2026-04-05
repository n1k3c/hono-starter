import { OpenAPIHono } from '@hono/zod-openapi'
import { basicAuth } from 'hono/basic-auth'
import { cors } from 'hono/cors'
import { Scalar } from '@scalar/hono-api-reference'
import { todoController } from './controllers/todo.controller.js'
import { authController } from './controllers/auth.controller.js'

const app = new OpenAPIHono()

app.use(
  '/api/*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Cookie', 'Authorization'],
  }),
)

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
  tags: [{ name: 'Todos', description: 'Todo management' }],
})

const docsUsername = process.env.DOCS_USERNAME
const docsPassword = process.env.DOCS_PASSWORD
if (!docsUsername || !docsPassword) {
  throw new Error('DOCS_USERNAME and DOCS_PASSWORD env vars are required')
}

app.use(
  '/api/v1/docs',
  basicAuth({
    username: docsUsername,
    password: docsPassword,
  }),
)

app.get(
  '/api/v1/docs',
  Scalar({ url: '/api/v1/openapi.json' }),
)

export default app
