import { beforeEach, describe, expect, it } from 'vitest'
import app from './app.js'
import { todoService } from './services/todo.service.js'

beforeEach(() => {
  todoService.reset()
})

describe('GET /api/v1/ping', () => {
  it('returns pong', async () => {
    const res = await app.request('/api/v1/ping')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('pong')
  })
})

describe('GET /api/v1/todos', () => {
  it('returns all todos', async () => {
    const res = await app.request('/api/v1/todos')
    expect(res.status).toBe(200)
    const todos = await res.json()
    expect(todos).toEqual([
      { id: '1', text: 'Learn Hono' },
      { id: '2', text: 'Build an API' },
    ])
  })
})

describe('GET /api/v1/todos/:id', () => {
  it('returns a single todo', async () => {
    const res = await app.request('/api/v1/todos/1')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ id: '1', text: 'Learn Hono' })
  })

  it('returns 404 for non-existent todo', async () => {
    const res = await app.request('/api/v1/todos/999')
    expect(res.status).toBe(404)
  })
})

describe('POST /api/v1/todos', () => {
  it('creates a new todo', async () => {
    const res = await app.request('/api/v1/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Write tests' }),
    })
    expect(res.status).toBe(201)
    const todo = await res.json()
    expect(todo.text).toBe('Write tests')
    expect(todo.id).toBeDefined()
  })

  it('returns 400 for empty text', async () => {
    const res = await app.request('/api/v1/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/v1/docs', () => {
  it('returns 401 without credentials', async () => {
    const res = await app.request('/api/v1/docs')
    expect(res.status).toBe(401)
  })

  it('returns 200 with valid credentials', async () => {
    const credentials = btoa('developer:pass12345')
    const res = await app.request('/api/v1/docs', {
      headers: { Authorization: `Basic ${credentials}` },
    })
    expect(res.status).toBe(200)
  })
})

describe('GET /api/v1/openapi.json', () => {
  it('returns OpenAPI spec', async () => {
    const res = await app.request('/api/v1/openapi.json')
    expect(res.status).toBe(200)
    const spec = await res.json()
    expect(spec.info.title).toBe('Hono Starter API')
    expect(spec.paths).toBeDefined()
  })
})
