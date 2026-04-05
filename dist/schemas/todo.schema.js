import { z } from '@hono/zod-openapi';
export const TodoSchema = z
    .object({
    id: z.string().openapi({ example: '1' }),
    text: z.string().openapi({ example: 'Learn Hono' }),
})
    .openapi('Todo');
export const CreateTodoSchema = z.object({
    text: z.string().min(1).openapi({ example: 'Buy groceries' }),
});
export const TodoListSchema = z.array(TodoSchema);
