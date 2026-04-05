import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { CreateTodoSchema, TodoSchema, TodoListSchema } from '../schemas/todo.schema.js';
import { todoService } from '../services/todo.service.js';
export const todoController = new OpenAPIHono();
const listRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Todos'],
    summary: 'List all todos',
    responses: {
        200: {
            description: 'List of todos',
            content: { 'application/json': { schema: TodoListSchema } },
        },
    },
});
const getRoute = createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Todos'],
    summary: 'Get a todo by ID',
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        200: {
            description: 'Todo found',
            content: { 'application/json': { schema: TodoSchema } },
        },
        404: { description: 'Todo not found' },
    },
});
const createTodoRoute = createRoute({
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
            content: { 'application/json': { schema: TodoSchema } },
        },
        400: { description: 'Invalid input' },
    },
});
todoController.openapi(listRoute, (c) => {
    return c.json(todoService.getAll(), 200);
});
todoController.openapi(getRoute, (c) => {
    const todo = todoService.getById(c.req.valid('param').id);
    return c.json(todo, 200);
});
todoController.openapi(createTodoRoute, (c) => {
    const input = c.req.valid('json');
    const todo = todoService.create(input);
    return c.json(todo, 201);
});
