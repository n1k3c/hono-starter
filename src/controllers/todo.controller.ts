import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  CreateTodoSchema,
  UpdateTodoSchema,
  TodoResponseSchema,
} from '../schemas/todo.schema.js'
import { todoService } from '../services/todo.service.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

type AuthEnv = {
  Variables: {
    user: { id: string; name: string; email: string }
    session: { id: string; userId: string; token: string; expiresAt: Date }
  }
}

export const todoController = new OpenAPIHono<AuthEnv>()

todoController.use('/*', authMiddleware)

todoController.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['Todos'],
    summary: 'Create a new todo',
    request: {
      body: {
        content: { 'application/json': { schema: CreateTodoSchema } },
      },
    },
    responses: {
      201: {
        description: 'Todo created',
        content: { 'application/json': { schema: TodoResponseSchema } },
      },
      400: { description: 'Invalid input' },
      401: { description: 'Unauthorized' },
    },
  }),
  async (c) => {
    const input = c.req.valid('json')
    const user = c.get('user')
    const result = await todoService.create(input, user.id)
    return c.json(result, 201)
  },
)

todoController.openapi(
  createRoute({
    method: 'patch',
    path: '/{id}',
    tags: ['Todos'],
    summary: 'Update a todo',
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: { 'application/json': { schema: UpdateTodoSchema } },
      },
    },
    responses: {
      200: {
        description: 'Todo updated',
        content: { 'application/json': { schema: TodoResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      404: { description: 'Todo not found' },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const input = c.req.valid('json')
    const user = c.get('user')
    const result = await todoService.update(id, input, user.id)
    return c.json(result, 200)
  },
)

todoController.openapi(
  createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Todos'],
    summary: 'Delete a todo',
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      200: {
        description: 'Todo deleted',
        content: { 'application/json': { schema: TodoResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      404: { description: 'Todo not found' },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const user = c.get('user')
    const result = await todoService.delete(id, user.id)
    return c.json(result, 200)
  },
)
