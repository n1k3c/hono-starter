import { z } from '@hono/zod-openapi';
export const TodoSchema = z
    .object({
    id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    title: z.string().max(256).openapi({ example: 'Learn Hono' }),
    completed: z.boolean().openapi({ example: false }),
    ownerId: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    createdAt: z.coerce.date().openapi({ example: '2026-04-05T00:00:00.000Z' }),
    updatedAt: z.coerce.date().openapi({ example: '2026-04-05T00:00:00.000Z' }),
})
    .openapi('Todo');
export const CreateTodoSchema = z.object({
    id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    title: z.string().max(256).optional().default('New Todo').openapi({ example: 'Buy groceries' }),
});
export const UpdateTodoSchema = z.object({
    title: z.string().max(256).optional().openapi({ example: 'Updated title' }),
    completed: z.boolean().optional().openapi({ example: true }),
});
export const TodoResponseSchema = z.object({
    todo: TodoSchema,
    txid: z.number().openapi({ example: 12345 }),
});
