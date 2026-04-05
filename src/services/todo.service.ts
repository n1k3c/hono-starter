import type { Todo, CreateTodoInput } from '../schemas/todo.schema.js'
import { NotFoundError } from '../exceptions/http-exceptions.js'

const defaultTodos: Todo[] = [
  { id: '1', text: 'Learn Hono' },
  { id: '2', text: 'Build an API' },
]

let todos: Todo[] = [...defaultTodos]
let nextId = 3

export const todoService = {
  getAll(): Todo[] {
    return todos
  },

  reset() {
    todos = [...defaultTodos]
    nextId = 3
  },

  getById(id: string): Todo {
    const todo = todos.find((t) => t.id === id)
    if (!todo) throw new NotFoundError('Todo')
    return todo
  },

  create(input: CreateTodoInput): Todo {
    const todo: Todo = { id: String(nextId++), text: input.text }
    todos.push(todo)
    return todo
  },
}
