import { NotFoundError } from '../exceptions/http-exceptions.js';
const defaultTodos = [
    { id: '1', text: 'Learn Hono' },
    { id: '2', text: 'Build an API' },
];
let todos = [...defaultTodos];
let nextId = 3;
export const todoService = {
    getAll() {
        return todos;
    },
    reset() {
        todos = [...defaultTodos];
        nextId = 3;
    },
    getById(id) {
        const todo = todos.find((t) => t.id === id);
        if (!todo)
            throw new NotFoundError('Todo');
        return todo;
    },
    create(input) {
        const todo = { id: String(nextId++), text: input.text };
        todos.push(todo);
        return todo;
    },
};
